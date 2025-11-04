import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { User } from "@/database";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as SessionUser | undefined)?.role;
  if (role !== "superadmin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const users = await User.find().sort({ createdAt: -1 }).select("name email role createdAt").lean();
  return NextResponse.json({ users });
}
