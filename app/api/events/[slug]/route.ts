import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Event, type IEvent } from "@/database";

/**
 * Shape returned to clients (stringified _id and ISO dates)
 */
type ApiEvent = Omit<IEvent, "createdAt" | "updatedAt"> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

// Validate slug against the format produced by our slugify helper
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlugInput } = await context.params;
    const rawSlug = (rawSlugInput ?? "").toString().trim();

    // Validate presence
    if (!rawSlug) {
      return NextResponse.json(
        { error: { message: "Missing required route parameter: slug" } },
        { status: 400 }
      );
    }

    // Decode and normalize slug
    const slug = decodeURIComponent(rawSlug).toLowerCase();

    if (!SLUG_REGEX.test(slug)) {
      return NextResponse.json(
        {
          error: {
            message:
              "Invalid slug format. Use lowercase letters, numbers, and hyphens only.",
          },
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Find event in DB
    const doc = await Event.findOne({ slug: slug })
      .lean<IEvent & { _id: unknown }>()
      .exec();

    if (!doc) {
      return NextResponse.json(
        { error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    // Safe date handling
    const safeCreated = doc.createdAt ? new Date(doc.createdAt) : new Date();
    const safeUpdated = doc.updatedAt ? new Date(doc.updatedAt) : new Date();

    const event: ApiEvent = {
      ...doc,
      _id: String(doc?._id ?? ""),
      createdAt: safeCreated.toISOString(),
      updatedAt: safeUpdated.toISOString(),
    };

    return NextResponse.json(
      { message: "Event fetched successfully", event },
      { status: 200 }
    );
  } catch (error) {
    console.error({ route: "/api/events/[slug]", error });
    return NextResponse.json(
      { error: { message: "Unexpected error while fetching event" } },
      { status: 500 }
    );
  }
}
