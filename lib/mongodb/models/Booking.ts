import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBooking extends Document {
  roomId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  numberOfNights: number;
  pricePerNight: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  confirmedBy?: mongoose.Types.ObjectId;
  checkedInBy?: mongoose.Types.ObjectId;
  checkedOutBy?: mongoose.Types.ObjectId;
  cancelledBy?: mongoose.Types.ObjectId;

  nationality?:string;

  passport_no?:string;
  id_no?:string;
  reasonOfStay?:string;

  specialRequests: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    guestName: {
      type: String,
      required: true,
      trim: true,
    },
    guestEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    guestPhone: {
      type: String,
      required: true,
      trim: true,
    },
    checkInDate: {
      type: Date,
      required: true,
      index: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
      index: true,
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
    },
    numberOfNights: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'],
      default: 'pending',
      index: true,
    },
    confirmedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    checkedInBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    checkedOutBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    nationality:{
      type:String
    },
    passport_no:{
      type:String
    },
   
    id_no:{
      type:String
    },
    reasonOfStay:{
      type:String
    },

    specialRequests: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

   
  },
  { timestamps: true }
);

// Compound index for availability checks
bookingSchema.index(
  { roomId: 1, checkInDate: 1, checkOutDate: 1 },
  { sparse: true }
);

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
