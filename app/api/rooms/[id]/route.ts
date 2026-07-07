import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Room from "@/lib/mongodb/models/Room";
import { errorResponse } from "@/lib/utils/errorHandler";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    const role = (session?.user as any)?.role;

    if (
      !(session?.user as any)?.id ||
      (role !== "admin" && role !== "receptionist")
    ) {
      return NextResponse.json(errorResponse("Unauthorized"), {
        status: 401,
      });
    }

    await connectDB();
    const rooms= await params
    const roomId = rooms.id;

    const {
      roomNumber,
      type,
      pricePerNight,
      maxGuests,
      amenities,
      images,
      description,
      status,
    } = await req.json();

    const room = await Room.findById(roomId);

    if (!room) {
      return NextResponse.json(errorResponse("Room not found"), {
        status: 404,
      });
    }

    // Find images that were removed
    const removedImages = room.images.filter(
      (oldImage: any) =>
        !images.some(
          (newImage: any) => newImage.publicId === oldImage.publicId
        )
    );

    // Delete removed images from Cloudinary
    await Promise.all(
      removedImages.map((image: any) =>
        cloudinary.uploader.destroy(image.publicId)
      )
    );

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      {
        roomNumber,
        type,
        pricePerNight,
        maxGuests,
        amenities,
        images,
        description,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Room updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      errorResponse("Internal server error"),
      {
        status: 500,
      }
    );
  }
}