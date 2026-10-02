import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

interface NotificationPayload {
  title: string;
  message: string;
  type: string;
  data?: Record<string, unknown>;
}

export const sendNotification = async (userId: string, payload: NotificationPayload) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        data: payload.data,
      },
    });
    logger.info(`Notification created for user ${userId}: ${payload.title}`);
    return notification;
  } catch (error) {
    logger.error('Failed to create notification', { error, userId });
  }
};
