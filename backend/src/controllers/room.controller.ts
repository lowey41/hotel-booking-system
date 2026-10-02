import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const roomSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.string(),
  description: z.string().min(10),
  images: z.array(z.string().url()).optional().default([]),
  price: z.number().positive(),
  capacity: z.number().int().min(1).max(20),
  amenities: z.array(z.string()).optional().default([]),
  totalRooms: z.number().int().min(1).optional().default(1),
});

export const createRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { hotelId } = req.params;
    const data = roomSchema.parse(req.body);

    // Verify hotel ownership
    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) throw new AppError('Hotel not found', 404);
    if (hotel.ownerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      throw new AppError('Not authorized', 403);
    }

    const room = await prisma.room.create({ data: { ...data, hotelId } });
    res.status(201).json({ success: true, data: room });
  } catch (error) { next(error); }
};

export const updateRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = roomSchema.partial().parse(req.body);

    const room = await prisma.room.findUnique({ where: { id }, include: { hotel: true } });
    if (!room) throw new AppError('Room not found', 404);
    if (room.hotel.ownerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      throw new AppError('Not authorized', 403);
    }

    const updated = await prisma.room.update({ where: { id }, data });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

export const deleteRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const room = await prisma.room.findUnique({ where: { id }, include: { hotel: true } });
    if (!room) throw new AppError('Room not found', 404);
    if (room.hotel.ownerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      throw new AppError('Not authorized', 403);
    }

    // Check for active bookings
    const activeBookings = await prisma.booking.count({
      where: { roomId: id, status: { in: ['CONFIRMED', 'PENDING'] }, checkOut: { gt: new Date() } },
    });
    if (activeBookings > 0) throw new AppError('Cannot delete room with active bookings', 400);

    await prisma.room.delete({ where: { id } });
    res.json({ success: true, message: 'Room deleted' });
  } catch (error) { next(error); }
};
