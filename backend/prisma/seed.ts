import { PrismaClient, Role, HotelStatus, BookingStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('Password123!', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@staywise.com',
      name: 'Admin User',
      password: hashedPassword,
      role: Role.ADMIN,
      emailVerified: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  });

  const owner1 = await prisma.user.create({
    data: {
      email: 'owner@grandhotel.com',
      name: 'Michael Grand',
      password: hashedPassword,
      role: Role.HOTEL_OWNER,
      emailVerified: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
      phone: '+1-555-0100',
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      email: 'owner@azureresort.com',
      name: 'Sophie Azure',
      password: hashedPassword,
      role: Role.HOTEL_OWNER,
      emailVerified: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophie',
      phone: '+1-555-0200',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Traveler',
      password: hashedPassword,
      role: Role.USER,
      emailVerified: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      phone: '+1-555-0300',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      name: 'Jane Explorer',
      password: hashedPassword,
      role: Role.USER,
      emailVerified: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
    },
  });

  console.log('✅ Users created');

  // Create hotels
  const hotel1 = await prisma.hotel.create({
    data: {
      name: 'The Grand Metropolitan',
      description: 'Experience unparalleled luxury at The Grand Metropolitan, where timeless elegance meets modern sophistication. Located in the heart of the city, our 5-star hotel offers breathtaking views, world-class dining, and exceptional service.',
      address: '100 Park Avenue',
      city: 'New York',
      country: 'United States',
      zipCode: '10017',
      latitude: 40.7549,
      longitude: -73.9840,
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      ],
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Concierge', 'Valet Parking', 'Business Center', 'Room Service'],
      starRating: 5,
      status: HotelStatus.APPROVED,
      ownerId: owner1.id,
      checkInTime: '15:00',
      checkOutTime: '12:00',
    },
  });

  const hotel2 = await prisma.hotel.create({
    data: {
      name: 'Azure Coastal Resort',
      description: 'Nestled along the pristine coastline, Azure Coastal Resort offers an intimate beach experience with stunning ocean views. Perfect for romantic getaways and family vacations with direct beach access and watersports.',
      address: '1 Ocean Drive',
      city: 'Miami',
      country: 'United States',
      zipCode: '33139',
      latitude: 25.7617,
      longitude: -80.1918,
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
      ],
      amenities: ['WiFi', 'Beach Access', 'Pool', 'Spa', 'Water Sports', 'Restaurant', 'Bar', 'Kids Club'],
      starRating: 4,
      status: HotelStatus.APPROVED,
      ownerId: owner2.id,
    },
  });

  const hotel3 = await prisma.hotel.create({
    data: {
      name: 'Alpine Summit Lodge',
      description: 'High in the mountains, Alpine Summit Lodge provides a cozy sanctuary for ski enthusiasts and nature lovers. Featuring ski-in/ski-out access, a heated indoor pool, and rustic mountain charm.',
      address: '500 Summit Road',
      city: 'Aspen',
      country: 'United States',
      zipCode: '81611',
      latitude: 39.1911,
      longitude: -106.8175,
      images: [
        'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800',
        'https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=800',
      ],
      amenities: ['WiFi', 'Ski-in/Ski-out', 'Indoor Pool', 'Hot Tub', 'Fireplace', 'Restaurant', 'Ski Storage'],
      starRating: 4,
      status: HotelStatus.APPROVED,
      ownerId: owner1.id,
    },
  });

  const hotel4 = await prisma.hotel.create({
    data: {
      name: 'Urban Boutique Hotel',
      description: 'A charming boutique hotel in the trendy arts district. Thoughtfully designed rooms with local artwork, farm-to-table breakfast, and a rooftop bar with panoramic city views.',
      address: '42 Arts Boulevard',
      city: 'Austin',
      country: 'United States',
      zipCode: '78701',
      latitude: 30.2672,
      longitude: -97.7431,
      images: [
        'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
      ],
      amenities: ['WiFi', 'Rooftop Bar', 'Breakfast Included', 'Bike Rental', 'Pet Friendly'],
      starRating: 3,
      status: HotelStatus.APPROVED,
      ownerId: owner2.id,
    },
  });

  console.log('✅ Hotels created');

  // Create rooms for hotel1
  const room1 = await prisma.room.create({
    data: {
      hotelId: hotel1.id,
      name: 'Deluxe King Room',
      type: 'DELUXE',
      description: 'Spacious room with king-sized bed and city views',
      images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
      price: 350,
      capacity: 2,
      amenities: ['King Bed', 'City View', 'Mini Bar', 'Smart TV', 'Rain Shower'],
      totalRooms: 20,
    },
  });

  const room2 = await prisma.room.create({
    data: {
      hotelId: hotel1.id,
      name: 'Presidential Suite',
      type: 'SUITE',
      description: 'Our most luxurious suite with panoramic views and butler service',
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
      price: 1200,
      capacity: 4,
      amenities: ['King Bed', 'Living Room', 'Panoramic Views', 'Butler Service', 'Jacuzzi', 'Private Terrace'],
      totalRooms: 3,
    },
  });

  // Create rooms for hotel2
  const room3 = await prisma.room.create({
    data: {
      hotelId: hotel2.id,
      name: 'Ocean View Room',
      type: 'DOUBLE',
      description: 'Wake up to stunning ocean views every morning',
      images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'],
      price: 280,
      capacity: 2,
      amenities: ['Queen Bed', 'Ocean View', 'Balcony', 'Smart TV'],
      totalRooms: 30,
    },
  });

  const room4 = await prisma.room.create({
    data: {
      hotelId: hotel2.id,
      name: 'Beachfront Villa',
      type: 'VILLA',
      description: 'Private villa with direct beach access',
      images: ['https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=800'],
      price: 650,
      capacity: 6,
      amenities: ['2 Bedrooms', 'Private Pool', 'Beach Access', 'Full Kitchen', 'BBQ'],
      totalRooms: 5,
    },
  });

  console.log('✅ Rooms created');

  // Create bookings
  const booking1 = await prisma.booking.create({
    data: {
      userId: user1.id,
      hotelId: hotel1.id,
      roomId: room1.id,
      checkIn: new Date('2026-05-15'),
      checkOut: new Date('2026-05-20'),
      guests: 2,
      totalPrice: 1750,
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      stripePaymentId: 'pi_test_mock_001',
      qrCode: 'QR_BOOKING_001',
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      userId: user2.id,
      hotelId: hotel2.id,
      roomId: room3.id,
      checkIn: new Date('2026-06-01'),
      checkOut: new Date('2026-06-07'),
      guests: 2,
      totalPrice: 1680,
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      stripePaymentId: 'pi_test_mock_002',
    },
  });

  console.log('✅ Bookings created');

  // Create reviews
  await prisma.review.create({
    data: {
      userId: user1.id,
      hotelId: hotel1.id,
      bookingId: booking1.id,
      rating: 5,
      title: 'Absolutely Spectacular!',
      comment: 'The Grand Metropolitan exceeded every expectation. The service was impeccable, the room was stunning, and the location is unbeatable. Will definitely return!',
      helpful: 12,
    },
  });

  await prisma.review.create({
    data: {
      userId: user2.id,
      hotelId: hotel2.id,
      bookingId: booking2.id,
      rating: 4,
      title: 'Perfect Beach Vacation',
      comment: 'Beautiful resort with amazing beach access. The staff was friendly and the pool area was stunning. Only minor issue was the restaurant was a bit slow during peak hours.',
      helpful: 8,
    },
  });

  console.log('✅ Reviews created');

  // Create wishlists
  await prisma.wishlist.create({
    data: { userId: user1.id, hotelId: hotel2.id },
  });
  await prisma.wishlist.create({
    data: { userId: user1.id, hotelId: hotel3.id },
  });

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: user1.id,
      title: 'Booking Confirmed!',
      message: 'Your booking at The Grand Metropolitan has been confirmed for May 15-20.',
      type: 'BOOKING',
      data: { bookingId: booking1.id },
    },
  });

  console.log('✅ Wishlists and notifications created');
  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📧 Login credentials:');
  console.log('  Admin:       admin@staywise.com / Password123!');
  console.log('  Hotel Owner: owner@grandhotel.com / Password123!');
  console.log('  User:        john@example.com / Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
