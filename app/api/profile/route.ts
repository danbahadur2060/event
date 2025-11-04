import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User } from "@/database";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const { name, bio, social, tags, resumeUrl } = body;

    const updated = await User.findByIdAndUpdate(
      user.id,
      {
        ...(name ? { name } : {}),
        ...(bio ? { bio } : { bio: "" }),
        ...(social ? { social } : {}),
        ...(Array.isArray(tags) ? { tags } : {}),
        ...(resumeUrl ? { resumeUrl } : { resumeUrl: "" }),
      },
      { new: true }
    ).lean();

    return NextResponse.json({ user: updated }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
