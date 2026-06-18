import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { errorResponse, successResponse } from '@/lib/utils/errorHandler';
import { checkOutGuest } from '@/lib/services/bookingService';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!(session?.user as any).id || (role !== 'receptionist' && role !== 'admin')) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const booking = await params;
    const bookingId = booking.id;
    const bookings = await checkOutGuest(bookingId);

    return NextResponse.json(
      successResponse(bookings, 'Guest checked out successfully')
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    return NextResponse.json(
      errorResponse(message),
      { status: 400 }
    );
  }
}
