import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const connectedUsers = new Map<string, string>(); // userId -> socketId

export const setupSocketHandlers = (io: Server) => {
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      (socket as any).userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    connectedUsers.set(userId, socket.id);
    logger.info(`User connected: ${userId}`);

    socket.join(`user:${userId}`);

    socket.on('join:hotel', (hotelId: string) => {
      socket.join(`hotel:${hotelId}`);
    });

    socket.on('leave:hotel', (hotelId: string) => {
      socket.leave(`hotel:${hotelId}`);
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      logger.info(`User disconnected: ${userId}`);
    });
  });

  return io;
};

export const emitToUser = (io: Server, userId: string, event: string, data: unknown) => {
  io.to(`user:${userId}`).emit(event, data);
};

export const emitToHotel = (io: Server, hotelId: string, event: string, data: unknown) => {
  io.to(`hotel:${hotelId}`).emit(event, data);
};
