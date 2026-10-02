'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Users, Star, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HotelCard } from '@/components/hotel/hotel-card';
import { useHotels } from '@/hooks/use-hotels';
import { HotelCardSkeleton } from '@/components/hotel/hotel-card-skeleton';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

const HERO_STATS = [
  { label: 'Hotels Worldwide', value: '50,000+' },
  { label: 'Happy Guests', value: '2M+' },
  { label: 'Cities', value: '500+' },
  { label: 'Support', value: '24/7' },
];

const POPULAR_DESTINATIONS = [
  { city: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400' },
  { city: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400' },
  { city: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
  { city: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400' },
  { city: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400' },
  { city: 'London', country: 'UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400' },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading } = useHotels({ limit: 6 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/hotels?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 font-medium text-sm tracking-wide uppercase">AI-Powered Hotel Discovery</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Find Your<br />
              <span className="text-amber-400">Perfect Stay</span>
            </h1>
            <p className="text-xl text-gray-200 mb-10 max-w-2xl">
              Discover extraordinary hotels worldwide with intelligent recommendations tailored just for you.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row gap-3 max-w-3xl">
              <div className="flex items-center gap-2 flex-1 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 pb-3 md:pb-0 md:pr-4">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Where are you going?"
                  className="border-0 shadow-none focus-visible:ring-0 text-base p-0"
                />
              </div>
              <div className="flex items-center gap-2 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 pb-3 md:pb-0 md:pr-4">
                <Calendar className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-muted-foreground text-sm whitespace-nowrap">Select dates</span>
              </div>
              <div className="flex items-center gap-2 md:pr-4">
                <Users className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-muted-foreground text-sm">2 guests</span>
              </div>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl px-6">
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>
            </form>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap gap-8 mt-16"
          >
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="text-white">
                <div className="text-3xl font-bold text-amber-400">{stat.value}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Popular Destinations</h2>
              <p className="text-muted-foreground">Explore our most beloved travel spots</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/hotels')} className="hidden md:flex items-center gap-2">
              View all <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {POPULAR_DESTINATIONS.map((dest, i) => (
              <motion.div
                key={dest.city}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                onClick={() => router.push(`/hotels?search=${dest.city}`)}
                className="cursor-pointer rounded-xl overflow-hidden group relative aspect-square"
              >
                <img src={dest.image} alt={dest.city} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                  <div>
                    <div className="text-white font-semibold text-sm">{dest.city}</div>
                    <div className="text-gray-300 text-xs">{dest.country}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Featured Hotels */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-amber-500 font-medium text-sm">Top Rated</span>
                </div>
                <h2 className="text-3xl font-bold">Featured Hotels</h2>
              </div>
              <Button variant="outline" onClick={() => router.push('/hotels')} className="hidden md:flex items-center gap-2">
                View all <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading
                ? Array(6).fill(0).map((_, i) => <HotelCardSkeleton key={i} />)
                : data?.hotels?.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                  ))
              }
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why StayWise */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose StayWise?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">We combine cutting-edge technology with genuine hospitality to create unforgettable experiences.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '🤖', title: 'AI Recommendations', desc: 'Personalized hotel suggestions based on your travel history and preferences.' },
            { icon: '🔒', title: 'Secure Payments', desc: 'Stripe-powered transactions with full PCI compliance and instant confirmations.' },
            { icon: '📱', title: 'QR Check-in', desc: 'Skip the front desk with our digital QR code check-in system.' },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl border bg-card hover:shadow-lg transition-shadow text-center"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
