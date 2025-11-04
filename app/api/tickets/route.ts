import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { TicketType, Event } from "@/database";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { hasAnyRole } from "@/lib/rbac";

// GET /api/tickets?eventId=xxx - List tickets for an event
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ message: "eventId required" }, { status: 400 });
    }

    await connectDB();
    const tickets = await TicketType.find({ eventId }).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ tickets }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Failed to fetch tickets" }, { status: 500 });
  }
}

// POST /api/tickets - Create a new ticket type
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user || !hasAnyRole(user.role, ["organizer", "admin", "superadmin"])) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { eventId, name, category, price, currency, quantity, salesStart, salesEnd, perUserLimit, metadata } = body;

    if (!eventId || !name || price === undefined || quantity === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    const ticket = await TicketType.create({
      eventId,
      name,
      category: category || "general",
      price: Math.round(price), // ensure cents
      currency: currency || "USD",
      quantity,
      salesStart: salesStart || null,
      salesEnd: salesEnd || null,
      perUserLimit: perUserLimit || null,
      metadata: metadata || {},
    });

    return NextResponse.json({ message: "Ticket created", ticket }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Failed to create ticket" }, { status: 500 });
  }
}

// PUT /api/tickets - Update a ticket type
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user || !hasAnyRole(user.role, ["organizer", "admin", "superadmin"])) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { ticketId, ...updates } = body;

    if (!ticketId) {
      return NextResponse.json({ message: "ticketId required" }, { status: 400 });
    }

    const ticket = await TicketType.findByIdAndUpdate(ticketId, updates, { new: true, runValidators: true });

    if (!ticket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Ticket updated", ticket }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Failed to update ticket" }, { status: 500 });
  }
}

// DELETE /api/tickets?ticketId=xxx
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!user || !hasAnyRole(user.role, ["organizer", "admin", "superadmin"])) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("ticketId");

    if (!ticketId) {
      return NextResponse.json({ message: "ticketId required" }, { status: 400 });
    }

    await connectDB();
    const ticket = await TicketType.findByIdAndDelete(ticketId);

    if (!ticket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Ticket deleted" }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Failed to delete ticket" }, { status: 500 });
  }
}
