import { NextRequest, NextResponse } from "next/server";
import { createFoodOrder} from "@/lib/services/restaurantService"; // Adjust import path
import Food from "@/lib/mongodb/models/Food"; // Adjust import path
import { connectDB } from '@/lib/mongodb';
import { get } from "http";
import FoodOrder from "@/lib/mongodb/models/FoodOrder";
import Booking from "@/lib/mongodb/models/Booking";
import {authOptions} from "@/lib/auth";
import { getServerSession } from "next-auth/next";



export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const userId = (session?.user as any )?.id; // Assuming the session contains the user ID
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Invalid user session" },
        { status: 401 }
      );
    }
    const body = await req.json();
    console.log(body, "these are the sent bodies");

    let payload = { ...body };
    payload.userId = userId; // Attach the user ID to the payload

    // 1. If ordering for a room, find the active booking
    if (body.roomId) {
      const activeBooking = await Booking.findOne({
        roomId: body.roomId,
        status: "checked_in", // Only match current guest
      }).sort({ createdAt: -1 });

      if (!activeBooking) {
        return NextResponse.json(
          { success: false, error: "No active checked-in booking found for this room." },
          { status: 404 }
        );
      }

      // Attach the booking ID cleanly
      payload.booking_id = activeBooking._id;
    }
    console.log(payload, "this is the payload before creating the order");

    // 2. Create the order with updated payload
    const result = await createFoodOrder(payload);

    // 3. Handle failure
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // 4. Return success response (runs for BOTH room and table orders)
    return NextResponse.json(
      { success: true, data: result.data },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create order",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/food
 * Get all active menu items
 */
export async function GET(req:Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("tableId");
    const paymentStatus=searchParams.get("paymentStatus")
    const filter: any = { isDeleted: { $ne: true } };

    if (id){
      filter.tableId = id;
    }
    if(paymentStatus){
      filter.paymentStatus=paymentStatus
    }
    if (searchParams.get("createdAt")) {
      const createdAt = new Date(searchParams.get("createdAt")!);
      const startOfDay = new Date(createdAt);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }
    await connectDB()

    const foodorder = await FoodOrder.find(filter)
    .populate('foods.foodId' , 'name ,category' )
    .populate('userId', 'name email')
    .populate('tableId', 'number status')
    .populate('booking_Id', 'bookingDate')
    .sort({createdAt: -1,})
    .lean()
 

    return NextResponse.json(
      { success: true, data: foodorder },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}