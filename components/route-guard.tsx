"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Sparkles } from "lucide-react";

const publicPaths = ["/auth/login", "/auth/signup"];

export function RouteGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isPublicPath = publicPaths.some((p) => pathname === p);
    const isAuthPath = pathname.startsWith("/auth/");

    if (!user && !isPublicPath) {
      router.push("/auth/login");
    }

    if (user && isAuthPath) {
      router.push("/");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020817]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/40">
            <Sparkles className="h-6 w-6" />
          </div>
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  const isPublicPath = publicPaths.some((p) => pathname === p);

  if (!user && !isPublicPath) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020817]">
        <p className="text-sm text-slate-400">Redirecting to sign in...</p>
      </div>
    );
  }

  return <>{children}</>;
}
