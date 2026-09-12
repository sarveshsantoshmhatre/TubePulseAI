"use client";

import { Activity } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020817] text-slate-100">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 ring-1 ring-sky-500/20">
          <Activity className="h-6 w-6 animate-pulse text-sky-400" />
        </div>
        <p className="text-sm font-medium text-slate-400 animate-pulse">Loading dashboard...</p>
      </div>
    </div>
  );
}
