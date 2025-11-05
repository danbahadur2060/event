import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { Booking, Event } from "@/database";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as SessionUser | undefined)?.role;
  if (role !== "superadmin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  await connectDB();

  const bookings = await Booking.aggregate([
    {
      $lookup: {
        from: "events",
        localField: "eventId",
        foreignField: "_id",
        as: "event",
      },
    },
    { $unwind: "$event" },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        _id: 1,
        email: 1,
        eventId: 1,
        createdAt: 1,
        reminderSentAt: 1,
        event: {
          _id: "$event._id",
          title: "$event.title",
          slug: "$event.slug",
          date: "$event.date",
          time: "$event.time",
          location: "$event.location",
        },
      },
    },
  ]);

  return NextResponse.json({ bookings });
}
