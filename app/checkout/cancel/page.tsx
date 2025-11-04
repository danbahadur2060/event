import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="glass p-8 rounded-md max-w-md text-center space-y-4">
        <div className="text-yellow-400 text-6xl mb-4">⚠</div>
        <h1 className="text-2xl font-bold">Payment Cancelled</h1>
        <p className="text-light-200">
          Your payment was cancelled. You can try again or explore other events.
        </p>
        <div className="pt-4 flex gap-4 justify-center">
          <Link href="/" className="glass rounded px-6 py-3 inline-block">
            Browse Events
          </Link>
          <Link href="/dashboard" className="bg-primary text-black rounded px-6 py-3 inline-block">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
