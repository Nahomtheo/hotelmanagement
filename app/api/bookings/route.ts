import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/lib/mongodb/models/Booking';
import { errorResponse, successResponse } from '@/lib/utils/errorHandler';
import { bookingValidationSchema } from '@/lib/validations';
import { createBooking, checkInGuest, checkOutGuest } from '@/lib/services/bookingService';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if ((!session?.user as any)?.id) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectDB();

    let query: any = { isDeleted: false };

    // Customers can only see their bookings
    if ((session?.user as any)?.role === 'customer') {
      query.userId = (session?.user as any)?.id;
    }

    const skip = (page - 1) * limit;
    const bookings = await Booking.find(query)
      .skip(skip)
      .limit(limit)
      .populate('roomId')
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);

    return NextResponse.json(
      successResponse({
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch bookings'),
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if ((!session?.user as any)?.id) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate input
    const validation = bookingValidationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors as any),
        { status: 400 }
      );
    }

    const {
      roomId,
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      specialRequests,
    } = validation.data;

    // Create booking
    const booking = await createBooking(
      roomId,
      (session?.user as any)?.id,
      guestName,
      guestEmail,
      guestPhone,
      new Date(checkInDate),
      new Date(checkOutDate),
      numberOfGuests,
      specialRequests
    );

    return NextResponse.json(
      successResponse(booking, 'Booking created successfully', 201),
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create booking';
    console.error('Create booking error:', error);
    return NextResponse.json(
      errorResponse(message),
      { status: 400 }
    );
  }
}
