import { Router } from 'express';
import {
  getHotels, getHotelById, createHotel, updateHotel, deleteHotel,
  getOwnerHotels, checkAvailability, getAiRecommendations,
} from '../controllers/hotel.controller';
import { authenticate, requireRole, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', getHotels);
router.get('/recommendations', optionalAuth, getAiRecommendations);
router.get('/owner/my-hotels', authenticate, requireRole('HOTEL_OWNER', 'ADMIN'), getOwnerHotels);
router.get('/availability', checkAvailability);
router.get('/:id', getHotelById);
router.post('/', authenticate, requireRole('HOTEL_OWNER', 'ADMIN'), createHotel);
router.put('/:id', authenticate, requireRole('HOTEL_OWNER', 'ADMIN'), updateHotel);
router.delete('/:id', authenticate, requireRole('HOTEL_OWNER', 'ADMIN'), deleteHotel);

export default router;
