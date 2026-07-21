import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoom extends Document {
  hotelId: mongoose.Types.ObjectId;
  roomNumber: string;
  type: 'single' | 'double' | 'suite' | 'deluxe'|'conference hall';
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
  images:[{
      url: String,
      publicId: String
    }];
  description: string;
  status: 'available' | 'occupied' | 'reserved '|'being cleaned'|'maintenance';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    hotelId: {
      type: Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
      index: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['single', 'double', 'suite', 'deluxe','conference hall'],
      required: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    maxGuests: {
      type: Number,
      required: true,
      min: 1,
    },
    amenities: [String],
    images:[ {
      url: String,
      publicId: String
    }],
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved','being cleaned','maintenance'],
      default: 'available',
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

// Compound index for hotel and room number
roomSchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true, sparse: true });

const Room: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>('Room', roomSchema);

export default Room;
