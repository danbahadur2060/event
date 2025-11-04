import { Schema, model, models, Model, Types } from "mongoose";

export type OrgRole = "owner" | "admin" | "staff";

export interface Organization {
  name: string;
  slug: string;
  ownerId: Types.ObjectId;
  members: {
    userId: Types.ObjectId;
    role: OrgRole;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const slugify = (title: string): string =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const OrganizationSchema = new Schema<Organization>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        role: { type: String, enum: ["owner", "admin", "staff"], default: "staff" },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

OrganizationSchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
  next();
});

const OrganizationModel: Model<Organization> =
  (models.Organization as Model<Organization>) ||
  model<Organization>("Organization", OrganizationSchema);

export default OrganizationModel;
export type { Organization as IOrganization };
