"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const Navbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const flag = typeof window !== "undefined" && localStorage.getItem("isAdmin");
      setIsAdmin(flag === "true");
    } catch {}
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("isAdmin");
    } catch {}
    setIsAdmin(false);
  };

  return (
    <header>
      <nav>
        <Link href="/" className="logo">
          <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
          <p>DevEvent</p>
        </Link>
        <ul className="flex items-center gap-4">
          <Link href="/">Home</Link>
          <Link href="/events">Events</Link>
          <Link href="/contact">Contact Event</Link>

          {/* Right side: auth actions */}
          {!mounted ? null : !isAdmin ? (
            <Link href="/login" className="ml-2">
              Admin Login
            </Link>
          ) : (
            <>
              <Link href="/dashboard" className="ml-2">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="ml-2 underline">
                Logout
              </button>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
