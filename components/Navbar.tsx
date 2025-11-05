"use client";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import type { SessionUser } from "@/lib/auth";

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as SessionUser | undefined;

  const handleSignOut = () => {
    signOut();
  };

  return (
    <header>
      <nav>
        <Link href="/" className="logo">
          <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
          <p>DevEvent</p>
        </Link>
        <ul>
          <Link href="/">Home</Link>
          <Link href="/events">Events</Link>
          {user ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <button onClick={handleSignOut} className="underline">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
