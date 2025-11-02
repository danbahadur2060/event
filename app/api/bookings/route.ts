import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Booking } from "@/database";

/**
 * Handle POST requests to create a booking for an event.
 *
 * Expects a JSON body with `eventId` and `email`. Validates presence of both fields and basic email format,
 * connects to the database, and creates a booking record.
 *
 * @returns `NextResponse` with status 201 and the created booking on success; status 400 and an error message when
 * required fields are missing or email format is invalid; status 500 and an error message on internal failure.
 */
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