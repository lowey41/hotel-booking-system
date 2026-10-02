import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

// ─── User Routes ──────────────────────────────────────────────────────────────
const userRouter = Router();

userRouter.get('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, avatar: true, phone: true, role: true, createdAt: true },
    });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (e) { next(e); }
});

userRouter.put('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2).optional(),
      phone: z.string().optional(),
      avatar: z.string().url().optional(),
    });
    const data = schema.parse(req.body);
    const user = await prisma.user.update({ where: { id: req.user!.userId }, data });
    res.json({ success: true, data: user });
  } catch (e) { next(e); }
});

userRouter.get('/wishlist', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user!.userId },
      include: {
        hotel: {
          include: {
            rooms: { select: { price: true }, orderBy: { price: 'asc' }, take: 1 },
            reviews: { select: { rating: true } },
          },
        },
      },
    });
    res.json({ success: true, data: wishlist });
  } catch (e) { next(e); }
});

userRouter.post('/wishlist/:hotelId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const existing = await prisma.wishlist.findUnique({
      where: { userId_hotelId: { userId: req.user!.userId, hotelId: req.params.hotelId } },
    });
    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return res.json({ success: true, action: 'removed' });
    }
    await prisma.wishlist.create({ data: { userId: req.user!.userId, hotelId: req.params.hotelId } });
    res.json({ success: true, action: 'added' });
  } catch (e) { next(e); }
});

export { userRouter as default };

// ─── Review Routes ────────────────────────────────────────────────────────────
export const reviewRouter = Router();

reviewRouter.get('/hotel/:hotelId', async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { hotelId: req.params.hotelId, flagged: false },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: reviews });
  } catch (e) { next(e); }
});

reviewRouter.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const schema = z.object({
      bookingId: z.string().cuid(),
      hotelId: z.string().cuid(),
      rating: z.number().int().min(1).max(5),
      title: z.string().optional(),
      comment: z.string().min(10),
    });
    const data = schema.parse(req.body);
    const review = await prisma.review.create({
      data: { ...data, userId: req.user!.userId },
    });
    res.status(201).json({ success: true, data: review });
  } catch (e) { next(e); }
});

// ─── Admin Routes ─────────────────────────────────────────────────────────────
export const adminRouter = Router();
adminRouter.use(authenticate, requireRole('ADMIN'));

adminRouter.get('/stats', async (_, res, next) => {
  try {
    const [users, hotels, bookings, revenue] = await Promise.all([
      prisma.user.count(),
      prisma.hotel.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { totalPrice: true } }),
    ]);
    res.json({ success: true, data: { users, hotels, bookings, revenue: revenue._sum.totalPrice || 0 } });
  } catch (e) { next(e); }
});

adminRouter.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true, _count: { select: { bookings: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (e) { next(e); }
});

adminRouter.get('/hotels', async (_, res, next) => {
  try {
    const hotels = await prisma.hotel.findMany({
      include: { owner: { select: { name: true, email: true } }, _count: { select: { bookings: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: hotels });
  } catch (e) { next(e); }
});

adminRouter.put('/hotels/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const hotel = await prisma.hotel.update({ where: { id: req.params.id }, data: { status } });
    res.json({ success: true, data: hotel });
  } catch (e) { next(e); }
});

// ─── Payment Routes ───────────────────────────────────────────────────────────
export const paymentRouter = Router();

paymentRouter.post('/webhook', async (req, res, next) => {
  try {
    // Handle Stripe webhooks
    const event = req.body;
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntentId = event.data.object.id;
      await prisma.booking.updateMany({
        where: { stripePaymentId: paymentIntentId },
        data: { paymentStatus: 'PAID' },
      });
    }
    res.json({ received: true });
  } catch (e) { next(e); }
});

// ─── Notification Routes ──────────────────────────────────────────────────────
export const notificationRouter = Router();
notificationRouter.use(authenticate);

notificationRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: notifications });
  } catch (e) { next(e); }
});

notificationRouter.put('/:id/read', async (req: AuthRequest, res, next) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id, userId: req.user!.userId },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (e) { next(e); }
});

notificationRouter.put('/read-all', async (req: AuthRequest, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (e) { next(e); }
});
