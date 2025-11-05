import { NextRequest, NextResponse } from "next/server";
import { Organization } from "@/database";
import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await context.params;
    const body = await req.json();
    const { userId, role } = body as { userId: string; role: "admin" | "staff" };
    if (!userId || !role) return NextResponse.json({ message: "userId and role required" }, { status: 400 });

    const org = await Organization.findById(id);
    if (!org) return NextResponse.json({ message: "Org not found" }, { status: 404 });

    const me = org.members.find((m) => String(m.userId) === String(user.id));
    if (!me || (me.role !== "owner" && me.role !== "admin")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const existing = org.members.find((m) => String(m.userId) === String(userId));
    if (existing) {
      existing.role = role;
    } else {
      org.members.push({ userId, role } as any);
    }
    await org.save();

    return NextResponse.json({ message: "Member updated", org }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
