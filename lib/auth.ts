import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import connectDB from "@/lib/mongodb";
import { User } from "@/database";
import type { JWT } from "next-auth/jwt";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "attendee" | "organizer" | "speaker" | "exhibitor" | "admin" | "superadmin";
  image?: string;
};

type TokenWithRole = JWT & {
  id?: string;
  role?: SessionUser["role"];
  picture?: string;
};


export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString() ?? "";
        if (!email || !password) return null;

        await connectDB();
        const user = await User.findOne({ email }).lean<{
          _id: unknown;
          name: string;
          email: string;
          password?: string;
          role: SessionUser["role"];
          image?: string;
        }>();
        if (!user || !user.password) return null;
        const isValid = await compare(password, user.password);
        if (!isValid) return null;

        const sessionUser: SessionUser = {
          id: String(user._id ?? ""),
          name: user.name,
          email: user.email,
          role: user.role ?? "attendee",
          image: user.image,
        };
        return sessionUser as unknown as { id: string; name: string; email: string };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth providers, ensure we have a User in our DB
      if (account && account.type === "oauth") {
        const email = (user.email || "").toLowerCase();
        if (!email) return false;
        await connectDB();
        const existing = await User.findOne({ email });
        if (!existing) {
          await User.create({
            name: user.name || email.split("@")[0],
            email,
            role: "attendee",
            image: (user as any).image || (profile as any)?.picture || undefined,
            emailVerified: new Date(),
          });
        } else if (!existing.image && (user as any).image) {
          existing.image = (user as any).image as string;
          await existing.save();
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as SessionUser;
        const t = token as TokenWithRole;
        t.id = u.id;
        t.role = u.role ?? "attendee";
        token.name = u.name;
        token.email = u.email;
        t.picture = u.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        const t = token as TokenWithRole;
        (session.user as unknown as SessionUser).id = t.id ?? "";
        (session.user as unknown as SessionUser).role = t.role ?? "attendee";
        (session.user as any).image = t.picture;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
