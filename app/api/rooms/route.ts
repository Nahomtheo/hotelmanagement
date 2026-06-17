import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Room from '@/lib/mongodb/models/Room';
import Hotel from '@/lib/mongodb/models/Hotel';
import { errorResponse, successResponse } from '@/lib/utils/errorHandler';
import { roomCreationSchema } from '@/lib/validations';
import { authOptions } from '@/lib/auth';

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

    // Validate input
    const validation = roomCreationSchema.safeParse(body);
    if (!validation.success) {
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
        name: 'Default Hotel',
        address: 'Hotel Address',
        city: 'City',
        country: 'Country',
      });
      await hotel.save();
    }

    const room = new Room({
      hotelId: hotel._id,
      ...validation.data,
    });

    await room.save();

    return NextResponse.json(
      successResponse(room, 'Room created successfully', 201),
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
