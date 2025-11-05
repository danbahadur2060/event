import { Schema, model, models, Model, HydratedDocument } from "mongoose";

export type UserRole =
  | "attendee"
  | "organizer"
  | "speaker"
  | "exhibitor"
  | "admin"
  | "superadmin"; // keep superadmin for backward compatibility

export interface User {
  name: string;
  email: string;
  password?: string; // hashed; optional for OAuth users
  role: UserRole;
  image?: string; // avatar URL
  bio?: string;
  social?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  tags?: string[]; // interests/tags
  resumeUrl?: string;
  emailVerified?: Date | null;
  suspendedUntil?: Date | null; // if set and in the future, user is suspended
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<User>;

const UserSchema = new Schema<User>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"],
      index: true,
    },
    password: { type: String, required: false },
    role: {
      type: String,
      enum: ["attendee", "organizer", "speaker", "exhibitor", "admin", "superadmin"],
      default: "attendee",
      index: true,
    },
    image: { type: String, required: false },
    bio: { type: String, required: false },
    social: {
      website: { type: String },
      twitter: { type: String },
      linkedin: { type: String },
      github: { type: String },
    },
    tags: { type: [String], default: [] },
    resumeUrl: { type: String, required: false },
    emailVerified: { type: Date, required: false, default: null },
    suspendedUntil: { type: Date, required: false, default: null },
  },
  { timestamps: true, versionKey: false }
);

const UserModel: Model<User> =
  (models.User as Model<User>) || model<User>("User", UserSchema);

export default UserModel;
