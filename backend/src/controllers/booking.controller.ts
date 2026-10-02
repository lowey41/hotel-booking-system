import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import Stripe from 'stripe';
import QRCode from 'qrcode';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { sendEmail } from '../services/email.service';
import { sendNotification } from '../services/notification.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });

const createBookingSchema = z.object({
  hotelId: z.string().cuid(),
  roomId: z.string().cuid(),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  guests: z.number().int().min(1).max(10),
  specialRequests: z.string().optional(),
});

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createBookingSchema.parse(req.body);
    const userId = req.user!.userId;

    const checkInDate = new Date(data.checkIn);
    const checkOutDate = new Date(data.checkOut);

    if (checkInDate >= checkOutDate) {
      throw new AppError('Check-out must be after check-in', 400);
    }
    if (checkInDate < new Date()) {
      throw new AppError('Check-in cannot be in the past', 400);
    }

    // Check availability
    const conflictingBookings = await prisma.booking.count({
      where: {
        roomId: data.roomId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        OR: [{ checkIn: { lt: checkOutDate }, checkOut: { gt: checkInDate } }],
      },
    });

    const room = await prisma.room.findUnique({ where: { id: data.roomId } });
    if (!room) throw new AppError('Room not found', 404);
    if (conflictingBookings >= room.totalRooms) {
      throw new AppError('Room is not available for selected dates', 409);
    }

    if (data.guests > room.capacity) {
      throw new AppError(`Room capacity is ${room.capacity} guests`, 400);
    }

    // Calculate price
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price * nights;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // cents
      currency: 'usd',
      metadata: { userId, roomId: data.roomId, hotelId: data.hotelId },
    });

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        hotelId: data.hotelId,
        roomId: data.roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: data.guests,
        totalPrice,
        specialRequests: data.specialRequests,
        stripePaymentId: paymentIntent.id,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      },
      include: {
        hotel: { select: { name: true, address: true, city: true } },
        room: { select: { name: true, type: true } },
        user: { select: { email: true, name: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: {
        booking,
        clientSecret: paymentIntent.client_secret,
        nights,
        totalPrice,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const confirmBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const { paymentIntentId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        hotel: true,
        room: true,
        user: { select: { email: true, name: true } },
      },
    });

    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.userId !== req.user!.userId) throw new AppError('Not authorized', 403);

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      throw new AppError('Payment not completed', 400);
    }

    // Generate QR code
    const qrData = JSON.stringify({
      bookingId: booking.id,
      hotel: booking.hotel.name,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
    });
    const qrCode = await QRCode.toDataURL(qrData);

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        qrCode,
      },
    });

    // Send confirmation email
    await sendEmail({
      to: booking.user.email,
      subject: `Booking Confirmed - ${booking.hotel.name}`,
      template: 'booking-confirmation',
      data: {
        name: booking.user.name,
        hotelName: booking.hotel.name,
        roomName: booking.room.name,
        checkIn: booking.checkIn.toDateString(),
        checkOut: booking.checkOut.toDateString(),
        bookingId: booking.id,
        totalPrice: booking.totalPrice,
        qrCode,
      },
    });

    // Send notification
    await sendNotification(booking.userId, {
      title: 'Booking Confirmed!',
      message: `Your stay at ${booking.hotel.name} has been confirmed.`,
      type: 'BOOKING',
      data: { bookingId: booking.id },
    });

    res.json({ success: true, data: updatedBooking });
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const where: any = { userId: req.user!.userId };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          hotel: {
            select: { id: true, name: true, city: true, images: true, starRating: true },
          },
          room: { select: { name: true, type: true, images: true } },
          review: { select: { id: true, rating: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { hotel: true, user: { select: { email: true, name: true } } },
    });

    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      throw new AppError('Not authorized', 403);
    }
    if (['CANCELLED', 'COMPLETED'].includes(booking.status)) {
      throw new AppError('Booking cannot be cancelled', 400);
    }

    // Check cancellation window (48 hours before check-in)
    const hoursUntilCheckIn = (booking.checkIn.getTime() - Date.now()) / (1000 * 60 * 60);
    const refundAmount = hoursUntilCheckIn > 48 ? booking.totalPrice : booking.totalPrice * 0.5;

    // Process refund via Stripe
    if (booking.stripePaymentId && booking.paymentStatus === 'PAID') {
      const paymentIntent = await stripe.paymentIntents.retrieve(booking.stripePaymentId);
      if (paymentIntent.latest_charge) {
        await stripe.refunds.create({
          charge: paymentIntent.latest_charge as string,
          amount: Math.round(refundAmount * 100),
        });
      }
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED', paymentStatus: 'REFUNDED' },
    });

    // Send cancellation email
    await sendEmail({
      to: booking.user.email,
      subject: `Booking Cancelled - ${booking.hotel.name}`,
      template: 'booking-cancellation',
      data: {
        name: booking.user.name,
        hotelName: booking.hotel.name,
        refundAmount,
      },
    });

    res.json({ success: true, data: updated, refundAmount });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        hotel: true,
        room: true,
        user: { select: { id: true, name: true, email: true, avatar: true } },
        review: true,
      },
    });

    if (!booking) throw new AppError('Booking not found', 404);

    if (booking.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      throw new AppError('Not authorized', 403);
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};
