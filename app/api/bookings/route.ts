import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/lib/mongodb/models/Booking';
import { errorResponse, successResponse } from '@/lib/utils/errorHandler';
import { bookingValidationSchema } from '@/lib/validations';
import { createBooking, checkInGuest, checkOutGuest } from '@/lib/services/bookingService';
import { authOptions } from '@/lib/auth';
import Room from '@/lib/mongodb/models/Room';
import { isRoomAvailable } from '@/lib/services/roomService';

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
      console.log('user id for booking',(session?.user as any)?.id)
    
    const bookings = await Booking.find(query)
      .skip(skip)
      .limit(limit)
      .populate('roomId')
      .populate('userId')
      .populate("cancelledBy", "firstName email")
      .populate("checkedInBy", "firstName email")
      .populate("checkedOutBy", "firstName email")
      .populate("confirmedBy", "firstName email")
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
    console.log('Booking request body:', body); // Log the request body for debugging

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
       nationality,
      reasonOfStay,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      specialRequests,
       passport_no,
      id_no,
    } = validation.data;
    console.log("validation,", roomId,
      guestName,
      guestEmail,
      guestPhone,
       nationality,
      reasonOfStay,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      specialRequests,
       passport_no,
      id_no,)
console.log('user id for booking',(session?.user as any)?.id)
     const roomIsavailable= await isRoomAvailable(body.roomId,new Date(body.checkInDate),new Date(body.checkOutDate))
   if (!roomIsavailable) {
  return NextResponse.json(
    errorResponse("Sorry, the room is already booked for the selected dates"),
    { status: 409 }
  );
}
    
    // Create booking
    const booking = await createBooking(
      body.roomId,
      (session?.user as any)?.id,
      body.guestName,
      body.guestEmail,
      body.guestPhone,
      body.nationality,
      body.reasonOfStay,
      new Date(body.checkInDate),
      new Date(body.checkOutDate),
      body.numberOfGuests,
      body.specialRequests,
      body.passport_no ,
      body.id_no ,
    );

    return NextResponse.json(
      successResponse(booking, 'Booking created successfully', 201),
      { status: 200}
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
