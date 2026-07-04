import { connectDB } from '../mongodb';
import Booking, { IBooking } from '../mongodb/models/Booking';
import Room, { IRoom } from '../mongodb/models/Room';
import User from '../mongodb/models/User';
import { calculateNights, calculateTotalPrice, checkDateOverlap } from '../utils/dateHelpers';
import { sendBookingConfirmation, createNotification, sendBookingCancellation } from './notificationService';

/**
 * Check room availability for date range
 */
export async function checkRoomAvailability(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: string
): Promise<boolean> {
  try {
    await connectDB();

    const query: any = {
      roomId,
      status: { $in: ['confirmed', 'checked_in'] },
      isDeleted: false,
    };

    // Exclude current booking if provided (for updates)
    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }

    const conflictingBookings = await Booking.find(query);

    // Check for overlaps
    for (const booking of conflictingBookings) {
      if (checkDateOverlap(
        new Date(booking.checkInDate),
        new Date(booking.checkOutDate),
        checkIn,
        checkOut
      )) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
}

/**
 * Get available rooms for date range
 */
export async function getAvailableRooms(
  checkIn: Date,
  checkOut: Date,
  maxGuests?: number,
  roomType?: string
): Promise<IRoom[]> {
  try {
    await connectDB();

    let query: any = {
      isDeleted: false,
      status: 'available',
    };

    if (maxGuests) {
      query.maxGuests = { $gte: maxGuests };
    }

    if (roomType) {
      query.type = roomType;
    }

    const availableRooms = await Room.find(query);

    // Filter out rooms with conflicting bookings
    const filtered: IRoom[] = [];

    for (const room of availableRooms) {
      const isAvailable = await checkRoomAvailability(
        room._id.toString(),
        checkIn,
        checkOut
      );

      if (isAvailable) {
        filtered.push(room);
      }
    }

    return filtered;
  } catch (error) {
    console.error('Error getting available rooms:', error);
    throw error;
  }
}

/**
 * Create booking
 */
export async function createBooking(
  roomId: string,
  userId: string,
  guestName: string,
  guestEmail: string,
  guestPhone: string,
  checkInDate: Date,
  checkOutDate: Date,
  numberOfGuests: number,
  specialRequests?: string
): Promise<IBooking> {
  try {
    await connectDB();

    // Check room exists
    const room = await Room.findById(roomId);
    if (!room || room.isDeleted) {
      throw new Error('Room not found');
    }

    // Check availability
    const isAvailable = await checkRoomAvailability(roomId, checkInDate, checkOutDate);
    if (!isAvailable) {
      throw new Error('Room is not available for selected dates');
    }

    // Validate dates
    if (checkOutDate <= checkInDate) {
      throw new Error('Check-out date must be after check-in date');
    }

    if (checkInDate < new Date()) {
      throw new Error('Check-in date cannot be in the past');
    }

    // Calculate nights and total
    const numberOfNights = calculateNights(checkInDate, checkOutDate);
    const totalPrice = calculateTotalPrice(room.pricePerNight, numberOfNights);

    // Create booking
    const booking = new Booking({
      roomId,
      userId,
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      numberOfNights,
      pricePerNight: room.pricePerNight,
      totalPrice,
      specialRequests,
      status: 'confirmed',
    });
    const bookeddate=Date.now();

    await booking.save();

    // Update room status
    await Room.findByIdAndUpdate(roomId, { status: 'occupied' });
    if(bookeddate - Date.now() > 30*60*1000){
      await Booking.findByIdAndUpdate(booking._id, { status: 'cancelled' });
      await Room.findByIdAndUpdate(roomId, { status: 'available' });
    }

    // Send confirmation email
    await sendBookingConfirmation(guestEmail, guestName, {
      bookingId: booking._id.toString(),
      roomNumber: room.roomNumber,
      checkIn: checkInDate.toISOString().split('T')[0],
      checkOut: checkOutDate.toISOString().split('T')[0],
      totalPrice,
    });

    // Create notification
    await createNotification(
      userId,
      'booking_confirmation',
      'Booking Confirmed',
      `Your booking for ${room.roomNumber} has been confirmed. Total: $${totalPrice}`,
      booking._id.toString()
    );

    return booking;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

/**
 * Cancel booking
 */
export async function cancelBooking(bookingId: string): Promise<IBooking> {
  try {
    await connectDB();

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.isDeleted) {
      throw new Error('Booking not found');
    }

    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Update room status back to available
    await Room.findByIdAndUpdate(booking.roomId, { status: 'available' });

    // Send cancellation email
    await sendBookingCancellation(booking.guestEmail, booking.guestName, bookingId);

    // Create notification
    await createNotification(
      booking.userId.toString(),
      'booking_cancelled',
      'Booking Cancelled',
      `Your booking (${booking._id}) has been cancelled.`,
      bookingId
    );

    return booking;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
}

/**
 * Check in guest
 */
export async function checkInGuest(bookingId: string): Promise<IBooking> {
  try {
    await connectDB();

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.isDeleted) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'confirmed') {
      throw new Error('Only confirmed bookings can be checked in');
    }

    booking.status = 'checked_in';
    await booking.save();

    return booking;
  } catch (error) {
    console.error('Error checking in guest:', error);
    throw error;
  }
}

/**
 * Check out guest
 */
export async function checkOutGuest(bookingId: string): Promise<IBooking> {
  try {
    await connectDB();

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.isDeleted) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'checked_in') {
      throw new Error('Only checked-in guests can be checked out');
    }

    booking.status = 'checked_out';
    await booking.save();

    // Update room status
    await Room.findByIdAndUpdate(booking.roomId, { status: 'available' });

    // Create notification
    await createNotification(
      booking.userId.toString(),
      'check_out_reminder',
      'Checked Out Successfully',
      `You have been checked out of room ${booking.roomId}. Thank you for your stay!`,
      bookingId
    );

    return booking;
  } catch (error) {
    console.error('Error checking out guest:', error);
    throw error;
  }
}
