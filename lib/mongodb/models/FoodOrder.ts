import mongoose, { Schema, Document, Model, Types, mongoosePopulatedDocumentMarker } from "mongoose";

export interface IFoodOrder extends Document {
  // Use Types.ObjectId instead of Schema.Types.ObjectId
  userId: mongoose.Types.ObjectId;
  booking_Id?:  mongoose.Types.ObjectId;
  tableId?:  mongoose.Types.ObjectId;

  foods: [
    {
      foodId:  mongoose.Types.ObjectId;
     
      quantity: number;
      price: number;
    }
  ];

  totalPrice: number;
  paymentStatus: "pending" | "paid"|"onroom";
  specialReq?: string;

  status:
    | "pending"
    | "preparing"
    | "ready"
    | "served"
    | "cancelled";

  notes?: string;
  takeaway?:boolean;
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const FoodOrderSchema = new Schema<IFoodOrder>(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      
    },

    booking_Id: {
      type: mongoose.Types.ObjectId,
      ref: "Booking",
    },

    tableId: {
      type: mongoose.Types.ObjectId,
      ref: "Table",
    },

    foods: [
      {
        foodId: {
          type: mongoose.Types.ObjectId,
          ref: "Food",
          required: true,
        },
      

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        price: {
          type: Number,
          required: true,
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid","onroom"],
      default: "pending",
    },

    specialReq: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "preparing",
        "ready",
        "served",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    notes: {
      type: String,
    },
    takeaway:{
      type:Boolean
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

const FoodOrder: Model<IFoodOrder> =
  mongoose.models.FoodOrder ||
  mongoose.model<IFoodOrder>("FoodOrder", FoodOrderSchema);

export default FoodOrder;