import { NextRequest, NextResponse } from "next/server";
import Table from "@/lib/mongodb/models/Table"; // Adjust path to your Table model
import { connectDB } from "@/lib/mongodb"; // Optional: DB connection helper
import mongoose from "mongoose";


export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json();

    const { tableNumber, capacity, location, status } = body;

    // Validation
    if (!tableNumber || !capacity || !location) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: tableNumber, capacity, or location." },
        { status: 400 }
      );
    }

    // Check if table number already exists
    const existingTable = await Table.findOne({ tableNumber, isDeleted: { $ne: true } });
    if (existingTable) {
      return NextResponse.json(
        { success: false, error: `Table number ${tableNumber} already exists.` },
        { status: 400 }
      );
    }

    const newTable = await Table.create({
      tableNumber: Number(tableNumber),
      capacity: Number(capacity),
      location,
      status: status || "available",
      isDeleted: false,
    });

    return NextResponse.json({ success: true, data: newTable }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create table" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB()

   
    const tables = await Table.find({ isDeleted: { $ne: true } }).sort({ tableNumber: 1 });

    return NextResponse.json({ success: true, data: tables }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch tables" },
      { status: 500 }
    );
  }
}

// ==========================================
// 3. PUT - Update a Table
// ==========================================
export async function PUT(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Valid Table ID is required for update." },
        { status: 400 }
      );
    }

    const updatedTable = await Table.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedTable) {
      return NextResponse.json(
        { success: false, error: "Table not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedTable }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update table" },
      { status: 500 }
    );
  }
}

// ==========================================
// 4. DELETE - Soft Delete a Table
// ==========================================
export async function DELETE(req: NextRequest) {
  try {
    await connectDB()

    // Extract ID from URL search params (e.g., /api/table?id=65f123...)
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Valid Table ID is required for deletion." },
        { status: 400 }
      );
    }

    // Soft delete table by flagging isDeleted
    const deletedTable = await Table.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedTable) {
      return NextResponse.json(
        { success: false, error: "Table not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Table deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete table" },
      { status: 500 }
    );
  }
}