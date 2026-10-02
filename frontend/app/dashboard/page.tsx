'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Heart, Settings, Bell, User, BookOpen, LogOut, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Navbar } from '@/components/layout/navbar';
import { BookingCard } from '@/components/booking/booking-card';
import { HotelCard } from '@/components/hotel/hotel-card';
import { ProfileForm } from '@/components/auth/profile-form';
import { useBookings } from '@/hooks/use-bookings';
import { useWishlist } from '@/hooks/use-wishlist';
import { useAuthStore } from '@/store/auth.store';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuthStore();
  const defaultTab = searchParams.get('tab') || 'bookings';

  const { data: bookingsData, isLoading: bookingsLoading } = useBookings();
  const { wishlist, isLoading: wishlistLoading } = useWishlist() as any;

  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user, router]);

  if (!user) return null;

  const upcomingBookings = bookingsData?.bookings?.filter(
    (b: any) => ['CONFIRMED', 'PENDING'].includes(b.status) && new Date(b.checkIn) > new Date()
  ) || [];
  const pastBookings = bookingsData?.bookings?.filter(
    (b: any) => ['COMPLETED', 'CANCELLED'].includes(b.status) || new Date(b.checkOut) < new Date()
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10 p-6 bg-card rounded-2xl border"
        >
          <Avatar className="w-20 h-20 border-4 border-amber-400">
            <AvatarImage src={user.avatar || ''} alt={user.name} />
            <AvatarFallback className="text-2xl bg-amber-100 text-amber-700 font-bold">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                user.role === 'ADMIN' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                user.role === 'HOTEL_OWNER' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {user.role}
              </span>
              <span className="text-sm text-muted-foreground">
                {bookingsData?.pagination?.total || 0} total bookings
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {user.role === 'HOTEL_OWNER' && (
              <Button variant="outline" onClick={() => router.push('/owner/dashboard')}>
                Manage Hotels
              </Button>
            )}
            {user.role === 'ADMIN' && (
              <Button variant="outline" onClick={() => router.push('/admin')}>
                Admin Panel
              </Button>
            )}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Upcoming Trips', value: upcomingBookings.length, icon: Calendar, color: 'text-blue-500' },
            { label: 'Past Trips', value: pastBookings.length, icon: BookOpen, color: 'text-green-500' },
            { label: 'Saved Hotels', value: wishlist?.length || 0, icon: Heart, color: 'text-red-500' },
            { label: 'Reviews Given', value: pastBookings.filter((b: any) => b.review).length, icon: Star, color: 'text-amber-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border rounded-xl p-4 text-center">
              <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Bookings
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="w-4 h-4" /> Wishlist
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" /> Settings
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <div className="space-y-6">
              {upcomingBookings.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-4">Upcoming Stays</h3>
                  <div className="space-y-4">
                    {upcomingBookings.map((booking: any) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                </div>
              )}
              {pastBookings.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-4">Past Stays</h3>
                  <div className="space-y-4">
                    {pastBookings.map((booking: any) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                </div>
              )}
              {bookingsData?.bookings?.length === 0 && (
                <div className="text-center py-16">
                  <Calendar className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground mb-6">Your travel adventures start here!</p>
                  <Button onClick={() => router.push('/hotels')} className="bg-amber-500 hover:bg-amber-600 text-black">
                    Explore Hotels
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            {wishlist?.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
                <p className="text-muted-foreground mb-6">Save hotels you love for future trips</p>
                <Button onClick={() => router.push('/hotels')} className="bg-amber-500 hover:bg-amber-600 text-black">
                  Discover Hotels
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist?.map((item: any) => (
                  <HotelCard key={item.id} hotel={item.hotel} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="max-w-2xl">
              <ProfileForm user={user} />
              <div className="mt-8 pt-8 border-t">
                <h3 className="font-semibold text-destructive mb-4">Danger Zone</h3>
                <Button variant="destructive" onClick={() => { logout(); router.push('/'); }}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const { data: notifications = [], isLoading } = { data: [], isLoading: false };
  return (
    <div className="space-y-3">
      {notifications.length === 0 && (
        <div className="text-center py-16">
          <Bell className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No notifications</h3>
          <p className="text-muted-foreground">You're all caught up!</p>
        </div>
      )}
    </div>
  );
}
