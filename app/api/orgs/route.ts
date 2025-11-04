import { NextRequest, NextResponse } from "next/server";
import { Organization } from "@/database";
import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const uid = (session?.user as SessionUser | undefined)?.id;
    if (!uid) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const orgs = await Organization.find({ $or: [{ ownerId: uid }, { "members.userId": uid }] }).lean();
    return NextResponse.json({ orgs }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { name } = await req.json();
    if (!name) return NextResponse.json({ message: "Name required" }, { status: 400 });

    const org = await Organization.create({
      name,
      slug: name,
      ownerId: user.id,
      members: [{ userId: user.id, role: "owner" }],
    });
    return NextResponse.json({ message: "Created", org }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
