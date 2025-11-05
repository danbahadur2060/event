import { Schema, model, models, Model, Types } from "mongoose";

export type TicketCategory =
  | "general"
  | "vip"
  | "student"
  | "group"
  | "comp"
  | "donation"
  | "sponsor";

export interface TicketType {
  eventId: Types.ObjectId;
  name: string;
  category: TicketCategory;
  price: number; // cents
  currency: string; // ISO currency code
  quantity: number; // total available
  salesStart?: Date | null;
  salesEnd?: Date | null;
  perUserLimit?: number | null;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const TicketTypeSchema = new Schema<TicketType>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["general", "vip", "student", "group", "comp", "donation", "sponsor"],
      default: "general",
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    quantity: { type: Number, required: true, min: 0 },
    salesStart: { type: Date, default: null },
    salesEnd: { type: Date, default: null },
    perUserLimit: { type: Number, default: null },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true, versionKey: false }
);

const TicketTypeModel: Model<TicketType> =
  (models.TicketType as Model<TicketType>) ||
  model<TicketType>("TicketType", TicketTypeSchema);

export default TicketTypeModel;
export type { TicketType as ITicketType };
