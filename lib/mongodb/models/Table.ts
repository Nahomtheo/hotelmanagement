import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITable extends Document {
  tableNumber: number;
  capacity: number;
  location: string;
  status: "available" | "reserved" | "occupied" | "cleaning";
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITable>(
  {
    tableNumber: {
      type: Number,
      required: true,
      unique: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    location: {
      type: String,
    },

    status: {
      type: String,
      enum: ["available", "reserved", "occupied", "cleaning"],
      default: "available",
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

const Table: Model<ITable> =
  mongoose.models.Table || mongoose.model<ITable>("Table", TableSchema);

export default Table;