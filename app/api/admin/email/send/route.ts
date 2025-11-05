import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { Booking, Event } from "@/database";
import { sendMail } from "@/lib/email";
import { generateEmailContent } from "@/lib/ai";
import { Types } from "mongoose";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as SessionUser | undefined)?.role;
  if (role !== "superadmin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { to, subject, html, text, useAI, eventId, customPrompt, tone } = body as {
    to?: string[];
    subject?: string;
    html?: string;
    text?: string;
    useAI?: boolean;
    eventId?: string;
    customPrompt?: string;
    tone?: "friendly" | "professional" | "excited";
  };

  await connectDB();

  let recipients: string[] = Array.isArray(to) ? to : [];
  let mailSubject = subject ?? "";
  let mailHtml = html ?? "";
  let mailText = text ?? "";

  let eventDoc: any = null;
  if (useAI) {
    if (!eventId) {
      return NextResponse.json({ message: "eventId required when useAI=true" }, { status: 400 });
    }
    eventDoc = await Event.findById(eventId).lean();
    if (!eventDoc) return NextResponse.json({ message: "Event not found" }, { status: 404 });
    const draft = await generateEmailContent({
      event: {
        title: eventDoc.title,
        date: eventDoc.date,
        time: eventDoc.time,
        location: eventDoc.location,
        venue: eventDoc.venue,
        description: eventDoc.description,
      },
      tone: tone ?? "friendly",
      customPrompt,
    });
    mailSubject = draft.subject;
    mailHtml = draft.html;
    mailText = draft.text;

    if (recipients.length === 0) {
      // default to all bookings for that event
      const attendees = await Booking.find({ eventId: new Types.ObjectId(eventId) }).select("email");
      recipients = attendees.map((a: any) => a.email);
    }
  }

  if (recipients.length === 0) {
    return NextResponse.json({ message: "No recipients" }, { status: 400 });
  }

  const info = await sendMail({ to: recipients, subject: mailSubject, html: mailHtml, text: mailText });

  return NextResponse.json({ ok: true, messageId: info.messageId, accepted: info.accepted });
}
