import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { User, Event } from "@/database";
import { sendMail } from "@/lib/email";
import { generateEmailContent } from "@/lib/ai";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as SessionUser | undefined)?.role;
  if (role !== "superadmin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const { id } = await context.params;
  const { eventId, customPrompt, tone } = await req.json();
  await connectDB();
  const user = await User.findById(id).lean();
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const ev = eventId ? await Event.findById(eventId).lean() : null;
  if (!ev) return NextResponse.json({ message: "Event not found" }, { status: 400 });

  const draft = await generateEmailContent({
    event: {
      title: ev.title,
      date: ev.date,
      time: ev.time,
      location: ev.location,
      venue: ev.venue,
      description: ev.description,
    },
    audienceName: user.name,
    tone: tone ?? "friendly",
    customPrompt,
  });

  const info = await sendMail({ to: user.email, subject: draft.subject, html: draft.html, text: draft.text });
  return NextResponse.json({ ok: true, messageId: info.messageId, accepted: info.accepted });
}
