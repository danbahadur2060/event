import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import connectDB from "@/lib/mongodb";
import { TicketType, Order, Coupon } from "@/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, email, items, couponCode } = body as {
      eventId: string;
      email: string;
      items: { ticketTypeId: string; quantity: number }[];
      couponCode?: string;
    };

    if (!eventId || !email || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    await connectDB();

    const ticketIds = items.map((i) => i.ticketTypeId);
    const tickets = await TicketType.find({ _id: { $in: ticketIds }, eventId });
    if (tickets.length !== ticketIds.length) {
      return NextResponse.json({ message: "Invalid tickets" }, { status: 400 });
    }

    // compute totals
    let currency = tickets[0].currency || "USD";
    let total = 0;
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items) {
      const t = tickets.find((x) => String(x._id) === String(item.ticketTypeId));
      if (!t) return NextResponse.json({ message: "Ticket not found" }, { status: 400 });
      if (t.salesStart && t.salesStart > new Date()) return NextResponse.json({ message: "Sales not started" }, { status: 400 });
      if (t.salesEnd && t.salesEnd < new Date()) return NextResponse.json({ message: "Sales ended" }, { status: 400 });
      if (item.quantity < 1) return NextResponse.json({ message: "Quantity must be >=1" }, { status: 400 });

      total += t.price * item.quantity;
      currency = t.currency || currency;
      lineItems.push({
        quantity: item.quantity,
        price_data: {
          currency,
          unit_amount: t.price,
          product_data: { name: `${t.name}` },
        },
      });
    }

    // apply coupon if valid
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      const now = new Date();
      if (coupon && (!coupon.expiresAt || coupon.expiresAt >= now) && (!coupon.maxUses || coupon.usedCount < coupon.maxUses)) {
        if (coupon.type === "percent") {
          total = Math.max(0, Math.round(total * (1 - coupon.amount / 100)));
        } else {
          total = Math.max(0, total - coupon.amount);
        }
      }
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ message: "Stripe not configured" }, { status: 500 });
    }
    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

    const origin = process.env.NEXT_PUBLIC_APP_URL || req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: lineItems,
      metadata: { eventId },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    });

    // create pending order
    const order = await Order.create({
      eventId,
      email,
      items: items.map((i) => ({ ticketTypeId: i.ticketTypeId, quantity: i.quantity, unitAmount: tickets.find((t) => String(t._id) === String(i.ticketTypeId))!.price })),
      currency,
      totalAmount: total,
      status: "pending",
      stripeSessionId: session.id,
    });

    return NextResponse.json({ url: session.url, orderId: order._id }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Failed to create checkout session" }, { status: 500 });
  }
}
