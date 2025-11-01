import { Schema, model, models, Model, HydratedDocument } from "mongoose";

// Event domain type with runtime-backed timestamps
export interface Event {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // normalized to YYYY-MM-DD
  time: string; // normalized to HH:mm (24h)
  mode: string; // e.g., online | offline | hybrid
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = HydratedDocument<Event>;

// Helpers
const isNonEmpty = (v: string): boolean =>
  typeof v === "string" && v.trim().length > 0;

const slugify = (title: string): string =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeTime = (value: string): string => {
  const v = value.trim();
  // 24h: HH:mm or H:mm or HH:mm:ss
  const m24 = v.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
  if (m24) {
    const hh = String(Number(m24[1]).toString().padStart(2, "0"));
    const mm = m24[2];
    return `${hh}:${mm}`; // HH:mm
  }
  // 12h: h:mm AM/PM
  const m12 = v.match(/^(0?\d|1[0-2]):([0-5]\d)\s*([AP]M)$/i);
  if (m12) {
    let hh = Number(m12[1]);
    const mm = m12[2];
    const ap = m12[3].toUpperCase();
    if (ap === "AM") {
      hh = hh === 12 ? 0 : hh;
    } else {
      hh = hh === 12 ? 12 : hh + 12;
    }
    return `${String(hh).padStart(2, "0")}:${mm}`;
  }
  throw new Error("Invalid time format. Use HH:mm (24h) or h:mm AM/PM");
};

const EventSchema = new Schema<Event>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      validate: { validator: isNonEmpty, message: "Title cannot be empty" },
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      validate: {
        validator: isNonEmpty,
        message: "Description cannot be empty",
      },
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
      validate: { validator: isNonEmpty, message: "Overview cannot be empty" },
    },
    image: {
      type: String,
      required: [true, "Image is required"],
      trim: true,
      validate: { validator: isNonEmpty, message: "Image cannot be empty" },
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
      validate: { validator: isNonEmpty, message: "Venue cannot be empty" },
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      validate: { validator: isNonEmpty, message: "Location cannot be empty" },
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      trim: true,
      validate: { validator: isNonEmpty, message: "Date cannot be empty" },
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      trim: true,
      validate: { validator: isNonEmpty, message: "Time cannot be empty" },
    },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      trim: true,
      validate: { validator: isNonEmpty, message: "Mode cannot be empty" },
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
      validate: { validator: isNonEmpty, message: "Audience cannot be empty" },
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (v: string[]) =>
          Array.isArray(v) && v.length > 0 && v.every(isNonEmpty),
        message: "Agenda must be a non-empty array of strings",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
      validate: { validator: isNonEmpty, message: "Organizer cannot be empty" },
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (v: string[]) =>
          Array.isArray(v) && v.length > 0 && v.every(isNonEmpty),
        message: "Tags must be a non-empty array of strings",
      },
    },
  },
  { timestamps: true, versionKey: false }
);

// Pre-save: generate slug (only when title changes) and normalize date/time
EventSchema.pre("save", function (this: EventDocument, next) {
  try {
    if (this.isModified("title") || !this.slug) {
      this.slug = slugify(this.title);
    }

    // Normalize date to YYYY-MM-DD (ISO date-only)
    if (this.isModified("date")) {
      const d = new Date(this.date);
      if (Number.isNaN(d.getTime())) {
        return next(new Error("Invalid date"));
      }
      this.date = d.toISOString().slice(0, 10);
    }

    // Normalize time to HH:mm (24-hour)
    if (this.isModified("time")) {
      this.time = normalizeTime(this.time);
    }

    next();
  } catch (err) {
    next(err as Error);
  }
});

const EventModel: Model<Event> =
  (models.Event as Model<Event>) || model<Event>("Event", EventSchema);

export default EventModel;
