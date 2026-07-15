import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/mongodb/models/User';
import { authOptions } from '@/lib/auth';
import Booking from '@/lib/mongodb/models/Booking';

// NOTE: Changed from GET to PUT/PATCH because GET requests should not contain a body
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    // 1. Check authentication & authorization
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (userRole !== 'receptionist' && userRole !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // 2. Safely parse the JSON body to handle blank requests
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json({ message: 'Missing or invalid JSON body' }, { status: 400 });
    }

    const { passport_no, phone_no, reasonOfStay, id_no, nationality } = body;

    // 3. Build an update object containing only fields that were actually provided
    const updateData: Record<string, any> = {};
    if (passport_no !== undefined) updateData.passport_no = passport_no;
    if (phone_no !== undefined) updateData.phone_no = phone_no;
    if (reasonOfStay !== undefined) updateData.reasonOfStay = reasonOfStay;
    if (id_no !== undefined) updateData.id_no = id_no;
    if (nationality !== undefined) updateData.nationality = nationality;

    // 4. Validate if the update data is completely blank
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No fields provided for update' }, { status: 400 });
    }

    // 5. Update the user database entry
       
    
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { $set: updateData }, // Using $set ensures Mongoose only touches provided fields
     
    );

    if (!updatedBooking) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User updated successfully', data: updatedBooking }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}