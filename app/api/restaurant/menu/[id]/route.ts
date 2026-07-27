import { NextRequest, NextResponse } from "next/server";
import Food from "@/lib/mongodb/models/Food";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

interface RouteParams {
  params: { id: string };
}

/**
 * PUT /api/food/[id]
 * Update an existing menu item
 */
export async function PUT(
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

    const updates = await req.json();

    const updatedFood = await Food.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedFood) {
      return NextResponse.json(
        { success: false, error: "Food item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedFood },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update food item" },
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
    const deletedFood = await Food.findByIdAndUpdate(
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