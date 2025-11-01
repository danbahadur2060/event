import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Booking } from "@/database";

export async function POST(req: NextRequest) {
  try {
    const { eventId, email } = await req.json();

    if (!eventId || !email) {
      return NextResponse.json(
        { message: "eventId and email are required" },
        { status: 400 }
      );
    }

    // basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    await connectDB();

    const booking = await Booking.create({ eventId, email });

    return NextResponse.json(
      { message: "Booking created", booking },
      { status: 201 }
    );
  } catch (error) {
    console.error({ route: "/api/bookings", error });
    return NextResponse.json(
      { message: "Failed to create booking" },
      { status: 500 }
    );
  }
}
