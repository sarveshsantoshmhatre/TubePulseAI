import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Clock3,
  Gauge,
  Heart,
  MessageSquareText,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import { commentRecords, engagementRecords, viewerActivity, viewerById, videos } from "@/lib/data";
import { featureEngineerViewer, getRiskLevel } from "@/lib/prediction";

const riskPalette = {
  Low: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25",
  Medium: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25",
  High: "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/25",
  Critical: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/25",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getActivityStatus(viewer: (typeof viewerById extends Map<string, infer T> ? T : never)) {
  const daysSince = Math.max(
    0,
    Math.round((Date.now() - new Date(`${viewer.lastActive}T00:00:00Z`).getTime()) / 86400000),
  );

  if (viewer.riskScore >= 81 || daysSince >= 18) return "Dormant";
  if (viewer.riskScore >= 61 || daysSince >= 10) return "Cooling Off";
  return "Active";
}

function getSegment(viewer: (typeof viewerById extends Map<string, infer T> ? T : never)) {
  if (viewer.riskScore >= 81) return "At-risk churn spike";
  if (viewer.riskScore >= 61) return "Loyalty risk";
  if (viewer.returnRate >= 65) return "Core loyalist";
  if (viewer.avgPercentageViewed >= 70) return "Value-driven viewer";
  return "Exploratory viewer";
}

function getPreferredDays(viewer: (typeof viewerById extends Map<string, infer T> ? T : never)) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const startIndex = viewer.riskScore % days.length;

  return days.slice(startIndex, startIndex + 2).join(" & ");
}

function getPreferredTime(viewer: (typeof viewerById extends Map<string, infer T> ? T : never)) {
  const windows = ["Morning", "Afternoon", "Evening", "Late Night"];
  return windows[viewer.watchFrequency % windows.length];
}

function getTimeline(viewer: (typeof viewerById extends Map<string, infer T> ? T : never)) {
  const labels = ["May", "Jun", "Jul", "Aug", "Sep"];

  return labels.map((label, index) => {
    const intensity = 1 + index * 0.18;

    return {
      label,
      sessions: clamp(Math.round((viewer.totalSessions / 2.2) * intensity), 2, 18),
      videos: clamp(Math.round((viewer.totalSessions * 0.7) * intensity), 2, 16),
      watchTime: clamp(Math.round((viewer.watchTimeMinutes / 1.8) * (1.05 - index * 0.08)), 14, 180),
      likes: clamp(Math.round((viewer.likes / 1.4) * (0.8 + index * 0.12)), 2, 48),
      comments: clamp(Math.round((viewer.comments / 1.2) * (0.75 + index * 0.1)), 1, 22),
      shares: clamp(Math.round((viewer.shares / 1.3) * (0.65 + index * 0.12)), 1, 14),
    };
  });
}

