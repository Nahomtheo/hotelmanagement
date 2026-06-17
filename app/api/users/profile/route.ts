import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/mongodb/models/User';
import { errorResponse, successResponse } from '@/lib/utils/errorHandler';
import { authOptions } from '../../[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).select('-password');

    if (!user || user.isDeleted) {
      return NextResponse.json(
        errorResponse('User not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
      })
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch profile'),
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const body = await req.json();
    const { firstName, lastName, phone } = body;

    await connectDB();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        firstName,
        lastName,
        phone,
      },
      { new: true }
    ).select('-password');

    return NextResponse.json(
      successResponse(user, 'Profile updated successfully')
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      errorResponse('Failed to update profile'),
      { status: 500 }
    );
  }
}
