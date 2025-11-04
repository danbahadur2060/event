import { NextRequest, NextResponse } from "next/server";
import { TicketType } from "@/database";
import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;
    const tickets = await TicketType.find({ eventId: id }).lean();
    return NextResponse.json({ tickets }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as SessionUser | undefined)?.role;
    if (!role || !["organizer", "admin", "superadmin"].includes(role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { id } = await context.params;
    const body = await req.json();
    const { name, category, price, currency, quantity, salesStart, salesEnd, perUserLimit } = body;
    if (!name || price == null || quantity == null) {
      return NextResponse.json({ message: "name, price, quantity required" }, { status: 400 });
    }

    const ticket = await TicketType.create({
      eventId: id,
      name,
      category: category || "general",
      price,
      currency: currency || "USD",
      quantity,
      salesStart: salesStart ? new Date(salesStart) : null,
      salesEnd: salesEnd ? new Date(salesEnd) : null,
      perUserLimit: perUserLimit ?? null,
    });
    return NextResponse.json({ message: "Created", ticket }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
