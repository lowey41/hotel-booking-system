'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  MapPin, Star, Wifi, Coffee, Car, Dumbbell, Waves, Heart,
  Share2, ChevronLeft, ChevronRight, Check, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingWidget } from '@/components/booking/booking-widget';
import { ReviewCard } from '@/components/hotel/review-card';
import { AmenityBadge } from '@/components/hotel/amenity-badge';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useHotel } from '@/hooks/use-hotels';
import { useWishlist } from '@/hooks/use-wishlist';
import { useAuthStore } from '@/store/auth.store';
import { HotelDetailSkeleton } from '@/components/hotel/hotel-detail-skeleton';
import { StarRating } from '@/components/shared/star-rating';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="w-4 h-4" />,
  'Pool': <Waves className="w-4 h-4" />,
  'Gym': <Dumbbell className="w-4 h-4" />,
  'Restaurant': <Coffee className="w-4 h-4" />,
  'Parking': <Car className="w-4 h-4" />,
};

export default function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: hotel, isLoading } = useHotel(id);
  const { isInWishlist, toggleWishlist } = useWishlist(id);
  const { user } = useAuthStore();
  const [currentImage, setCurrentImage] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  if (isLoading) return <><Navbar /><HotelDetailSkeleton /></>;
  if (!hotel) return <><Navbar /><div className="text-center py-40">Hotel not found</div></>;

  const images = hotel.images || [];
  const amenities = showAllAmenities ? hotel.amenities : hotel.amenities.slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Image Gallery */}
      <div className="relative h-[50vh] md:h-[60vh] bg-muted overflow-hidden">
        {images.length > 0 && (
          <>
            <img
              src={images[currentImage]}
              alt={hotel.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === currentImage ? 'bg-white w-6' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Thumbnails */}
        <div className="absolute bottom-4 right-4 hidden md:flex gap-2">
          {images.slice(0, 4).map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentImage(i)}
              className={`w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${i === currentImage ? 'border-amber-400' : 'border-transparent'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
          {images.length > 4 && (
            <div className="w-16 h-12 rounded-md bg-black/60 flex items-center justify-center text-white text-sm font-medium">
              +{images.length - 4}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{hotel.city}, {hotel.country}</span>
                  <span>•</span>
                  {'⭐'.repeat(hotel.starRating)}
                </div>
                <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
                <div className="flex items-center gap-3">
                  {hotel.averageRating && (
                    <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                      <StarRating rating={hotel.averageRating} />
                      <span className="font-semibold text-sm">{hotel.averageRating.toFixed(1)}</span>
                      <span className="text-muted-foreground text-sm">({hotel._count.reviews} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => toggleWishlist()} className={isInWishlist ? 'text-red-500' : ''}>
                  <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="overview">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="rooms">Rooms</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews {hotel._count.reviews > 0 && `(${hotel._count.reviews})`}
                </TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed text-base">{hotel.description}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Check-in</div>
                    <div className="font-semibold">{hotel.checkInTime}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Check-out</div>
                    <div className="font-semibold">{hotel.checkOutTime}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Category</div>
                    <div className="font-semibold">{hotel.starRating}-Star Hotel</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rooms">
                <div className="space-y-4">
                  {hotel.rooms?.map((room) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-xl p-5 flex flex-col md:flex-row gap-4 hover:shadow-md transition-shadow"
                    >
                      {room.images?.[0] && (
                        <img src={room.images[0]} alt={room.name} className="w-full md:w-40 h-32 object-cover rounded-lg" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{room.name}</h3>
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">{room.type}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-amber-600">${room.price}</div>
                            <div className="text-sm text-muted-foreground">per night</div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{room.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {room.amenities?.slice(0, 4).map((a) => (
                            <span key={a} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md">
                              <Check className="w-3 h-3 text-green-500" /> {a}
                            </span>
                          ))}
                          <span className="text-xs text-muted-foreground">Max {room.capacity} guests</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="amenities">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenities.map((amenity) => (
                    <AmenityBadge key={amenity} amenity={amenity} icon={AMENITY_ICONS[amenity]} />
                  ))}
                </div>
                {hotel.amenities.length > 8 && (
                  <Button variant="outline" onClick={() => setShowAllAmenities(!showAllAmenities)} className="mt-4">
                    {showAllAmenities ? 'Show less' : `Show all ${hotel.amenities.length} amenities`}
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="reviews">
                {hotel.reviews?.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">No reviews yet</h3>
                    <p className="text-muted-foreground text-sm">Be the first to review this hotel!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Rating distribution */}
                    {hotel.ratingDistribution && (
                      <div className="bg-muted/30 rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-5xl font-bold text-amber-500">{hotel.averageRating?.toFixed(1)}</div>
                            <StarRating rating={hotel.averageRating || 0} />
                            <div className="text-sm text-muted-foreground mt-1">{hotel._count.reviews} reviews</div>
                          </div>
                          <div className="flex-1 space-y-2">
                            {hotel.ratingDistribution.map(({ star, count }) => (
                              <div key={star} className="flex items-center gap-2 text-sm">
                                <span className="w-4 text-right">{star}</span>
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <div className="flex-1 bg-muted rounded-full h-2">
                                  <div
                                    className="bg-amber-400 h-2 rounded-full transition-all"
                                    style={{ width: hotel._count.reviews ? `${(count / hotel._count.reviews) * 100}%` : '0%' }}
                                  />
                                </div>
                                <span className="w-6 text-muted-foreground">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {hotel.reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="location">
                <div className="rounded-xl overflow-hidden h-80 bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="font-medium">{hotel.address}</p>
                    <p className="text-muted-foreground">{hotel.city}, {hotel.country}</p>
                    <Button variant="outline" className="mt-4" onClick={() => window.open(`https://maps.google.com/?q=${hotel.address}`, '_blank')}>
                      Open in Google Maps
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Widget */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="sticky top-24">
              <BookingWidget hotel={hotel} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
