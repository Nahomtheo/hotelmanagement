import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { errorResponse, successResponse } from '@/lib/utils/errorHandler';
import { checkInGuest, checkOutGuest } from '@/lib/services/bookingService';
import { authOptions } from '../../../auth/[...nextauth]/route';

// Check-in
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session?.user?.id || (role !== 'receptionist' && role !== 'admin')) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const bookingId = params.id;

    // Determine which action based on pathname
    const url = req.url;
    const isCheckIn = url.includes('/check-in');

    if (isCheckIn) {
      const booking = await checkInGuest(bookingId);
      return NextResponse.json(
        successResponse(booking, 'Guest checked in successfully')
      );
    } else {
      const booking = await checkOutGuest(bookingId);
      return NextResponse.json(
        successResponse(booking, 'Guest checked out successfully')
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    return NextResponse.json(
      errorResponse(message),
      { status: 400 }
    );
  }
}
