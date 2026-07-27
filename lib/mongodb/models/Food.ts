import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFood extends Document {
  name: string;

  category:
    | "breakfast"
    | "lunch"
    | "dinner"
    | "desert"
    | "beverage"
    | "coctail";

  pricePerFood: number;

  ingridients: string;

  images: {
    url: string;
    publicId: string;
  }[];

  takingTime: number;

  status: "available" | "not_available";

  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}


const FoodSchema = new Schema<IFood>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "breakfast",
        "lunch",
        "dinner",
        "desert",
        "beverage",
        "coctail",
      ],
      required: true,
    },

    pricePerFood: {
      type: Number,
      required: true,
      min: 0,
    },

    ingridients: {
      type: String,
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    ],

    takingTime: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["available", "not_available"],
      default: "available",
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);


// Prevent model overwrite error in Next.js hot reload
const Food: Model<IFood> =
  mongoose.models.Food ||
  mongoose.model<IFood>("Food", FoodSchema);


export default Food;