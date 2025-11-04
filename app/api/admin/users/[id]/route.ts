import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { User } from "@/database";

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as SessionUser | undefined)?.role;
  if (role !== "superadmin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const { id } = await context.params;
  await connectDB();
  await User.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as SessionUser | undefined)?.role;
  if (role !== "superadmin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const { id } = await context.params;
  const { days } = await req.json();
  const d = Number(days);
  if (!Number.isFinite(d) || d < 0) return NextResponse.json({ message: "days must be >= 0" }, { status: 400 });
  await connectDB();
  const suspendedUntil = d === 0 ? null : new Date(Date.now() + d * 24 * 60 * 60 * 1000);
  await User.findByIdAndUpdate(id, { $set: { suspendedUntil } });
  return NextResponse.json({ ok: true, suspendedUntil });
}
