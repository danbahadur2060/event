import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import connectDB from "@/lib/mongodb";
import { Order, Coupon } from "@/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature || !webhookSecret) {
      return NextResponse.json({ message: "Missing signature or secret" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    await connectDB();

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Update order status to paid
        const order = await Order.findOne({ stripeSessionId: session.id });
        
        if (order) {
          order.status = "paid";
          order.invoiceUrl = session.invoice as string | undefined;
          await order.save();

          // Increment coupon usage if applicable
          // (You might want to store coupon code in order metadata to track this)
          console.log(`Order ${order._id} marked as paid`);
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const order = await Order.findOne({ stripeSessionId: session.id });
        
        if (order && order.status === "pending") {
          order.status = "failed";
          await order.save();
          console.log(`Order ${order._id} marked as failed (session expired)`);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        
        // Find order by payment intent or session
        // Note: You might need to store payment_intent in order model for this
        const paymentIntent = charge.payment_intent as string;
        
        if (paymentIntent) {
          // For now, we'll log it - you may want to add payment_intent to Order model
          console.log(`Charge refunded for payment intent: ${paymentIntent}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ message: "Webhook handler failed" }, { status: 500 });
  }
}
