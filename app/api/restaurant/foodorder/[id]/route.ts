import { NextRequest, NextResponse } from "next/server";
import Food from "@/lib/mongodb/models/Food";
import FoodOrder from "@/lib/mongodb/models/FoodOrder";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import Table from "@/lib/mongodb/models/Table";
import Booking from "@/lib/mongodb/models/Booking";

interface RouteParams {
  params: { id: string };
}


export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB(); // 1. Added parentheses to execute DB connection
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid Food Order ID" },
        { status: 400 }
      );
    }

    const updates = await req.json();
        
    
        let payload = { ...updates };
    
        // 1. If ordering for a room, find the active booking
        if (updates.roomId) {
          const activeBooking = await Booking.findOne({
            roomId: updates.roomId,
            status: "checked_in", // Only match current guest
          }).sort({ createdAt: -1 });
    
          if (!activeBooking) {
            return NextResponse.json(
              { success: false, error: "No active checked-in booking found for this room." },
              { status: 404 }
            );
          }
    
          // Attach the booking ID cleanly
          payload.booking_Id = activeBooking._id;
        }

    // 2. Perform the order update
    const updatedFoodorder = await FoodOrder.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
console.log( payload,'this is the updated food order')

    const remainingUnpaidO= await FoodOrder.find({tableId: updatedFoodorder?.tableId,
  paymentStatus: 'pending'},)
  if (remainingUnpaidO.length === 0) {
  await Table.findByIdAndUpdate( updatedFoodorder?.tableId,{ status: 'available' });
}
    // 3. Guard against non-existent order before running post-update logic
    if (!updatedFoodorder) {
      return NextResponse.json(
        { success: false, error: "Food order not found" },
        { status: 404 }
      );
    }

    // 4. Update the corresponding Table status when payment is settled


    return NextResponse.json(
      { success: true, data: updatedFoodorder },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update food order" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/food/[id]
 * Delete a food item (Soft delete by setting isDeleted: true)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid Food ID" },
        { status: 400 }
      );
    }

    // Soft delete recommended to preserve historical order logs
    const deletedFood = await FoodOrder.findByIdAndUpdate(
      id,
      { isDeleted: true,},
      { new: true }
    );

    // If you want hard delete instead, use:
    // const deletedFood = await Food.findByIdAndDelete(id);

    if (!deletedFood) {
      return NextResponse.json(
        { success: false, error: "Food item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Food item deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete food item" },
      { status: 500 }
    );
  }
}