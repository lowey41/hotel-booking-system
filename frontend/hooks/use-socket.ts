import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

let socketInstance: Socket | null = null;

export const useSocket = () => {
  const { accessToken } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        socketInstance = null;
      }
      return;
    }

    if (!socketInstance) {
      socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
        auth: { token: accessToken },
        transports: ['websocket'],
      });
    }

    socketRef.current = socketInstance;

    socketRef.current.on('connect', () => {
      console.log('🔌 Socket connected');
    });

    socketRef.current.on('notification', (data: { title: string; message: string }) => {
      toast(data.message, { icon: '🔔', duration: 5000 });
    });

    socketRef.current.on('booking:update', (data: any) => {
      toast.success(`Booking ${data.status}: ${data.hotelName}`);
    });

    return () => {
      // Keep connection alive between navigations
    };
  }, [accessToken]);

  const joinHotel = useCallback((hotelId: string) => {
    socketRef.current?.emit('join:hotel', hotelId);
  }, []);

  const leaveHotel = useCallback((hotelId: string) => {
    socketRef.current?.emit('leave:hotel', hotelId);
  }, []);

  return { socket: socketRef.current, joinHotel, leaveHotel };
};
