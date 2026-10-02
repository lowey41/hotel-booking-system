'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Hotel, BookOpen, DollarSign, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/layout/navbar';
import { useAuthStore } from '@/store/auth.store';
import { useOwnerHotels, useCreateHotel } from '@/hooks/use-hotels';
import toast from 'react-hot-toast';

const hotelSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(20),
  address: z.string().min(5),
  city: z.string().min(2),
  country: z.string().min(2),
  starRating: z.coerce.number().int().min(1).max(5),
  checkInTime: z.string().default('14:00'),
  checkOutTime: z.string().default('11:00'),
});

export default function OwnerDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: hotels = [], isLoading } = useOwnerHotels();
  const { mutate: createHotel, isPending } = useCreateHotel();
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(hotelSchema),
    defaultValues: { starRating: 3, checkInTime: '14:00', checkOutTime: '11:00' },
  });

  useEffect(() => {
    if (!user || !['HOTEL_OWNER', 'ADMIN'].includes(user.role)) router.push('/');
  }, [user, router]);

  const onSubmit = (data: any) => {
    createHotel({
      ...data,
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
      amenities: ['WiFi', 'Parking'],
    }, {
      onSuccess: () => {
        toast.success('Hotel submitted for review!');
        reset();
        setShowForm(false);
      },
      onError: () => toast.error('Failed to create hotel'),
    });
  };

  const totalBookings = hotels.reduce((acc: number, h: any) => acc + (h._count?.bookings || 0), 0);
  const totalRevenue = hotels.reduce((acc: number, h: any) => {
    return acc; // Would need actual revenue data from backend
  }, 0);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Hotel Owner Dashboard</h1>
              <p className="text-muted-foreground">Manage your properties</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="w-4 h-4 mr-2" /> Add Hotel
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'My Hotels', value: hotels.length, icon: Hotel, color: 'text-blue-500' },
              { label: 'Total Bookings', value: totalBookings, icon: BookOpen, color: 'text-green-500' },
              { label: 'Avg Rating', value: '4.7 ⭐', icon: Star, color: 'text-amber-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-card border rounded-xl p-5">
                <Icon className={`w-6 h-6 mb-3 ${color}`} />
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>

          {/* Add Hotel Form */}
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold mb-6">Add New Hotel</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Hotel Name</Label>
                  <Input className="mt-1" placeholder="Grand Hotel" {...register('name')} />
                  {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message as string}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <textarea
                    className="w-full mt-1 border rounded-md px-3 py-2 text-sm bg-background resize-none h-24"
                    placeholder="Describe your hotel..."
                    {...register('description')}
                  />
                  {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message as string}</p>}
                </div>
                <div>
                  <Label>Address</Label>
                  <Input className="mt-1" placeholder="123 Main Street" {...register('address')} />
                </div>
                <div>
                  <Label>City</Label>
                  <Input className="mt-1" placeholder="New York" {...register('city')} />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input className="mt-1" placeholder="United States" {...register('country')} />
                </div>
                <div>
                  <Label>Star Rating (1-5)</Label>
                  <Input className="mt-1" type="number" min="1" max="5" {...register('starRating')} />
                </div>
                <div>
                  <Label>Check-in Time</Label>
                  <Input className="mt-1" type="time" {...register('checkInTime')} />
                </div>
                <div>
                  <Label>Check-out Time</Label>
                  <Input className="mt-1" type="time" {...register('checkOutTime')} />
                </div>
                <div className="md:col-span-2 flex gap-3 pt-2">
                  <Button type="submit" disabled={isPending} className="bg-amber-500 hover:bg-amber-600 text-black">
                    {isPending ? 'Submitting...' : 'Submit for Review'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Hotels List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">My Hotels</h2>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading hotels...</div>
            ) : hotels.length === 0 ? (
              <div className="text-center py-16 border rounded-xl bg-card">
                <Hotel className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No hotels yet</h3>
                <p className="text-muted-foreground mb-6">Add your first property to get started</p>
                <Button onClick={() => setShowForm(true)} className="bg-amber-500 hover:bg-amber-600 text-black">
                  <Plus className="w-4 h-4 mr-2" /> Add First Hotel
                </Button>
              </div>
            ) : (
              hotels.map((hotel: any) => (
                <div key={hotel.id} className="border rounded-xl bg-card overflow-hidden flex flex-col md:flex-row">
                  {hotel.images?.[0] && (
                    <img src={hotel.images[0]} alt={hotel.name} className="w-full md:w-48 h-40 md:h-auto object-cover" />
                  )}
                  <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{hotel.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          hotel.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          hotel.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {hotel.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{hotel.city}, {hotel.country}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-muted-foreground">{hotel._count?.bookings || 0} bookings</span>
                        <span className="text-muted-foreground">{hotel._count?.reviews || 0} reviews</span>
                        <span className="text-muted-foreground">{hotel.rooms?.length || 0} rooms</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/hotels/${hotel.id}`)}>
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
