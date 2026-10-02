'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Calendar, Users, CreditCard, Shield, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { differenceInDays, format } from 'date-fns';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface BookingWidgetProps {
  hotel: any;
}

function PaymentForm({ bookingId, totalPrice, onSuccess }: { bookingId: string; totalPrice: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        await api.post(`/bookings/${bookingId}/confirm`, { paymentIntentId: paymentIntent.id });
        toast.success('Booking confirmed! Check your email for details.');
        onSuccess();
      }
    } catch (err) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || loading} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-12">
        {loading ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
      </Button>
    </form>
  );
}

export function BookingWidget({ hotel }: BookingWidgetProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState<'select' | 'payment' | 'success'>('select');
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [clientSecret, setClientSecret] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(false);

  const nights = checkIn && checkOut ? differenceInDays(new Date(checkOut), new Date(checkIn)) : 0;
  const totalPrice = selectedRoom ? selectedRoom.price * Math.max(1, nights) : 0;

  const handleBook = async () => {
    if (!user) {
      toast.error('Please login to book');
      router.push('/auth/login');
      return;
    }
    if (!selectedRoom || !checkIn || !checkOut) {
      toast.error('Please select a room and dates');
      return;
    }
    if (nights < 1) {
      toast.error('Minimum 1 night stay required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/bookings', {
        hotelId: hotel.id,
        roomId: selectedRoom.id,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
        guests,
      });
      setClientSecret(res.data.data.clientSecret);
      setBookingId(res.data.data.booking.id);
      setStep('payment');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="border rounded-2xl p-6 bg-card shadow-lg text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-bold mb-2">Booking Confirmed!</h3>
        <p className="text-muted-foreground mb-6">Your stay at {hotel.name} has been booked. Check your email for confirmation.</p>
        <Button onClick={() => router.push('/bookings')} className="w-full bg-amber-500 hover:bg-amber-600 text-black">
          View My Bookings
        </Button>
      </div>
    );
  }

  if (step === 'payment' && clientSecret) {
    return (
      <div className="border rounded-2xl p-6 bg-card shadow-lg">
        <button onClick={() => setStep('select')} className="text-sm text-muted-foreground mb-4 flex items-center gap-1 hover:text-foreground">
          ← Back
        </button>
        <h3 className="font-bold text-lg mb-4">Complete Payment</h3>
        <div className="bg-muted/50 rounded-lg p-4 mb-4 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-muted-foreground">{selectedRoom.name}</span><span>{nights} nights</span></div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t mt-2"><span>Total</span><span className="text-amber-600">${totalPrice.toFixed(2)}</span></div>
        </div>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm bookingId={bookingId} totalPrice={totalPrice} onSuccess={() => setStep('success')} />
        </Elements>
        <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" /> Secured by Stripe
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-2xl p-6 bg-card shadow-lg">
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-3xl font-bold text-amber-600">${hotel.rooms?.[0]?.price || '—'}</span>
        <span className="text-muted-foreground">/ night</span>
      </div>

      {/* Date Picker */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="border rounded-lg p-3">
          <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <Calendar className="w-3 h-3" /> Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setCheckIn(e.target.value)}
            className="text-sm font-medium bg-transparent w-full outline-none"
          />
        </div>
        <div className="border rounded-lg p-3">
          <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <Calendar className="w-3 h-3" /> Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            min={checkIn || new Date().toISOString().split('T')[0]}
            onChange={(e) => setCheckOut(e.target.value)}
            className="text-sm font-medium bg-transparent w-full outline-none"
          />
        </div>
      </div>

      {/* Guests */}
      <div className="border rounded-lg p-3 mb-4">
        <label className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
          <Users className="w-3 h-3" /> Guests
        </label>
        <div className="flex items-center justify-between">
          <span className="font-medium">{guests} guest{guests > 1 ? 's' : ''}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-muted">−</button>
            <button onClick={() => setGuests(Math.min(10, guests + 1))} className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-muted">+</button>
          </div>
        </div>
      </div>

      {/* Room Selection */}
      <div className="mb-4 space-y-2">
        <label className="text-sm font-medium">Select Room</label>
        {hotel.rooms?.map((room: any) => (
          <button
            key={room.id}
            onClick={() => setSelectedRoom(room)}
            className={`w-full text-left border rounded-lg p-3 transition-all ${selectedRoom?.id === room.id ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10' : 'hover:border-gray-400'}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-sm">{room.name}</div>
                <div className="text-xs text-muted-foreground">{room.type} • Up to {room.capacity} guests</div>
              </div>
              <div className="text-amber-600 font-bold">${room.price}<span className="text-xs text-muted-foreground">/night</span></div>
            </div>
          </button>
        ))}
      </div>

      {/* Price Summary */}
      {selectedRoom && nights > 0 && (
        <div className="bg-muted/50 rounded-lg p-3 mb-4 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-muted-foreground">${selectedRoom.price} × {nights} nights</span><span>${(selectedRoom.price * nights).toFixed(2)}</span></div>
          <div className="flex justify-between font-semibold pt-2 border-t mt-1"><span>Total</span><span className="text-amber-600">${totalPrice.toFixed(2)}</span></div>
        </div>
      )}

      <Button
        onClick={handleBook}
        disabled={!selectedRoom || !checkIn || !checkOut || loading}
        className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-12 rounded-xl"
      >
        {loading ? 'Processing...' : <><CreditCard className="w-4 h-4 mr-2" /> Reserve Now</>}
      </Button>

      <p className="text-xs text-center text-muted-foreground mt-3">You won't be charged yet</p>
    </div>
  );
}
