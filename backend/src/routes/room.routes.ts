import { Router } from 'express';
import { createRoom, updateRoom, deleteRoom } from '../controllers/room.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router({ mergeParams: true });
router.use(authenticate, requireRole('HOTEL_OWNER', 'ADMIN'));
router.post('/', createRoom);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);

export default router;
