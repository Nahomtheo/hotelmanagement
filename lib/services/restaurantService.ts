import { connectDB } from '../mongodb';
import mongoose from "mongoose";
import Food from "@/lib/mongodb/models/Food";
import FoodOrder from "../mongodb/models/FoodOrder";
import TableReservation from "../mongodb/models/TableReservation";
import Room from "../mongodb/models/Room";
import Table from '../mongodb/models/Table';

export interface ImagesData{
  url:string,
  publicId:string
}

export interface MenuItemData {
    name: string;
    category: 'breakfast'|'lunch'|'dinner'|'desert'|'beverage'|'coctail';
    pricePerFood: number;
    ingridients: string;
    takingTime:number
    status:'available'|'not_available';
    images?:ImagesData[];
}

export interface FoodOrderItem {
  foodId: mongoose.Types.ObjectId ;
  name:string;
  quantity: number;
  price: number;
}

export interface FoodOrderData {
  userId:string | mongoose.Types.ObjectId;
  tableId?: string | mongoose.Types.ObjectId;
  booking_id?:string | mongoose.Types.ObjectId;
  roomId?: string | mongoose.Types.ObjectId;
  totalPrice?: number|null|undefined;
  foods: FoodOrderItem[];
  paymentStatus: 'pending' | 'paidByBank' | 'onroom'| 'paidByTelebirr' |'paidByCash'| 'returned';
  status?: 'pending' | 'preparing' | 'ready' | 'served'  | 'cancelled';
  specialReq?: string;
}


export interface ReservationData {
  userId: string | mongoose.Types.ObjectId;
  tableId: string | mongoose.Types.ObjectId;
  guestName: string;
  guestPhone: string;
  reservationDate: Date | string;
  numberOfGuests: number; // 👈 Must be number to match schema
  specialRequest?: string;
  status?: "pending" | "confirmed" | "cancelled" | "completed";
}




  
  /**
   * 1. Create a New Menu Item
   */
export async function createMenuItem(data: MenuItemData) {
  console.log ('service recieved',data)
  
    try {
      await connectDB()
      if (!data.name || !data.pricePerFood || !data.category) {
        throw new Error("Missing required menu fields: name, price, or category.");
      }

  
      const foodcreated= await Food.create({
        name:data.name,
        category:data.category,
        pricePerFood:data.pricePerFood,
        ingridients:data.ingridients,
        takingTime:data.takingTime,
        status:data.status||"available" ,
        images:data.images,
        createdAt: new Date(),
      })

      return { success: true, data: foodcreated};
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 2. Create a Food Order
   */
  export async function createFoodOrder(data: FoodOrderData) {
   
    try {await connectDB()
      if (!data.foods || data.foods.length === 0) {
        throw new Error("An order must contain at least one item.");
      }
let totalPrice = 0;

for (const food of data.foods) {
  totalPrice += food.price * food.quantity;
}
   if (!data.userId || !mongoose.Types.ObjectId.isValid(data.userId)) {
  throw new Error("Invalid or missing User ID");
}
 const orderedFood = await FoodOrder.create({
      userId: new mongoose.Types.ObjectId(data.userId),
      tableId: data.tableId ? new mongoose.Types.ObjectId(data.tableId) : undefined,
      booking_Id: data.booking_id ? new mongoose.Types.ObjectId(data.booking_id) : undefined,
      foods: data.foods,
      totalPrice:totalPrice,
      paymentStatus: data.paymentStatus || 'pending',
      status: data.status || 'pending',
      specialReq: data.specialReq || '',
    })
        if (data.tableId) await Table.findByIdAndUpdate(data.tableId,{status:"occupied"})
     
      return { success: true, data: orderedFood };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }




  /**
   * 4. Create a Reservation
   */
 export async function createReservation(data: ReservationData) {
  
  try {await connectDB()
    // 1. Validate required fields
    if (
      !data.userId ||
      !data.tableId ||
      !data.guestName ||
      !data.reservationDate ||
      !data.numberOfGuests
    ) {
      throw new Error("Missing required fields: userId, tableId, guestName, reservationDate, or numberOfGuests");
    }

    // 2. Map and cast data cleanly for Mongoose
    const createdReservation = await TableReservation.create({
      userId: new mongoose.Types.ObjectId(data.userId),
      tableId: new mongoose.Types.ObjectId(data.tableId),
      guestName: data.guestName,
      guestPhone: data.guestPhone,
      reservationDate: new Date(data.reservationDate),
      numberOfGuests: Number(data.numberOfGuests),
      specialRequest: data.specialRequest || "",
      status: data.status || "pending",
    });

    return { success: true, data: createdReservation };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
// GET /api/reports/admin/daily-breakdown
export async function getAdminDailySummary(dateString: string) {
  const startOfDay = new Date(dateString);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(dateString);
  endOfDay.setHours(23, 59, 59, 999);

  const summary = await FoodOrder.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        isDeleted: false,
        paymentStatus: { $ne: "pending" } // Only count completed sales
      }
    },
    {
      $group: {
        _id: "$userId", // Group by Cashier
        totalOrdersCount: { $sum: 1 },
        totalSalesAmount: { $sum: "$totalPrice" },
        cashSales: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "paidByCash"] }, "$totalPrice", 0]
          }
        },
        telebirrSales: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "paidByTelebirr"] }, "$totalPrice", 0]
          }
        },
        bankSales: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "paidByBank"] }, "$totalPrice", 0]
          }
        },
        roomSales: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "onroom"] }, "$totalPrice", 0]
          }
        }
      }
    },
    {
      // Populate Cashier Name/Details from User collection
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "cashierInfo"
      }
    },
    { $unwind: "$cashierInfo" }
  ]);

  return summary;
}