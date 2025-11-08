import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Event, type IEvent } from "@/database";
import { v2 as cloudinary } from "cloudinary";

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

async function getAndValidateSlug(context: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlugInput } = await context.params;
  const rawSlug = (rawSlugInput ?? "").toString().trim();
  if (!rawSlug) {
    return { error: NextResponse.json({ error: { message: "Missing required route parameter: slug" } }, { status: 400 }) };
  }
  const slug = decodeURIComponent(rawSlug).toLowerCase();
  if (!SLUG_REGEX.test(slug)) {
    return {
      error: NextResponse.json(
        { error: { message: "Invalid slug format. Use lowercase letters, numbers, and hyphens only." } },
        { status: 400 }
      ),
    };
  }
  return { slug } as const;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const res = await getAndValidateSlug(context);
    if ("error" in res) return res.error;
    const { slug } = res;

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
    } as unknown as ApiEvent;

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

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const res = await getAndValidateSlug(context);
    if ("error" in res) return res.error;
    const { slug } = res;

    await connectDB();
    const existing = await Event.findOne({ slug }).exec();
    if (!existing) {
      return NextResponse.json({ error: { message: "Event not found" } }, { status: 404 });
    }

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      // Optional image replacement
      const file = formData.get("image") as File | null;
      if (file && (file as any).size) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ resource_type: "image", folder: "Devevent" }, (error, results) => {
              if (error) return reject(error);
              resolve(results);
            })
            .end(buffer);
        });
        (existing as any).image = (uploadResult as { secure_url: string }).secure_url;
      }

      // Assign primitives
      const assign = (key: string) => {
        const v = formData.get(key);
        if (v !== null && typeof v === "string" && v.trim() !== "") {
          (existing as any)[key] = v;
        }
      };
      [
        "title",
        "description",
        "overview",
        "venue",
        "location",
        "date",
        "time",
        "mode",
        "audience",
        "organizer",
      ].forEach(assign);

      const tagsRaw = formData.get("tags");
      if (tagsRaw) {
        try {
          (existing as any).tags = JSON.parse(tagsRaw as string);
        } catch {}
      }
      const agendaRaw = formData.get("agenda");
      if (agendaRaw) {
        try {
          (existing as any).agenda = JSON.parse(agendaRaw as string);
        } catch {}
      }
    } else {
      // JSON body update
      const body = await req.json();
      const allowed = [
        "title",
        "description",
        "overview",
        "image",
        "venue",
        "location",
        "date",
        "time",
        "mode",
        "audience",
        "organizer",
        "tags",
        "agenda",
      ];
      for (const k of allowed) {
        if (k in body && body[k] !== undefined) {
          (existing as any)[k] = body[k];
        }
      }
    }

    await existing.save(); // trigger pre-save hooks (slug/date/time normalization)

    const safeCreated = existing.createdAt ? new Date(existing.createdAt) : new Date();
    const safeUpdated = existing.updatedAt ? new Date(existing.updatedAt) : new Date();

    const event: ApiEvent = {
      ...(existing.toObject() as any),
      _id: String((existing as any)._id ?? ""),
      createdAt: safeCreated.toISOString(),
      updatedAt: safeUpdated.toISOString(),
    };

    return NextResponse.json({ message: "Event updated successfully", event }, { status: 200 });
  } catch (error) {
    console.error({ route: "/api/events/[slug]", error });
    return NextResponse.json(
      { error: { message: "Unexpected error while updating event" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const res = await getAndValidateSlug(context);
    if ("error" in res) return res.error;
    const { slug } = res;

    await connectDB();
    const deleted = await Event.findOneAndDelete({ slug }).exec();
    if (!deleted) {
      return NextResponse.json({ error: { message: "Event not found" } }, { status: 404 });
    }
    return NextResponse.json({ message: "Event deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error({ route: "/api/events/[slug]", error });
    return NextResponse.json(
      { error: { message: "Unexpected error while deleting event" } },
      { status: 500 }
    );
  }
}