export default async function ViewerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = viewerById.get(id);

  if (!viewer) {
    notFound();
  }

  const recentSessions = viewerActivity
    .filter((entry) => entry.viewerId === viewer.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const recentComments = commentRecords
    .filter((entry) => entry.viewerId === viewer.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const recentEngagement = engagementRecords
    .filter((entry) => entry.viewerId === viewer.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const activityStatus = getActivityStatus(viewer);
  const segment = getSegment(viewer);
  const preferredDays = getPreferredDays(viewer);
  const preferredTime = getPreferredTime(viewer);
  const features = featureEngineerViewer(viewer);
  const riskDrivers = viewer.riskFactors;
  const timeline = getTimeline(viewer);

  const averageSessionDuration = Math.round(
    recentSessions.reduce((sum, entry) => sum + entry.watchMinutes, 0) / Math.max(recentSessions.length, 1),
  );

  const averageCompletion = Math.round(
    recentSessions.reduce((sum, entry) => sum + entry.completionRate, 0) / Math.max(recentSessions.length, 1),
  );

  const categoryMeter = viewer.contentPreferences.map((category, index) => ({
    category,
    value: clamp(38 + (viewer.riskScore % 32) + index * 10, 40, 100),
  }));

  const recentActivityRows = recentSessions.map((entry, index) => {
    const video = videos.find((item) => item.id === entry.videoId);
    const engagement = recentEngagement[index] ?? recentEngagement[0];

    return {
      date: entry.date,
      video: video?.title ?? "Video session",
      duration: `${entry.watchMinutes} min`,
      percentage: `${entry.completionRate}%`,
      action: entry.sessionType,
      engagement: engagement ? `${engagement.likes}/${engagement.comments}/${engagement.shares}` : "—",
    };
  });

  const computedRiskLevel = getRiskLevel(viewer.riskScore);
  const trendColor = computedRiskLevel === "Critical" ? "#f43f5e" : computedRiskLevel === "High" ? "#f97316" : computedRiskLevel === "Medium" ? "#f59e0b" : "#22c55e";

  return (
    <main className="min-h-screen bg-[#020817] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:border-slate-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <div className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-sm text-sky-300">
            Viewer intelligence
          </div>
        </div>

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Anonymous audience profile</div>
              <h1 className="mt-2 text-3xl font-semibold text-white">{viewer.id}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${riskPalette[computedRiskLevel]}`}>
                {computedRiskLevel} risk
              </span>
              <span className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
                Risk score: <span className="font-semibold text-white">{viewer.riskScore}</span>
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <InfoCard label="Last active" value={viewer.lastActive} icon={CalendarDays} />
            <InfoCard label="Status" value={activityStatus} icon={Activity} tone={activityStatus === "Active" ? "emerald" : activityStatus === "Cooling Off" ? "amber" : "slate"} />
            <InfoCard label="Preferred content" value={viewer.contentPreferences[0]} icon={Sparkles} />
            <InfoCard label="Viewer segment" value={segment} icon={Target} />
            <InfoCard label="Repeat viewing" value={`${viewer.returnRate}%`} icon={Users} />
            <InfoCard label="Avg. completion" value={`${viewer.avgPercentageViewed}%`} icon={Gauge} />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <ShieldAlert className="h-4 w-4" />
              Risk overview
            </div>

            <div className="flex flex-col items-center justify-center gap-4 py-4">
              <div
                className="relative flex h-44 w-44 items-center justify-center rounded-full ring-1 ring-slate-700"
                style={{
                  background: `conic-gradient(${trendColor} ${viewer.riskScore}%, rgba(15,23,42,0.9) 0)`,
                }}
              >
                <div className="flex h-28 w-28 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-center shadow-2xl shadow-slate-950/80">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Prediction</div>
                    <div className="mt-1 text-3xl font-semibold text-white">{viewer.riskScore}%</div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Predicted churn risk</div>
                <div className="mt-1 text-2xl font-semibold text-white">{viewer.riskScore}%</div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {riskDrivers.map((factor) => (
                <div key={factor} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-200">
                  {factor}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <BarChart3 className="h-4 w-4" />
              Viewer snapshot
            </div>

            <div className="space-y-4">
              <SnapshotRow label="Avg. session duration" value={`${averageSessionDuration} min`} />
              <SnapshotRow label="Average percentage viewed" value={`${averageCompletion}%`} />
              <SnapshotRow label="Viewing frequency" value={`${features.viewingFrequency}/week`} />
              <SnapshotRow label="Preferred days" value={preferredDays} />
              <SnapshotRow label="Preferred time" value={preferredTime} />
              <SnapshotRow label="Repeat viewing" value={`${viewer.returnRate}%`} />
              <SnapshotRow label="Favorite categories" value={viewer.contentPreferences.join(" • ")} />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <Activity className="h-4 w-4" />
            Behavior timeline
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-[70px_repeat(6,minmax(0,1fr))] gap-2 text-[10px] uppercase tracking-[0.14em] text-slate-400">
              <div />
              <div className="text-center">Sessions</div>
              <div className="text-center">Videos</div>
              <div className="text-center">Watch</div>
              <div className="text-center">Likes</div>
              <div className="text-center">Comments</div>
              <div className="text-center">Shares</div>
            </div>

            {timeline.map((entry) => {
              const values = [
                { label: "Sessions", value: entry.sessions, color: "bg-sky-400" },
                { label: "Videos", value: entry.videos, color: "bg-violet-400" },
                { label: "Watch", value: entry.watchTime, color: "bg-emerald-400" },
                { label: "Likes", value: entry.likes, color: "bg-amber-400" },
                { label: "Comments", value: entry.comments, color: "bg-rose-400" },
                { label: "Shares", value: entry.shares, color: "bg-cyan-400" },
              ];

              const maxValue = Math.max(...values.map((item) => item.value));

              return (
                <div key={entry.label} className="grid grid-cols-[70px_repeat(6,minmax(0,1fr))] items-end gap-2">
                  <div className="text-sm text-slate-300">{entry.label}</div>
                  {values.map((metric) => (
                    <div key={metric.label} className="flex h-20 items-end justify-center">
                      <div
                        className={`w-full rounded-t-md ${metric.color}`}
                        style={{
                          height: `${Math.max((metric.value / maxValue) * 100, 8)}%`,
                          opacity: 0.82,
                        }}
                        title={`${metric.label}: ${metric.value}`}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <Users className="h-4 w-4" />
              Watching patterns
            </div>

            <div className="space-y-4">
              <MetricPill label="Average session duration" value={`${averageSessionDuration} min`} />
              <MetricPill label="Average percentage viewed" value={`${averageCompletion}%`} />
              <MetricPill label="Viewing frequency" value={`${viewer.watchFrequency} sessions / week`} />
              <MetricPill label="Preferred days" value={preferredDays} />
              <MetricPill label="Preferred time" value={preferredTime} />
              <MetricPill label="Repeat viewing" value={`${viewer.returnRate}%`} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <TrendingUp className="h-4 w-4" />
              Engagement
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <SummaryBox label="Likes" value={viewer.likes.toString()} icon={Heart} tone="rose" />
              <SummaryBox label="Comments" value={viewer.comments.toString()} icon={MessageSquareText} tone="sky" />
              <SummaryBox label="Shares" value={viewer.shares.toString()} icon={TrendingUp} tone="amber" />
              <SummaryBox label="Engagement rate" value={`${viewer.engagementRate.toFixed(1)}%`} icon={Target} tone="emerald" />
            </div>

            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
                <span>Engagement trend</span>
                <span className="font-medium text-amber-300">{viewer.engagementRate.toFixed(1)}%</span>
              </div>

              <div className="flex h-28 items-end gap-2">
                {[38, 46, 54, 61, 72, 80].map((height, index) => (
                  <div key={height} className="flex-1 rounded-t-lg bg-gradient-to-t from-sky-500/30 to-sky-400/80" style={{ height: `${height}%`, opacity: 0.5 + index * 0.08 }} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <Sparkles className="h-4 w-4" />
            Content preferences
          </div>

          <div className="flex flex-wrap gap-2">
            {viewer.contentPreferences.map((category) => (
              <div key={category} className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-sm text-sky-200 ring-1 ring-sky-500/20">
                {category}
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {categoryMeter.map((item) => (
              <div key={item.category} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="mb-3 flex items-center justify-between text-sm text-slate-200">
                  <span>{item.category}</span>
                  <span className="font-medium text-white">{item.value}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <MessageSquareText className="h-4 w-4" />
            Recent sentiment
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {recentComments.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-200">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                  <span>{entry.date}</span>
                  <span className="capitalize text-slate-300">{entry.sentiment}</span>
                </div>
                <p>{entry.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <Clock3 className="h-4 w-4" />
            Recent activity
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Video</th>
                  <th className="pb-3 pr-4 font-medium">Watch duration</th>
                  <th className="pb-3 pr-4 font-medium">% viewed</th>
                  <th className="pb-3 pr-4 font-medium">Action</th>
                  <th className="pb-3 font-medium">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {recentActivityRows.map((row) => (
                  <tr key={`${row.date}-${row.video}`} className="border-b border-slate-800/80 align-middle text-sm">
                    <td className="py-3 pr-4 text-slate-300">{row.date}</td>
                    <td className="py-3 pr-4 font-medium text-white">{row.video}</td>
                    <td className="py-3 pr-4">{row.duration}</td>
                    <td className="py-3 pr-4">{row.percentage}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200">
                        {row.action}
                      </span>
                    </td>
                    <td className="py-3">{row.engagement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
  icon: Icon,
  tone = "sky",
}: {
  label: string;
  value: string;
  icon: typeof Gauge;
  tone?: "sky" | "emerald" | "amber" | "slate";
}) {
  const toneMap = {
    sky: "bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20",
    emerald: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20",
    slate: "bg-slate-500/10 text-slate-200 ring-1 ring-slate-500/20",
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <div className={`mb-3 inline-flex rounded-lg p-2 ${toneMap[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-2 text-sm font-medium text-slate-50">{value}</div>
    </div>
  );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-200">
      <span className="text-slate-300">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-200">
      <span className="text-slate-300">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

function SummaryBox({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Heart;
  tone: "rose" | "sky" | "amber" | "emerald";
}) {
  const toneMap = {
    rose: "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20",
    sky: "bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20",
    amber: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20",
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <div className={`mb-3 inline-flex rounded-lg p-2 ${toneMap[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}
