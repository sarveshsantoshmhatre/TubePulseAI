"use client";

import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#020817] p-4 text-slate-100">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50 ring-1 ring-slate-700">
          <Search className="h-8 w-8 text-slate-400" />
        </div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">404</h1>
        <h2 className="mb-4 text-xl font-semibold text-slate-200">Page Not Found</h2>
        <p className="mb-8 text-sm text-slate-400">
          The page you're looking for doesn't exist or has been moved to another URL.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
