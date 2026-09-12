import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Gauge,
  LayoutDashboard,
  MessageSquareText,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const items = [
  { label: "Overview", href: "#overview", icon: LayoutDashboard },
  { label: "High-Risk Viewers", href: "/high-risk-viewers", icon: AlertTriangle },
  { label: "Viewer Search", href: "#viewer-search", icon: Search },
  { label: "Churn Analytics", href: "/churn-analytics", icon: TrendingUp },
  { label: "Viewer Behavior", href: "/viewer-behavior", icon: Users },
  { label: "Action Analytics", href: "/action-analytics", icon: Activity },
  { label: "Content Analytics", href: "/content-analytics", icon: BarChart3 },
  { label: "Sentiment & Intent", href: "/sentiment-intent", icon: MessageSquareText },
  { label: "Audience Segments", href: "/audience-segments", icon: Gauge },
  { label: "Retention Intelligence", href: "/retention-intelligence", icon: TrendingUp },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950/80 p-5 lg:flex lg:flex-col">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/40">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">AI Suite</div>
          <div className="text-lg font-semibold text-slate-50">TubePulse</div>
        </div>
      </div>

      <nav className="space-y-2">
        {items.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-900/80 hover:text-slate-50"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-slate-800 bg-slate-900/80 p-4">
        <Link href="/settings" className="flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-slate-50">
          <Settings className="h-4 w-4" />
          Channel Settings
        </Link>
      </div>
    </aside>
  );
}
