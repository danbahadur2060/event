import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import connectDB from "@/lib/mongodb";
import { User } from "@/database";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    }

    const hashed = await hash(password, 10);
    const role =
      String(email).toLowerCase() === String(process.env.SUPERADMIN_EMAIL).toLowerCase()
        ? "superadmin"
        : "user";

    const user = await User.create({
      name,
      email: String(email).toLowerCase(),
      password: hashed,
      role,
    });

    return NextResponse.json(
      {
        message: "User created",
        user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
