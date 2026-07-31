import { NextRequest, NextResponse } from "next/server";
import { createFoodOrder} from "@/lib/services/restaurantService"; // Adjust import path
import Food from "@/lib/mongodb/models/Food"; // Adjust import path
import { connectDB } from '@/lib/mongodb';
import { get } from "http";
import FoodOrder from "@/lib/mongodb/models/FoodOrder";

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
    await connectDB()

    const foodorder = await FoodOrder.find(filter)
    .populate('foods.foodId' , 'name ,category' )
    .sort({createdAt: -1,})
    .lean()
    console.log(foodorder,": this are food order from api")

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