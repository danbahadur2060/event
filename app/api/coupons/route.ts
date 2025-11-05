import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Coupon } from "@/database";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { hasAnyRole } from "@/lib/rbac";

// GET /api/coupons - List all coupons (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user || !hasAnyRole(user.role, ["admin", "superadmin"])) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ coupons }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Failed to fetch coupons" }, { status: 500 });
  }
}

// POST /api/coupons - Create a new coupon
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user || !hasAnyRole(user.role, ["admin", "superadmin"])) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { code, type, amount, expiresAt, maxUses, targetEmails } = body;

    if (!code || !type || amount === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (type !== "percent" && type !== "fixed") {
      return NextResponse.json({ message: "Invalid coupon type" }, { status: 400 });
    }

    if (type === "percent" && (amount < 0 || amount > 100)) {
      return NextResponse.json({ message: "Percent must be 0-100" }, { status: 400 });
    }

    if (type === "fixed" && amount < 0) {
      return NextResponse.json({ message: "Fixed amount must be >= 0" }, { status: 400 });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      amount: type === "fixed" ? Math.round(amount) : amount, // cents for fixed
      expiresAt: expiresAt || null,
      maxUses: maxUses || null,
      usedCount: 0,
      targetEmails: targetEmails || [],
    });

    return NextResponse.json({ message: "Coupon created", coupon }, { status: 201 });
  } catch (e: any) {
    console.error(e);
    if (e.code === 11000) {
      return NextResponse.json({ message: "Coupon code already exists" }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create coupon" }, { status: 500 });
  }
}

// PUT /api/coupons - Update a coupon
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user || !hasAnyRole(user.role, ["admin", "superadmin"])) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { couponId, ...updates } = body;

    if (!couponId) {
      return NextResponse.json({ message: "couponId required" }, { status: 400 });
    }

    const coupon = await Coupon.findByIdAndUpdate(couponId, updates, { new: true, runValidators: true });

    if (!coupon) {
      return NextResponse.json({ message: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Coupon updated", coupon }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Failed to update coupon" }, { status: 500 });
  }
}

// DELETE /api/coupons?couponId=xxx
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user || !hasAnyRole(user.role, ["admin", "superadmin"])) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const couponId = searchParams.get("couponId");

    if (!couponId) {
      return NextResponse.json({ message: "couponId required" }, { status: 400 });
    }

    await connectDB();
    const coupon = await Coupon.findByIdAndDelete(couponId);

    if (!coupon) {
      return NextResponse.json({ message: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Coupon deleted" }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Failed to delete coupon" }, { status: 500 });
  }
}
