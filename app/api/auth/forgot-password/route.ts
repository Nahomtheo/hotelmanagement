import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/mongodb/models/User';
import { errorResponse, successResponse } from '@/lib/utils/errorHandler';
import { generatePasswordResetToken, sendPasswordResetEmail } from '@/lib/services/notificationService';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        errorResponse('Email is required'),
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    });

    // Always return success for security
    if (!user) {
      return NextResponse.json(
        successResponse(null, 'If this email exists, a password reset link will be sent')
      );
    }

    // Generate reset token
    const { token, expiry } = generatePasswordResetToken();

    user.resetPasswordToken = token;
    user.resetPasswordExpiry = expiry;
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(email, user.firstName, token);

    return NextResponse.json(
      successResponse(null, 'Password reset link has been sent to your email')
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      errorResponse('Failed to process request'),
      { status: 500 }
    );
  }
}
