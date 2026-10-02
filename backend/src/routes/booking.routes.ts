import { Router } from 'express';
import {
  createBooking, confirmBooking, getUserBookings,
  cancelBooking, getBookingById,
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/', getUserBookings);
router.post('/', createBooking);
router.get('/:id', getBookingById);
router.post('/:bookingId/confirm', confirmBooking);
router.put('/:id/cancel', cancelBooking);
export default router;
