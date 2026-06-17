import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/mongodb/models/User';
import { errorResponse, successResponse } from '@/lib/utils/errorHandler';
import {getServerSession} from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params:  Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        errorResponse('Verification token is required'),
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: new Date() },
      isDeleted: false,
    });
   await User.findOneAndDelete({
      emailVerificationExpiry: { $lt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        errorResponse('Invalid or expired verification token'),
        { status: 400 }
      );
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    return NextResponse.json(
      successResponse({ email: user.email }, 'Email verified successfully')
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      errorResponse('Verification failed'),
      { status: 500 }
    );
  }
}
