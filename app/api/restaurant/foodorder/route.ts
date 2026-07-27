import { NextRequest, NextResponse } from "next/server";
import { createFoodOrder} from "@/lib/services/restaurantService"; // Adjust import path
import Food from "@/lib/mongodb/models/Food"; // Adjust import path
import { connectDB } from '@/lib/mongodb';

/**
 * POST /api/food
 * Create a new menu item
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log (body,'this are the sent bodies')

    const result = await createFoodOrder(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create menu item" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/food
 * Get all active menu items
 */
export async function GET() {
  try {
    await connectDB()

    const menuItems = await Food.find({ isDeleted: { $ne: true } })
    .populate('foods.foodId' )
    .sort({createdAt: -1,})
    .lean()

    return NextResponse.json(
      { success: true, data: menuItems },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}