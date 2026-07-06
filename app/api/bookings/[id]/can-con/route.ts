import {  cancelorconfirmBooking } from "@/lib/services/bookingService";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { errorResponse } from "@/lib/utils/errorHandler";

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
    const booking = await params
    const bookingId = booking.id;
    const geturl=req.url;
    const isConfirm = geturl.includes('confirm');
    const isCancel = geturl.includes('cancel');
    if (!isConfirm && !isCancel) {
      return NextResponse.json(
        errorResponse('Invalid request'),
        { status: 400 }
      );
    }
    if (isConfirm) {
      const confirmedBooking = await cancelorconfirmBooking(bookingId, 'confirm');
      return NextResponse.json(
        { success: true, message: 'Booking updated successfully', data: confirmedBooking }
      );
    }
    if (isCancel) {
      const cancelledBooking = await cancelorconfirmBooking(bookingId, 'cancel');
      return NextResponse.json(
        { success: true, message: 'Booking updated successfully', data: cancelledBooking }
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
 
