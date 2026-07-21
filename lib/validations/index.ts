import { z } from 'zod';
import { NATIONALITIES } from '@/constants/nationalities';

export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  phone: z.string().min(10, 'Phone number is required'),
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const bookingValidationSchema = z.object({
  roomId: z.string().min(1, 'Room is required'),
  guestName: z.string().min(2, 'Guest name is required'),
  guestEmail: z.string().email('Invalid email'),
  guestPhone: z.string().min(10, 'Phone number is required'),
  nationality: z.string().min(1, 'Please select a nationality'),

  reasonOfStay: z.string().min(4,'please write your reason of stay'),
  checkInDate: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Check-in date must be in the future',
  }),
  checkOutDate: z.string(),
  numberOfGuests: z.number().min(1, 'At least one guest is required'),
  specialRequests: z.string().optional(),
    passport_no : z.string().optional(),
  id_no : z.string().optional(),
});

export const roomCreationSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  type: z.enum(['single', 'double', 'suite', 'deluxe','conference hall']),
  pricePerNight: z.number().min(0, 'Price must be positive'),
  maxGuests: z.number().min(1),
  amenities: z.array(z.string()).default([]),
  description: z.string().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().max(1000, 'Comment is too long'),
});

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type BookingInput = z.infer<typeof bookingValidationSchema>;
export type RoomInput = z.infer<typeof roomCreationSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
