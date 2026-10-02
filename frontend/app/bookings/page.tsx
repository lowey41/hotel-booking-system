'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/navbar';
import { BookingCard } from '@/components/booking/booking-card';
import { useBookings } from '@/hooks/use-bookings';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Upcoming', value: 'CONFIRMED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function BookingsPage() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState('');
  const { data, isLoading } = useBookings({ status: activeStatus || undefined });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground mb-8">Manage all your hotel reservations</p>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveStatus(tab.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeStatus === tab.value
                    ? 'bg-amber-500 text-black'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 skeleton rounded-xl animate-pulse" />
              ))}
            </div>
          ) : data?.bookings?.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
              <p className="text-muted-foreground mb-6">
                {activeStatus
                  ? `No ${activeStatus.toLowerCase()} bookings`
                  : 'Start planning your next adventure!'}
              </p>
              <Button
                onClick={() => router.push('/hotels')}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                Explore Hotels
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.bookings?.map((booking: any, i: number) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <BookingCard booking={booking} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button variant="outline" size="sm">Previous</Button>
              <span className="px-4 py-2 text-sm text-muted-foreground">
                Page 1 of {data.pagination.pages}
              </span>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
