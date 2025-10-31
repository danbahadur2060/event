import { Schema, model, models, Model, HydratedDocument, Types } from 'mongoose';

// Booking domain type with runtime-backed timestamps
export interface Booking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingDocument = HydratedDocument<Booking>;

// Email validation helper
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const BookingSchema = new Schema<Booking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true, // Index for faster lookups
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: isValidEmail,
        message: 'Invalid email format',
      },
    },
  },
  { timestamps: true, versionKey: false }
);

// Pre-save: validate that the referenced Event exists
BookingSchema.pre('save', async function (this: BookingDocument, next) {
  try {
    // Only check if eventId is new or modified
    if (this.isModified('eventId')) {
      // Lazy-load Event model to avoid circular dependency issues
      const EventModel = models.Event || model('Event');
      
      const eventExists = await EventModel.exists({ _id: this.eventId });
      
      if (!eventExists) {
        return next(new Error(`Event with ID ${this.eventId} does not exist`));
      }
    }
    
    next();
  } catch (err) {
    next(err as Error);
  }
});

const BookingModel: Model<Booking> =
  (models.Booking as Model<Booking>) || model<Booking>('Booking', BookingSchema);

export default BookingModel;
