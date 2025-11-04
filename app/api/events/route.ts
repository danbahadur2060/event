import { Event } from "@/database";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

type EventInput = {
  title: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  // optional new fields
  orgId?: string;
  status?: "draft" | "published" | "archived";
  privacy?: "public" | "private";
  settings?: Record<string, any>;
  theme?: Record<string, any>;
  seo?: Record<string, any>;
  scheduledPublishAt?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as SessionUser | undefined)?.role;
    if (!role || !["organizer", "admin", "superadmin"].includes(role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const contentType = req.headers.get("content-type") || "";

    // Allow either multipart (with file) or JSON (with image URL)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const event: Partial<EventInput> = Object.fromEntries(formData.entries()) as Partial<EventInput>;

      const file = formData.get("image") as File | null;
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const imageUrl = await uploadToCloudinary(buffer);
        (event as EventInput).image = imageUrl;
      }

      const tags = JSON.parse(String(formData.get("tags") || "[]"));
      const agenda = JSON.parse(String(formData.get("agenda") || "[]"));

      const createdEvent = await Event.create({
        ...event,
        tags,
        agenda,
      });

      return NextResponse.json(
        { message: "Event created successfully", event: createdEvent },
        { status: 201 }
      );
    } else {
      const body = await req.json();
      const createdEvent = await Event.create(body);
      return NextResponse.json(
        { message: "Event created successfully", event: createdEvent },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Event creation Failed", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json(
      { message: "Events fetched successfully", events },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Event fetching failed", error: error },
      { status: 500 }
    );
  }
}
