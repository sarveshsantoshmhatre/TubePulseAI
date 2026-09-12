"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Bell, CheckCircle2, ChevronDown, Info, LogOut, Search, Settings, User, X } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

type TopbarProps = {
  channel: string;
  setChannel: (value: string) => void;
  dateRange: string;
  setDateRange: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
};

export function Topbar({
  channel,
  setChannel,
  dateRange,
  setDateRange,
  searchTerm,
  setSearchTerm,
}: TopbarProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [operatingMode, setOperatingMode] = useState<"demo" | "connected">("connected");

  const userInitials = user?.email ? user.email.slice(0, 2).toUpperCase() : "TP";
  const displayName = user?.email ? user.email.split("@")[0] : "Creator";

  useEffect(() => {
    const syncMode = () => {
      const mode = localStorage.getItem("tubepulse_mode") || (process.env.NEXT_PUBLIC_DEMO_MODE === "false" ? "connected" : "demo");
      setOperatingMode(mode as "demo" | "connected");
    };
    syncMode();
    window.addEventListener("tubepulse_mode_changed", syncMode);
    return () => window.removeEventListener("tubepulse_mode_changed", syncMode);
  }, []);

  const [notifications, setNotifications] = useState([
    { id: 1, type: "warning", title: "High Churn Spike", message: "5 viewers flagged with >85% churn risk today.", time: "10m ago", read: false },
    { id: 2, type: "info", title: "ML Model Updated", message: "Audience segmentation clusters recalculated.", time: "1h ago", read: false },
    { id: 3, type: "success", title: "Retention Alert", message: "Loyal segment retention improved by 3.2%.", time: "3h ago", read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="relative flex flex-col gap-4 border-b border-slate-800 bg-slate-950/60 px-4 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between z-30">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sm font-semibold text-sky-300 ring-1 ring-sky-500/30">
          TP
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Audience intelligence</div>
          <div className="text-xl font-semibold text-slate-50">TubePulse AI</div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 xl:ml-8 xl:max-w-4xl xl:flex-row xl:items-center xl:justify-end">
        <label className="relative block min-w-[180px]">
          <span className="sr-only">Channel selector</span>
          <select
            value={channel}
            onChange={(event) => setChannel(event.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 pr-8 text-sm text-slate-100 outline-none hover:border-slate-600 transition"
          >
            <option value="Creator Growth Lab">Creator Growth Lab</option>
            <option value="Productivity Studio">Productivity Studio</option>
            <option value="Tutorial Academy">Tutorial Academy</option>
            <option value="Sports Briefings">Sports Briefings</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </label>

        <label className="relative block min-w-[170px]">
          <span className="sr-only">Date range selector</span>
          <select
            value={dateRange}
            onChange={(event) => setDateRange(event.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 pr-8 text-sm text-slate-100 outline-none hover:border-slate-600 transition"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </label>

        <label className="relative block flex-1 min-w-[220px] max-w-[360px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search viewer ID or content"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-sky-500 transition"
          />
        </label>

        <div className="relative flex items-center gap-2">
          {operatingMode === "connected" ? (
            <div className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] font-semibold text-emerald-300 animate-pulse">
              Connected Mode
            </div>
          ) : (
            <div className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-sky-300">
              Demo Data
            </div>
          )}

          {/* Notifications Button & Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              aria-label="Notifications"
              className="relative rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-200 transition hover:border-slate-600 hover:text-white"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-2xl backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-medium text-sky-300">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-sky-400 hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`flex gap-3 rounded-lg p-2.5 transition text-left ${
                        item.read ? "bg-slate-950/40 opacity-70" : "bg-slate-950/90 border border-slate-800"
                      }`}
                    >
                      {item.type === "warning" && <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />}
                      {item.type === "info" && <Info className="h-4 w-4 shrink-0 text-sky-400 mt-0.5" />}
                      {item.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-200">{item.title}</span>
                          <span className="text-[10px] text-slate-500">{item.time}</span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-400">{item.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings Button */}
          <Link
            href="/settings"
            aria-label="Settings"
            className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-200 transition hover:border-slate-600 hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </Link>

          {/* Creator Profile Menu Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 hover:border-slate-600 transition"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/15 text-xs font-semibold text-sky-300">
                {userInitials}
              </div>
              <div className="hidden text-left text-xs sm:block">
                <div className="font-medium text-slate-100">{displayName}</div>
                <div className="text-slate-400">{user?.email ?? ""}</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl">
                <div className="border-b border-slate-800 px-3 py-2">
                  <div className="text-xs font-semibold text-slate-200">{displayName}</div>
                  <div className="text-[11px] text-slate-400">{user?.email ?? ""}</div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push("/settings");
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Channel Integration & API
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push("/high-risk-viewers");
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <User className="h-3.5 w-3.5" />
                    High-Risk Viewers
                  </button>
                  <button
                    onClick={async () => {
                      setShowUserMenu(false);
                      await signOut();
                      router.push("/auth/login");
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

