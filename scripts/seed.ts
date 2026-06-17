import mongoose from 'mongoose';
import User from '../lib/mongodb/models/User';
import Hotel from '../lib/mongodb/models/Hotel';
import Room from '../lib/mongodb/models/Room';

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Hotel.deleteMany({});
    await Room.deleteMany({});

    // Create hotel
    const hotel = await Hotel.create({
      name: 'Grand Hotel',
      description: 'A luxurious 5-star hotel with world-class amenities',
      address: '123 Main Street',
      city: 'New York',
      country: 'USA',
      phone: '+1-800-123-4567',
      email: 'info@grandhotel.com',
      amenities: ['WiFi', 'Gym', 'Pool', 'Restaurant', 'Parking'],
      checkInTime: '14:00',
      checkOutTime: '11:00',
      currency: 'USD',
    });

    console.log('Hotel created:', hotel._id);

    // Create admin user
    const admin = await User.create({
      email: 'admin@hotel.com',
      password: 'admin123', // Will be hashed
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1-800-000-0001',
      role: 'admin',
      emailVerified: true,
    });

    console.log('Admin created:', admin._id);

    // Create receptionist user
    const receptionist = await User.create({
      email: 'receptionist@hotel.com',
      password: 'reception123',
      firstName: 'Reception',
      lastName: 'Staff',
      phone: '+1-800-000-0002',
      role: 'receptionist',
      emailVerified: true,
    });

    console.log('Receptionist created:', receptionist._id);

    // Create sample customer
    const customer = await User.create({
      email: 'customer@email.com',
      password: 'customer123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-123-4567',
      role: 'customer',
      emailVerified: true,
    });

    console.log('Customer created:', customer._id);

    // Create rooms
    const roomTypes = [
      { number: '101', type: 'single', price: 99 },
      { number: '102', type: 'single', price: 99 },
      { number: '201', type: 'double', price: 149 },
      { number: '202', type: 'double', price: 149 },
      { number: '301', type: 'suite', price: 249 },
      { number: '302', type: 'deluxe', price: 299 },
    ];

    for (const roomData of roomTypes) {
      const room = await Room.create({
        hotelId: hotel._id,
        roomNumber: roomData.number,
        type: roomData.type,
        pricePerNight: roomData.price,
        maxGuests: roomData.type === 'single' ? 1 : roomData.type === 'double' ? 2 : 4,
        amenities: ['AC', 'WiFi', 'TV', 'Private Bathroom', 'Minibar'],
        description: `Beautiful ${roomData.type} room with modern amenities`,
        status: 'available',
      });
      console.log(`Room ${roomData.number} created:`, room._id);
    }

    console.log('Seed data created successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@hotel.com / admin123');
    console.log('Receptionist: receptionist@hotel.com / reception123');
    console.log('Customer: customer@email.com / customer123');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
