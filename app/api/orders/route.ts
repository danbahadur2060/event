import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/database";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { hasAnyRole } from "@/lib/rbac";

// GET /api/orders - List orders
// Admin: see all orders
// User: see only their orders
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    let query: any = {};

    // Admin can see all orders, users only their own
    if (hasAnyRole(user.role, ["admin", "superadmin"])) {
      if (eventId) {
        query.eventId = eventId;
      }
    } else {
      query.email = user.email;
      if (eventId) {
        query.eventId = eventId;
      }
    }

    const orders = await Order.find(query)
      .populate("eventId", "title slug date")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}

// PUT /api/orders - Update order status (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user || !hasAnyRole(user.role, ["admin", "superadmin"])) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ message: "orderId and status required" }, { status: 400 });
    }

    const validStatuses = ["pending", "paid", "failed", "refunded", "partial_refunded"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order updated", order }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Failed to update order" }, { status: 500 });
  }
}
