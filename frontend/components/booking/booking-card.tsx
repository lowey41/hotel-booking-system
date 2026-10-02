'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, QrCode, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCancelBooking } from '@/hooks/use-bookings';

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  NO_SHOW: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export function BookingCard({ booking }: { booking: any }) {
  const router = useRouter();
  const { mutate: cancelBooking, isPending } = useCancelBooking();
  const [showQR, setShowQR] = useState(false);

  const nights = Math.ceil(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
  );

  const canCancel = ['CONFIRMED', 'PENDING'].includes(booking.status) &&
    new Date(booking.checkIn) > new Date();

  return (
    <div className="border rounded-xl bg-card overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Hotel Image */}
        {booking.hotel?.images?.[0] && (
          <div className="md:w-48 h-40 md:h-auto shrink-0">
            <img
              src={booking.hotel.images[0]}
              alt={booking.hotel.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[booking.status] || ''}`}>
                  {booking.status}
                </span>
                <span className="text-xs text-muted-foreground">#{booking.id.slice(-8).toUpperCase()}</span>
              </div>
              <h3 className="font-semibold text-lg cursor-pointer hover:text-amber-600"
                onClick={() => router.push(`/hotels/${booking.hotel?.id}`)}>
                {booking.hotel?.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                {booking.hotel?.city}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-amber-600">${booking.totalPrice}</div>
              <div className="text-xs text-muted-foreground">{nights} night{nights > 1 ? 's' : ''}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(booking.checkIn), 'MMM d')} – {format(new Date(booking.checkOut), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
            </div>
            {booking.room && (
              <div className="text-xs bg-muted px-2 py-1 rounded-full">{booking.room.name}</div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/bookings/${booking.id}`)}
            >
              View Details
            </Button>

            {booking.qrCode && booking.status === 'CONFIRMED' && (
              <Button size="sm" variant="outline" onClick={() => setShowQR(!showQR)}>
                <QrCode className="w-4 h-4 mr-1.5" /> QR Check-in
              </Button>
            )}

            {!booking.review && booking.status === 'COMPLETED' && (
              <Button size="sm" variant="outline" onClick={() => router.push(`/hotels/${booking.hotel?.id}?review=true`)}>
                <Star className="w-4 h-4 mr-1.5" /> Write Review
              </Button>
            )}

            {canCancel && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => cancelBooking(booking.id)}
                disabled={isPending}
              >
                {isPending ? 'Cancelling...' : 'Cancel'}
              </Button>
            )}
          </div>

          {showQR && booking.qrCode && (
            <div className="mt-4 p-4 bg-muted rounded-lg flex items-center gap-4">
              <img src={booking.qrCode} alt="QR Code" className="w-24 h-24" />
              <div>
                <p className="font-medium text-sm">Check-in QR Code</p>
                <p className="text-xs text-muted-foreground">Show this at the front desk</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
