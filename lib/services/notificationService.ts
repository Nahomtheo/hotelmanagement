import { Resend } from 'resend';
import crypto from 'crypto';
import { connectDB } from '../mongodb';
import Notification from '../mongodb/models/Notification';
import User from '../mongodb/models/User';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "onboarding@resend.dev";

/**
 * Send email verification
 */
export async function sendVerificationEmail(email: string, firstName: string, token: string) {
  const verificationLink = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/auth/email-verification/${token}`;

  try {
    console.log(process.env.RESEND_API_KEY);
     
    const verificationEmailSent = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your email address',
      html: `
        <h2>Welcome, ${firstName}!</h2>
        <p>Please verify your email address to complete your registration.</p>
        <a href="${verificationLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
        <p>This link expires in 24 hours.</p>
      `,
    });
  


    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, firstName: string, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/auth/reset-password/${token}`;

  try {
    const verificationEmailSent = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${firstName},</p>
        <p>We received a request to reset your password. Click the button below to proceed.</p>
        <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
    if (verificationEmailSent) {
      return true;
    } else {
      console.error(`Failed to send password reset email to ${email}`);
      return false;
    }

    
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
}

/**
 * Send booking confirmation
 */
export async function sendBookingConfirmation(
  email: string,
  guestName: string,
  bookingDetails: {
    bookingId: string;
    roomNumber: string;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
  }
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Booking Confirmation',
      html: `
        <h2>Booking Confirmed!</h2>
        <p>Hi ${guestName},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <ul>
          <li><strong>Booking ID:</strong> ${bookingDetails.bookingId}</li>
          <li><strong>Room:</strong> ${bookingDetails.roomNumber}</li>
          <li><strong>Check-in:</strong> ${bookingDetails.checkIn}</li>
          <li><strong>Check-out:</strong> ${bookingDetails.checkOut}</li>
          <li><strong>Total Price:</strong> $${bookingDetails.totalPrice}</li>
        </ul>
        <p>Thank you for choosing us!</p>
      `,
    });

    return true;
  } catch (error) {
    console.error('Failed to send booking confirmation:', error);
    throw error;
  }
}

/**
 * Send booking cancellation
 */
export async function sendBookingCancellation(
  email: string,
  guestName: string,
  bookingId: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Booking Cancelled',
      html: `
        <h2>Booking Cancelled</h2>
        <p>Hi ${guestName},</p>
        <p>Your booking (ID: ${bookingId}) has been cancelled.</p>
        <p>If you have any questions, please contact us.</p>
      `,
    });

    return true;
  } catch (error) {
    console.error('Failed to send cancellation email:', error);
    throw error;
  }
}

/**
 * Generate verification token
 */
export function generateVerificationToken(): { token: string; expiry: Date } {
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return { token, expiry };
}

/**
 * Generate password reset token
 */
export function generatePasswordResetToken(): { token: string; expiry: Date } {
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return { token, expiry };
}

/**
 * Create in-app notification
 */
export async function createNotification(
  userId: string,
  type: 'booking_confirmation' | 'booking_cancelled' | 'check_in_reminder' | 'check_out_reminder' | 'review_request',
  title: string,
  message: string,
  bookingId?: string
) {
  try {
    await connectDB();

    const notification = new Notification({
      userId,
      type,
      title,
      message,
      bookingId,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}
