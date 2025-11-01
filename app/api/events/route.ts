import { Event } from "@/database";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

/**
 * Create a new event from multipart form data, upload its image to Cloudinary, and store the event in MongoDB.
 *
 * Parses the incoming form data, requires an "image" file, parses "tags" and "agenda" as JSON, uploads the image to Cloudinary, sets the event's `image` to the uploaded URL, creates the Event document, and returns an appropriate JSON response.
 *
 * Validation and status codes:
 * - Returns status 400 if the form data is invalid or the image is missing.
 * - Returns status 201 with the created event on success.
 * - Returns status 500 if an unexpected error occurs.
 *
 * @returns A NextResponse whose JSON body is either:
 * - On success: `{ message: string, event: <created event document> }` with status 201.
 * - On client error: `{ message: string, error?: string }` with status 400.
 * - On server error: `{ message: string, error?: string }` with status 500.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    let event;
    try {
      event = Object.fromEntries(formData.entries());
    } catch (formError) {
      return NextResponse.json(
        {
          message: "Invalid form data",
          error: formError instanceof Error ? formError.message : "Unknown",
        },
        { status: 400 }
      );
    }

    const file = formData.get("image") as File;
    if (!file)
      return NextResponse.json(
        {
          message: "Image file is required",
        },
        { status: 400 }
      );

    const tags = JSON.parse(formData.get("tags") as string);
    const agenda = JSON.parse(formData.get("agenda") as string);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "image", folder: "Devevent" },
          (error, results) => {
            if (error) return reject(error);
            resolve(results);
          }
        )
        .end(buffer);
    });

    event.image = (uploadResult as { secure_url: string }).secure_url;

    const createdEvent = await Event.create({
      ...event,
      tags: tags,
      agenda: agenda,
    });

    return NextResponse.json(
      {
        message: "Event created successfully",
        event: createdEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Event creation Failed",
        error: error instanceof Error ? error.message : "Unknown",
      },
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