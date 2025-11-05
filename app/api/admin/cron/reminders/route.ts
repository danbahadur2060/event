import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Booking, Event } from "@/database";
import { sendMail } from "@/lib/email";
import { generateEmailContent } from "@/lib/ai";
import { Types } from "mongoose";

// Trigger with a scheduled job (e.g., Vercel Cron) using header X-CRON-KEY
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-key");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Window: events starting within the next 24 hours and not reminded yet
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Fetch events in the window
  const events = await Event.find({}).lean();

  const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);

  const targetDates = new Set([toIsoDate(now), toIsoDate(in24h)]);

  let sent = 0;

  for (const ev of events as any[]) {
    // Combine event date/time into a Date object (assumes time is HH:mm)
    const [hh, mm] = String(ev.time || "00:00").split(":").map(Number);
    const eventDt = new Date(`${ev.date}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00.000Z`);

    // If event date is today or within next day
    if (!targetDates.has(ev.date)) continue;

    const attendees = await Booking.find({
      eventId: new Types.ObjectId(ev._id),
      $or: [{ reminderSentAt: { $exists: false } }, { reminderSentAt: null }],
    }).lean();

    if (attendees.length === 0) continue;

    const draft = await generateEmailContent({
      event: {
        title: ev.title,
        date: ev.date,
        time: ev.time,
        location: ev.location,
        venue: ev.venue,
        description: ev.description,
      },
      tone: "friendly",
    });

    const to = attendees.map((a: any) => a.email);
    await sendMail({ to, subject: draft.subject, html: draft.html, text: draft.text });

    // Mark reminders sent
    await Booking.updateMany(
      { _id: { $in: attendees.map((a: any) => a._id) } },
      { $set: { reminderSentAt: new Date() } }
    );
    sent += to.length;
  }

  return NextResponse.json({ ok: true, sent });
}
