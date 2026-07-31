import { NextRequest, NextResponse } from "next/server";
import Table from "@/lib/mongodb/models/Table"; // Adjust path to your Table model
import { connectDB } from "@/lib/mongodb"; // Optional: DB connection helper
import mongoose from "mongoose";
import TableReservation from "@/lib/mongodb/models/TableReservation";


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

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const tableId = searchParams.get('tableId');
    const status = searchParams.get('status');

    // 1. Initialize filter object with soft-delete check
    const filter: any = { isDeleted: { $ne: true } };

    // 2. Validate and add tableId if present
    if (tableId) {
      if (!mongoose.Types.ObjectId.isValid(tableId)) {
        return NextResponse.json(
          { success: false, error: "Invalid Table ID format." },
          { status: 400 }
        );
      }
      filter._id = tableId; 
    }

    // 3. Add status filter if present
    if (status) {
      filter.status = status;
    }

    // 4. Query Mongoose with the unified filter object
    const tables = await TableReservation.find(filter).sort({ tableNumber: 1 }).lean();

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

    const updatedTable = await TableReservation.findByIdAndUpdate(id, updates, {
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
    const deletedTable = await TableReservation.findByIdAndUpdate(
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