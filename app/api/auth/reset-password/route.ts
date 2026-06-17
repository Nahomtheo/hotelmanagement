import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/mongodb/models/User';
import { errorResponse, successResponse } from '@/lib/utils/errorHandler';

export async function POST(req: NextRequest) {
  try {
    const { token, password, confirmPassword } = await req.json();

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        errorResponse('Missing required fields'),
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        errorResponse('Passwords do not match'),
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        errorResponse('Password must be at least 6 characters'),
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() },
      isDeleted: false,
    });

    if (!user) {
      return NextResponse.json(
        errorResponse('Invalid or expired reset token'),
        { status: 400 }
      );
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    return NextResponse.json(
      successResponse(null, 'Password reset successful. Please login with your new password.')
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      errorResponse('Failed to reset password'),
      { status: 500 }
    );
  }
}
