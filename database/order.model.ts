import { Schema, model, models, Model, Types } from "mongoose";

export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "partial_refunded";

export interface OrderItem {
  ticketTypeId: Types.ObjectId;
  quantity: number;
  unitAmount: number; // cents
}

export interface Order {
  eventId: Types.ObjectId;
  userId?: Types.ObjectId | null; // null if guest checkout
  email: string; // buyer email
  items: OrderItem[];
  currency: string;
  totalAmount: number; // cents
  status: OrderStatus;
  stripeSessionId?: string;
  invoiceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>(
  {
    ticketTypeId: { type: Schema.Types.ObjectId, ref: "TicketType", required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitAmount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema<Order>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false, default: null, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    items: { type: [OrderItemSchema], required: true, validate: (v: OrderItem[]) => v.length > 0 },
    currency: { type: String, default: "USD" },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "paid", "failed", "refunded", "partial_refunded"], default: "pending", index: true },
    stripeSessionId: { type: String },
    invoiceUrl: { type: String },
  },
  { timestamps: true, versionKey: false }
);

const OrderModel: Model<Order> = (models.Order as Model<Order>) || model<Order>("Order", OrderSchema);

export default OrderModel;
export type { Order as IOrder };
