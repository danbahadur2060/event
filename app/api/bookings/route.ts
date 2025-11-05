import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Booking } from "@/database";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { hasAnyRole } from "@/lib/rbac";

// CREATE
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

    const booking = await Booking.create({ eventId, email: String(email).toLowerCase() });

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

// READ (list)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const emailParam = searchParams.get("email");

    await connectDB();

    const query: any = {};

    if (eventId) query.eventId = eventId;

    if (user && !hasAnyRole(user.role, ["admin", "superadmin"])) {
      // regular users: restrict to their email
      query.email = (user.email || "").toLowerCase();
    } else if (emailParam) {
      // admin can filter by arbitrary email
      query.email = String(emailParam).toLowerCase();
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error({ route: "/api/bookings", error });
    return NextResponse.json(
      { message: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// UPDATE
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    await connectDB();

    const body = await req.json();
    const { bookingId, email, eventId, reminderSentAt } = body as {
      bookingId?: string;
      email?: string;
      eventId?: string;
      reminderSentAt?: string | null;
    };

    if (!bookingId) {
      return NextResponse.json({ message: "bookingId required" }, { status: 400 });
    }

    const existing = await Booking.findById(bookingId);
    if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });

    // Only owner (by email) or admin can update
    const isOwner = user && existing.email === (user.email || "").toLowerCase();
    if (!isOwner && !hasAnyRole(user?.role, ["admin", "superadmin"])) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const updates: any = {};
    if (typeof email === "string") updates.email = email.toLowerCase();
    if (typeof eventId === "string") updates.eventId = eventId;
    if (reminderSentAt !== undefined) updates.reminderSentAt = reminderSentAt ? new Date(reminderSentAt) : null;

    const updated = await Booking.findByIdAndUpdate(bookingId, updates, { new: true, runValidators: true });
    return NextResponse.json({ message: "Booking updated", booking: updated }, { status: 200 });
  } catch (error) {
    console.error({ route: "/api/bookings", error });
    return NextResponse.json(
      { message: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) return NextResponse.json({ message: "bookingId required" }, { status: 400 });

    await connectDB();
    const existing = await Booking.findById(bookingId);
    if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });

    // Only owner (by email) or admin can delete
    const isOwner = user && existing.email === (user.email || "").toLowerCase();
    if (!isOwner && !hasAnyRole(user?.role, ["admin", "superadmin"])) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await Booking.findByIdAndDelete(bookingId);
    return NextResponse.json({ message: "Booking deleted" }, { status: 200 });
  } catch (error) {
    console.error({ route: "/api/bookings", error });
    return NextResponse.json(
      { message: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
