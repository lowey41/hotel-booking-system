'use client';

import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  MapPin, Calendar, Users, CreditCard, QrCode,
  ArrowLeft, Hotel, Star, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/navbar';
import { useBooking, useCancelBooking } from '@/hooks/use-bookings';
import { StarRating } from '@/components/shared/star-rating';

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  CONFIRMED: { icon: CheckCircle, color: 'text-green-500', label: 'Confirmed' },
  PENDING:   { icon: Clock,        color: 'text-yellow-500', label: 'Pending Payment' },
  CANCELLED: { icon: XCircle,      color: 'text-red-500',   label: 'Cancelled' },
  COMPLETED: { icon: CheckCircle,  color: 'text-blue-500',  label: 'Completed' },
  NO_SHOW:   { icon: XCircle,      color: 'text-gray-500',  label: 'No Show' },
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: booking, isLoading } = useBooking(id);
  const { mutate: cancelBooking, isPending: cancelling } = useCancelBooking();

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 pt-24 pb-12 animate-pulse space-y-4">
          <div className="h-8 skeleton rounded w-1/3" />
          <div className="h-64 skeleton rounded-2xl" />
          <div className="h-32 skeleton rounded-2xl" />
        </div>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 pt-24 text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">Booking not found</h2>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </>
    );
  }

  const nights = Math.ceil(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
  );
  const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = status.icon;
  const canCancel = ['CONFIRMED', 'PENDING'].includes(booking.status) &&
    new Date(booking.checkIn) > new Date();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Booking Details</h1>
              <p className="text-sm text-muted-foreground font-mono">#{booking.id.slice(-12).toUpperCase()}</p>
            </div>
            <div className={`flex items-center gap-2 text-sm font-medium ${status.color}`}>
              <StatusIcon className="w-5 h-5" />
              {status.label}
            </div>
          </div>

          {/* Hotel Card */}
          <div className="border rounded-2xl overflow-hidden bg-card">
            {booking.hotel?.images?.[0] && (
              <img
                src={booking.hotel.images[0]}
                alt={booking.hotel.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-1">{booking.hotel?.name}</h2>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{booking.hotel?.address}, {booking.hotel?.city}, {booking.hotel?.country}</span>
                  </div>
                </div>
                <div className="text-right">
                  {'⭐'.repeat(booking.hotel?.starRating || 0)}
                </div>
              </div>

              {/* Booking Info Grid */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-muted/40 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <Calendar className="w-3.5 h-3.5" /> Check-in
                  </div>
                  <div className="font-semibold">{format(new Date(booking.checkIn), 'EEE, MMM d, yyyy')}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{booking.hotel?.checkInTime || 'From 14:00'}</div>
                </div>
                <div className="bg-muted/40 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <Calendar className="w-3.5 h-3.5" /> Check-out
                  </div>
                  <div className="font-semibold">{format(new Date(booking.checkOut), 'EEE, MMM d, yyyy')}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{booking.hotel?.checkOutTime || 'By 11:00'}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hotel className="w-4 h-4" />
                  <span>{booking.room?.name} ({booking.room?.type})</span>
                </div>
                <div className="font-medium">
                  {nights} night{nights > 1 ? 's' : ''}
                </div>
              </div>

              {booking.specialRequests && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                  <p className="font-medium text-blue-700 dark:text-blue-400 mb-1">Special Requests</p>
                  <p className="text-blue-600 dark:text-blue-300">{booking.specialRequests}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="border rounded-2xl p-6 bg-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-500" /> Payment Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  ${booking.room?.price || (booking.totalPrice / nights).toFixed(0)} × {nights} night{nights > 1 ? 's' : ''}
                </span>
                <span>${(booking.totalPrice).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes & fees</span>
                <span>Included</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
                <span>Total Charged</span>
                <span className="text-amber-600">${booking.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Payment status</span>
                <span className={booking.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}>
                  {booking.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {booking.qrCode && booking.status === 'CONFIRMED' && (
            <div className="border rounded-2xl p-6 bg-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-500" /> Digital Check-in
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <img src={booking.qrCode} alt="QR Code" className="w-36 h-36 rounded-lg border p-2 bg-white" />
                <div>
                  <p className="font-medium mb-1">Show this QR code at reception</p>
                  <p className="text-sm text-muted-foreground">
                    Skip the queue — present this code on your phone for instant check-in. Valid only for the booked guest.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => router.push(`/hotels/${booking.hotel?.id}`)}>
              View Hotel
            </Button>
            {!booking.review && booking.status === 'COMPLETED' && (
              <Button variant="outline" onClick={() => router.push(`/hotels/${booking.hotel?.id}?review=true`)}>
                <Star className="w-4 h-4 mr-2" /> Leave Review
              </Button>
            )}
            {canCancel && (
              <Button
                variant="destructive"
                onClick={() => cancelBooking(booking.id)}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </Button>
            )}
          </div>

          {canCancel && (
            <p className="text-xs text-muted-foreground">
              * Free cancellation applies if cancelled more than 48 hours before check-in. A 50% charge applies otherwise.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
