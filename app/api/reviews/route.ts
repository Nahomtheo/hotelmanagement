import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Review from '@/lib/mongodb/models/Review';
import Booking from '@/lib/mongodb/models/Booking';
import { errorResponse, successResponse } from '@/lib/utils/errorHandler';
import { reviewSchema } from '@/lib/validations';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectDB();

    let query: any = { isDeleted: false };

    if (roomId) {
      query.roomId = roomId;
    }

    const skip = (page - 1) * limit;
    const reviews = await Review.find(query)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments(query);

    return NextResponse.json(
      successResponse({
        reviews,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      })
    );
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch reviews'),
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const body = await req.json();
    const { bookingId, roomId, rating, comment } = body;

    // Validate input
    const validation = reviewSchema.safeParse({ rating, comment });
    if (!validation.success) {
      return NextResponse.json(
        errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors as any),
        { status: 400 }
      );
    }

    await connectDB();

    // Check if booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.userId.toString() !== session.user.id) {
      return NextResponse.json(
        errorResponse('Invalid booking'),
        { status: 400 }
      );
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      bookingId,
      userId: session.user.id,
      isDeleted: false,
    });

    if (existingReview) {
      return NextResponse.json(
        errorResponse('You have already reviewed this booking'),
        { status: 400 }
      );
    }

    const review = new Review({
      bookingId,
      roomId,
      userId: session.user.id,
      rating: validation.data.rating,
      comment: validation.data.comment,
    });

    await review.save();

    return NextResponse.json(
      successResponse(review, 'Review created successfully', 201),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json(
      errorResponse('Failed to create review'),
      { status: 500 }
    );
  }
}
