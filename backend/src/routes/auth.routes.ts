// auth.routes.ts
import { Router } from 'express';
import { register, login, logout, refreshToken, googleCallback } from '../controllers/auth.controller';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.post('/google', googleCallback);
export default router;
