import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const hotelSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(20).max(2000),
  address: z.string().min(5),
  city: z.string().min(2),
  country: z.string().min(2),
  zipCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  images: z.array(z.string().url()).min(1).max(10),
  amenities: z.array(z.string()),
  starRating: z.number().int().min(1).max(5).optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  policies: z.record(z.unknown()).optional(),
});

export const getHotels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      city, country, minPrice, maxPrice, rating, amenities,
      page = '1', limit = '12', sortBy = 'createdAt', sortOrder = 'desc',
      search,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      status: 'APPROVED',
    };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { city: { contains: search as string, mode: 'insensitive' } },
        { country: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (country) where.country = { contains: country as string, mode: 'insensitive' };
    if (rating) where.starRating = { gte: parseInt(rating as string) };

    if (amenities) {
      const amenityList = (amenities as string).split(',');
      where.amenities = { hasEvery: amenityList };
    }

    // Price filtering through rooms
    if (minPrice || maxPrice) {
      where.rooms = {
        some: {
          price: {
            ...(minPrice ? { gte: parseFloat(minPrice as string) } : {}),
            ...(maxPrice ? { lte: parseFloat(maxPrice as string) } : {}),
          },
        },
      };
    }

    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          rooms: {
            select: { price: true, type: true },
            orderBy: { price: 'asc' },
            take: 1,
          },
          reviews: {
            select: { rating: true },
          },
          _count: {
            select: { reviews: true, rooms: true },
          },
        },
      }),
      prisma.hotel.count({ where }),
    ]);

    const hotelsWithRating = hotels.map((hotel) => ({
      ...hotel,
      averageRating: hotel.reviews.length
        ? hotel.reviews.reduce((acc, r) => acc + r.rating, 0) / hotel.reviews.length
        : null,
      startingPrice: hotel.rooms[0]?.price || null,
    }));

    res.json({
      success: true,
      data: {
        hotels: hotelsWithRating,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getHotelById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, avatar: true, createdAt: true },
        },
        rooms: {
          orderBy: { price: 'asc' },
        },
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: { reviews: true, bookings: true },
        },
      },
    });

    if (!hotel) throw new AppError('Hotel not found', 404);

    const averageRating = hotel.reviews.length
      ? hotel.reviews.reduce((acc, r) => acc + r.rating, 0) / hotel.reviews.length
      : null;

    const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: hotel.reviews.filter((r) => r.rating === star).length,
    }));

    res.json({
      success: true,
      data: { ...hotel, averageRating, ratingDistribution },
    });
  } catch (error) {
    next(error);
  }
};

export const createHotel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = hotelSchema.parse(req.body);

    const hotel = await prisma.hotel.create({
      data: {
        ...data,
        ownerId: req.user!.userId,
        status: 'PENDING',
      },
    });

    res.status(201).json({ success: true, data: hotel });
  } catch (error) {
    next(error);
  }
};

export const updateHotel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = hotelSchema.partial().parse(req.body);

    const hotel = await prisma.hotel.findUnique({ where: { id } });
    if (!hotel) throw new AppError('Hotel not found', 404);

    if (hotel.ownerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      throw new AppError('Not authorized', 403);
    }

    const updated = await prisma.hotel.update({ where: { id }, data });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteHotel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const hotel = await prisma.hotel.findUnique({ where: { id } });
    if (!hotel) throw new AppError('Hotel not found', 404);

    if (hotel.ownerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      throw new AppError('Not authorized', 403);
    }

    await prisma.hotel.delete({ where: { id } });
    res.json({ success: true, message: 'Hotel deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getOwnerHotels = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hotels = await prisma.hotel.findMany({
      where: { ownerId: req.user!.userId },
      include: {
        rooms: { select: { price: true } },
        reviews: { select: { rating: true } },
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: hotels });
  } catch (error) {
    next(error);
  }
};

export const checkAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { hotelId, checkIn, checkOut } = req.query;

    const checkInDate = new Date(checkIn as string);
    const checkOutDate = new Date(checkOut as string);

    const rooms = await prisma.room.findMany({
      where: { hotelId: hotelId as string },
    });

    const availableRooms = await Promise.all(
      rooms.map(async (room) => {
        const conflictingBookings = await prisma.booking.count({
          where: {
            roomId: room.id,
            status: { in: ['CONFIRMED', 'PENDING'] },
            OR: [
              { checkIn: { lt: checkOutDate }, checkOut: { gt: checkInDate } },
            ],
          },
        });

        return {
          ...room,
          availableCount: Math.max(0, room.totalRooms - conflictingBookings),
          isAvailable: conflictingBookings < room.totalRooms,
        };
      })
    );

    res.json({ success: true, data: availableRooms });
  } catch (error) {
    next(error);
  }
};

export const getAiRecommendations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    // Get user's booking history for personalization
    const userBookings = userId
      ? await prisma.booking.findMany({
          where: { userId },
          include: { hotel: { select: { city: true, amenities: true, starRating: true } } },
          take: 5,
        })
      : [];

    // Simple recommendation: popular hotels in cities user visited
    const visitedCities = userBookings.map((b) => b.hotel.city);
    const preferredRating = userBookings.length
      ? Math.round(userBookings.reduce((acc, b) => acc + b.hotel.starRating, 0) / userBookings.length)
      : 4;

    const recommended = await prisma.hotel.findMany({
      where: {
        status: 'APPROVED',
        starRating: { gte: preferredRating - 1 },
      },
      include: {
        rooms: { select: { price: true }, orderBy: { price: 'asc' }, take: 1 },
        reviews: { select: { rating: true } },
      },
      orderBy: { reviews: { _count: 'desc' } },
      take: 6,
    });

    res.json({ success: true, data: recommended });
  } catch (error) {
    next(error);
  }
};
