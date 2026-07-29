"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="h-8 w-8 rounded-lg bg-ig-gradient" />
          ReplyBee
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-gray-600 sm:flex">
          <Link href="/#features" className="hover:text-gray-900">Features</Link>
          <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
          {session ? (
            <Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link>
          ) : null}
          {(session?.user as any)?.role === "ADMIN" ? (
            <Link href="/admin" className="hover:text-gray-900">Admin</Link>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-secondary !px-4 !py-2 text-sm">
              Sign out
            </button>
          ) : (
            <>
              <Link href="/login" className="btn-secondary !px-4 !py-2 text-sm">Log in</Link>
              <Link href="/signup" className="btn-primary !px-4 !py-2 text-sm">Start free trial</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
