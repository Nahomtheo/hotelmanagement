import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITableReservation extends Document {
  userId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  guestName: string;
 
  guestPhone: string;
  

  reservationDate: Date;

  numberOfGuests: number;

  status:
    | "pending"
    | "confirmed"
    | "cancelled"
    | "completed";

  specialRequest: string;

  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const TableReservationSchema = new Schema<ITableReservation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    guestName:{type :String},
    guestPhone: {type:String},

    tableId: {
      type: Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },

    reservationDate: {
      type: Date,
      required: true,
    },

    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
    },

    specialRequest: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
      ],
      default: "pending",
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const TableReservation: Model<ITableReservation> =
  mongoose.models.TableReservation ||
  mongoose.model<ITableReservation>(
    "TableReservation",
    TableReservationSchema
  );

export default TableReservation;