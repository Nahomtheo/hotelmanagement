import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Room from '@/lib/mongodb/models/Room';
import Hotel from '@/lib/mongodb/models/Hotel';
import { errorResponse, successResponse } from '@/lib/utils/errorHandler';
import { roomCreationSchema } from '@/lib/validations';
import { authOptions } from '@/lib/auth';
import Booking from '@/lib/mongodb/models/Booking';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');

    await connectDB();

    let query: any = { isDeleted: false };

    if (type) {
      query.type = type;
    }

    // If checking availability
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      // This is simplified - in production, you'd check Booking model
      query.status = 'available';
    }

    const skip = (page - 1) * limit;
    const rooms = await Room.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
      const expiredTime = new Date(Date.now() - 90 * 60 * 1000); // 90 minutes ago
  
    const expiredBookings = await Booking.find({
     isDeleted: false,
     status: "pending",
     createdAt: { $lt: expiredTime },
});
  await Promise.all(expiredBookings.map(async (booking) => {
    await Booking.findByIdAndUpdate(booking._id, { status: 'cancelled' });
    await Room.findByIdAndUpdate(booking.roomId, { status: 'available' });
  }));

    const total = await Room.countDocuments(query);

    return NextResponse.json(
      successResponse({
        rooms,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    console.error('Get rooms error:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch rooms'),
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!(session?.user as any)?.id || (session?.user as any).role !== 'admin') {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log('Received room creation request:', body);

    // Validate input
    const validation = roomCreationSchema.safeParse(body);
    if (!validation.success) {
      console.log('Validation errors:', validation.error.flatten().fieldErrors);
      return NextResponse.json(
        errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors as any),
        { status: 400 }
      );
      
    }

    await connectDB();

    // Get default hotel
    let hotel = await Hotel.findOne({ isDeleted: false });
    if (!hotel) {
      hotel = new Hotel({
        name: 'MW Hotel',
        address: 'Bole ednamall',
        city: 'Addis Ababa',
        country: 'Ethiopia',
      });
      await hotel.save();
    }

    const room = new Room({
      hotelId: hotel._id,
      ...validation.data,
      images: body.images || [],
      description: body.description || '',
      status: 'available',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await room.save();

    return NextResponse.json(
      successResponse(room, 'Room created successfully' , 201),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json(
      errorResponse('Failed to create room'),
      { status: 500 }
    );
  }
}
