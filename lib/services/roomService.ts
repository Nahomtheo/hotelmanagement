import mongoose from "mongoose";
import Booking from "@/lib/mongodb/models/Booking";
import Room from "../mongodb/models/Room";

export async function isRoomAvailable(
  roomId: mongoose.Types.ObjectId | string,
  requestedCheckIn: Date,
  requestedCheckOut: Date
): Promise<boolean> {

  const conflict = await Booking.exists({
    roomId,
    isDeleted: false,
    status: { $in: ["confirmed", "checked_in"] },
    checkInDate: { $lt: requestedCheckOut },
    checkOutDate: { $gt: requestedCheckIn },
  });

  return !conflict;
}


export async function getAvailableRooms(
  requestedCheckIn: Date,
  requestedCheckOut: Date
) {

  const bookedRoomIds = await Booking.find({
    isDeleted: false,
    status: { $in: ["confirmed", "checked_in"] },
    checkInDate: { $lt: requestedCheckOut },
    checkOutDate: { $gt: requestedCheckIn },
  }).distinct("roomId");
  

  return  await Room.find({
     
    _id: { $nin: bookedRoomIds },
  });
}
export async function getRoomCalendar(
  roomId: string,
  year: number,
  month: number
) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  return Booking.find({
    roomId,
    isDeleted: false,
  
    checkInDate: { $lt: end },
    checkOutDate: { $gt: start },
  }).sort({ checkInDate: 1 });
}