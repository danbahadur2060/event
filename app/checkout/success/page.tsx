import Link from "next/link";
import { Suspense } from "react";

function SuccessContent({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="glass p-8 rounded-md max-w-md text-center space-y-4">
        <div className="text-green-400 text-6xl mb-4">✓</div>
        <h1 className="text-2xl font-bold">Payment Successful!</h1>
        <p className="text-light-200">
          Your order has been confirmed. You will receive an email confirmation shortly.
        </p>
        <div className="pt-4">
          <Link href="/dashboard" className="bg-primary text-black rounded px-6 py-3 inline-block">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      {/* @ts-expect-error Async Server Component */}
      <SuccessContent searchParams={searchParams} />
    </Suspense>
  );
}
