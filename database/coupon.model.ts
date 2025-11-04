import { Schema, model, models, Model } from "mongoose";

export type CouponType = "percent" | "fixed";

export interface Coupon {
  code: string;
  type: CouponType;
  amount: number; // percent (0-100) or fixed in cents
  expiresAt?: Date | null;
  maxUses?: number | null;
  usedCount: number;
  targetEmails?: string[]; // optional whitelist
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<Coupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    amount: { type: Number, required: true, min: 0 },
    expiresAt: { type: Date, default: null },
    maxUses: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    targetEmails: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false }
);

const CouponModel: Model<Coupon> = (models.Coupon as Model<Coupon>) || model<Coupon>("Coupon", CouponSchema);

export default CouponModel;
export type { Coupon as ICoupon, CouponType };
