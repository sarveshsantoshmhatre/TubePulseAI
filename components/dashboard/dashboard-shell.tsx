"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Clock3,
  Filter,
  ShieldAlert,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  AudienceActivityChart,
  EngagementTrendChart,
  PreferenceChart,
  RetentionVsChurnChart,
  ReturningViewerTrendChart,
  RiskDistributionChart,
  WatchTimeChart,
} from "@/components/charts/analytics-charts";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { contentPreferenceData, riskDistribution, viewers } from "@/lib/data";
import { featureEngineerViewer, getRiskLevel } from "@/lib/prediction";

const riskPalette = {
  Low: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25",
  Medium: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25",
  High: "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/25",
  Critical: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/25",
};

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

export function DashboardShell() {
  const [channel, setChannel] = useState("Creator Growth Lab");
  const [dateRange, setDateRange] = useState("30d");
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [preferenceFilter, setPreferenceFilter] = useState("All");

  const filteredViewers = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    const rangeDays = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : null;
    const cutoff = new Date("2026-09-30T00:00:00Z");

    if (rangeDays) {
      cutoff.setUTCDate(cutoff.getUTCDate() - rangeDays);
    }

    return viewers.filter((viewer) => {
      const matchesRisk = riskFilter === "All" || viewer.riskLevel === riskFilter;
      const matchesPreference =
        preferenceFilter === "All" || viewer.contentPreferences.includes(preferenceFilter);
      const matchesSearch =
        normalizedQuery.length === 0 ||
        viewer.id.toLowerCase().includes(normalizedQuery) ||
        viewer.contentPreferences.some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesDate =
        rangeDays === null || new Date(`${viewer.lastActive}T00:00:00Z`) >= cutoff;

      return matchesRisk && matchesPreference && matchesSearch && matchesDate;
    });
  }, [dateRange, preferenceFilter, riskFilter, searchTerm]);

  const highRiskViewers = useMemo(
    () => [...filteredViewers].sort((a, b) => b.riskScore - a.riskScore).slice(0, 6),
    [filteredViewers],
  );

  const totalAudience = filteredViewers.length;
  const activeViewers = filteredViewers.filter((viewer) => viewer.totalSessions >= 10).length;
  const returningViewers = filteredViewers.filter((viewer) => viewer.returnRate >= 55).length;
  const avgWatchTime =
    filteredViewers.length > 0
      ? filteredViewers.reduce((sum, viewer) => sum + viewer.watchTimeMinutes, 0) / filteredViewers.length
      : 0;
  const avgEngagement =
    filteredViewers.length > 0
      ? filteredViewers.reduce((sum, viewer) => sum + viewer.engagementRate, 0) / filteredViewers.length
      : 0;
  const predictedChurn =
    filteredViewers.length > 0
      ? Math.round(
          filteredViewers.reduce((sum, viewer) => sum + viewer.riskScore, 0) / filteredViewers.length,
        )
      : 0;
  const atRiskViewers = filteredViewers.filter((viewer) => viewer.riskScore >= 61).length;
  const retentionRate =
    filteredViewers.length > 0
      ? Math.round(
          filteredViewers.reduce((sum, viewer) => sum + viewer.returnRate, 0) / filteredViewers.length,
        )
      : 0;

  const kpiCards: Array<{
    label: string;
    value: string;
    change: string;
    tone: "sky" | "emerald" | "violet" | "amber" | "orange" | "rose" | "red";
    icon: LucideIcon;
  }> = [
    {
      label: "Total Audience",
      value: formatNumber(totalAudience),
      change: "+12.8%",
      tone: "sky",
      icon: Users,
    },
    {
      label: "Active Viewers",
      value: formatNumber(activeViewers),
      change: "+8.4%",
      tone: "emerald",
      icon: Activity,
    },
    {
      label: "Returning Viewers",
      value: formatNumber(returningViewers),
      change: "+5.3%",
      tone: "violet",
      icon: Users,
    },
    {
      label: "Average Watch Time",
      value: `${Math.round(avgWatchTime)} min`,
      change: "+3.1%",
      tone: "amber",
      icon: Clock3,
    },
    {
      label: "Engagement Rate",
      value: `${avgEngagement.toFixed(1)}%`,
      change: "+1.7%",
      tone: "orange",
      icon: TrendingUp,
    },
    {
      label: "Predicted Churn",
      value: `${predictedChurn}%`,
      change: "-2.2%",
      tone: "rose",
      icon: ShieldAlert,
    },
    {
      label: "At-Risk Viewers",
      value: formatNumber(atRiskViewers),
      change: "+4.6%",
      tone: "red",
      icon: ShieldAlert,
    },
    {
      label: "30-Day Retention",
      value: `${retentionRate}%`,
      change: "+6.9%",
      tone: "sky",
      icon: BarChart3,
    },
  ];

  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const resetFilters = () => {
    setRiskFilter("All");
    setPreferenceFilter("All");
    setDateRange("30d");
    setSearchTerm("");
    setShowFilterPanel(false);
  };

  const hasActiveFilters = riskFilter !== "All" || preferenceFilter !== "All" || searchTerm !== "" || dateRange !== "30d";

  const [operatingMode, setOperatingMode] = useState<"demo" | "connected">("connected");

  useEffect(() => {
    const syncMode = () => {
      const mode = localStorage.getItem("tubepulse_mode") || (process.env.NEXT_PUBLIC_DEMO_MODE === "false" ? "connected" : "demo");
      setOperatingMode(mode as "demo" | "connected");
    };
    syncMode();
    window.addEventListener("tubepulse_mode_changed", syncMode);
    return () => window.removeEventListener("tubepulse_mode_changed", syncMode);
  }, []);

  return (
    <div className="min-h-screen bg-[#020817] text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex min-w-0 flex-1 flex-col">
          <Topbar
            channel={channel}
            setChannel={setChannel}
            dateRange={dateRange}
            setDateRange={setDateRange}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          <div className="flex-1 p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              id="overview" 
              className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"
            >
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] font-semibold text-emerald-400">
                  {operatingMode === "connected" ? "Connected YouTube API Data" : "Synthetic demo data"}
                </div>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">TubePulse AI</h1>
              </div>

              <div className="relative flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    hasActiveFilters
                      ? "border-sky-500 bg-sky-500/10 text-sky-300"
                      : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-600"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filters {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-sky-400" />}
                </button>

                {showFilterPanel && (
                  <div className="absolute left-0 top-12 z-40 w-72 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-2xl backdrop-blur-xl">
                    <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-semibold text-white">Quick Filter Preset</span>
                      {hasActiveFilters && (
                        <button
                          onClick={resetFilters}
                          className="text-[11px] font-medium text-sky-400 hover:underline"
                        >
                          Reset All
                        </button>
                      )}
                    </div>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Risk Level</label>
                        <select
                          value={riskFilter}
                          onChange={(e) => setRiskFilter(e.target.value)}
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-100"
                        >
                          <option value="All">All risk levels</option>
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">Content Preference</label>
                        <select
                          value={preferenceFilter}
                          onChange={(e) => setPreferenceFilter(e.target.value)}
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-100"
                        >
                          <option value="All">All content types</option>
                          {contentPreferenceData.map((entry) => (
                            <option key={entry.category} value={entry.category}>
                              {entry.category}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => setShowFilterPanel(false)}
                          className="rounded-lg bg-sky-500 px-3 py-1.5 font-medium text-white hover:bg-sky-400"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <select
                  value={riskFilter}
                  onChange={(event) => setRiskFilter(event.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none"
                >
                  <option value="All">All risk levels</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
                <select
                  value={preferenceFilter}
                  onChange={(event) => setPreferenceFilter(event.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none"
                >
                  <option value="All">All content types</option>
                  {contentPreferenceData.map((entry) => (
                    <option key={entry.category} value={entry.category}>
                      {entry.category}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>

            <motion.section 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
            >
              {kpiCards.map(({ label, value, change, tone, icon: Icon }) => (
                <MetricCard key={label} label={label} value={value} change={change} tone={tone} icon={Icon} />
              ))}
            </motion.section>

            <section id="high-risk-viewers" className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Priority watchlist</div>
                  <h2 className="mt-2 text-2xl font-semibold text-white">High-Risk Viewers</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">
                    {highRiskViewers.length} flagged viewers
                  </div>
                  <Link
                    href="/high-risk-viewers"
                    className="inline-flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-300 transition hover:border-sky-500/40 hover:bg-sky-500/15"
                  >
                    Open full list
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-200">
                  <thead className="border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="pb-3 pr-4 font-medium">Viewer ID</th>
                      <th className="pb-3 pr-4 font-medium">Risk Score</th>
                      <th className="pb-3 pr-4 font-medium">Risk Level</th>
                      <th className="pb-3 pr-4 font-medium">Last Active</th>
                      <th className="pb-3 pr-4 font-medium">Watch Time</th>
                      <th className="pb-3 pr-4 font-medium">Watch Δ</th>
                      <th className="pb-3 pr-4 font-medium">Engagement</th>
                      <th className="pb-3 pr-4 font-medium">Engagement Δ</th>
                      <th className="pb-3 font-medium">Preferred Content</th>
                    </tr>
                  </thead>
                  <tbody>
                    {highRiskViewers.map((viewer) => (
                      <tr key={viewer.id} className="border-b border-slate-800/80 align-middle text-sm text-slate-200">
                        <td className="py-3 pr-4">
                          <Link href={`/viewers/${viewer.id}`} className="font-medium text-sky-300 hover:text-sky-200">
                            {viewer.id}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 font-semibold text-white">{viewer.riskScore}</td>
                        <td className="py-3 pr-4">
                          <span className={`rounded-full px-2 py-1 text-xs ${riskPalette[viewer.riskLevel]}`}>
                            {viewer.riskLevel}
                          </span>
                        </td>
                        <td className="py-3 pr-4">{viewer.lastActive}</td>
                        <td className="py-3 pr-4">{viewer.watchTimeMinutes} min</td>
                        <td className="py-3 pr-4 text-amber-300">
                          {getTrendText(featureEngineerViewer(viewer).watchTimeChange)}
                        </td>
                        <td className="py-3 pr-4">{viewer.engagementRate.toFixed(1)}%</td>
                        <td className="py-3 pr-4 text-amber-300">
                          {getTrendText(featureEngineerViewer(viewer).engagementChange)}
                        </td>
                        <td className="py-3">{viewer.contentPreferences.join(" • ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="viewer-search" className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Searchable viewer list</div>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Viewer Search</h2>
                </div>
                <div className="text-sm text-slate-400">{filteredViewers.length} results</div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-200">
                  <thead className="border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="pb-3 pr-4 font-medium">Viewer</th>
                      <th className="pb-3 pr-4 font-medium">Risk</th>
                      <th className="pb-3 pr-4 font-medium">Watch Time</th>
                      <th className="pb-3 pr-4 font-medium">Returning</th>
                      <th className="pb-3 pr-4 font-medium">Intent</th>
                      <th className="pb-3 font-medium">Open</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredViewers.slice(0, 8).map((viewer) => (
                      <tr key={viewer.id} className="border-b border-slate-800/80 align-middle">
                        <td className="py-3 pr-4 font-medium text-white">{viewer.id}</td>
                        <td className="py-3 pr-4">
                          <span className={`rounded-full px-2 py-1 text-xs ${riskPalette[getRiskLevel(viewer.riskScore)]}`}>
                            {getRiskLevel(viewer.riskScore)}
                          </span>
                        </td>
                        <td className="py-3 pr-4">{viewer.watchTimeMinutes} min</td>
                        <td className="py-3 pr-4">{viewer.returnRate}%</td>
                        <td className="py-3 pr-4">{viewer.intent}</td>
                        <td className="py-3">
                          <Link href={`/viewers/${viewer.id}`} className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300">
                            Profile <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-6 grid gap-4 xl:grid-cols-2"
            >
              <ChartCard id="viewer-behavior" title="Audience Activity Trend" subtitle="Active viewers over time" isTall>
                <AudienceActivityChart />
              </ChartCard>
              <ChartCard id="watch-time" title="Watch Time Trend" subtitle="Average watch time by period" isTall>
                <WatchTimeChart />
              </ChartCard>
              <ChartCard id="action-analytics" title="Engagement Trend" subtitle="Interaction quality by period" isTall>
                <EngagementTrendChart />
              </ChartCard>
              <ChartCard id="churn-analytics" title="Churn Risk Distribution" subtitle="Viewers segmented by churn risk" isTall>
                <RiskDistributionChart />
              </ChartCard>
              <ChartCard id="returning-viewers" title="Returning Viewer Trend" subtitle="Repeat-viewer momentum" isTall>
                <ReturningViewerTrendChart />
              </ChartCard>
              <ChartCard id="retention-intelligence" title="Retention vs. Churn Risk" subtitle="Retention health against churn pressure" isTall>
                <RetentionVsChurnChart />
              </ChartCard>
            </motion.section>

            <section id="content-analytics" className="mb-6 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
              <ChartCard title="Content Analytics" subtitle="Content mix by viewer preference" isTall>
                <PreferenceChart />
              </ChartCard>

              <div id="sentiment-intent" className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <div className="mb-3 text-[10px] uppercase tracking-[0.2em] text-slate-400">Sentiment & Intent</div>
                <h3 className="text-xl font-semibold text-white">Audience signals</h3>
                <div className="mt-4 space-y-3">
                  {[
                    { label: "Positive sentiment", value: "71%", tone: "text-emerald-300" },
                    { label: "Neutral sentiment", value: "18%", tone: "text-amber-300" },
                    { label: "Negative sentiment", value: "11%", tone: "text-rose-300" },
                    { label: "Top intent", value: "Learning", tone: "text-sky-300" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm">
                      <span className="text-slate-300">{item.label}</span>
                      <span className={`font-medium ${item.tone}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="audience-segments" className="mb-6 grid gap-4 lg:grid-cols-3">
              {riskDistribution.map((segment) => (
                <div key={segment.name} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-300">{segment.name}</div>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.fill }} />
                  </div>
                  <div className="mt-4 text-3xl font-semibold text-white">{segment.value}%</div>
                  <div className="mt-2 text-xs text-slate-400">Audience segment</div>
                </div>
              ))}
            </section>

            <section id="settings" className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Operational controls</div>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Settings</h2>
                </div>
                <div className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs text-sky-300">
                  Demo mode active
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <SettingBlock title="Risk threshold" value="High-risk at 61+" />
                <SettingBlock title="Retention target" value="68%" />
                <SettingBlock title="Comment analysis" value="NLP-ready" />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  change,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  change: string;
  tone: "sky" | "emerald" | "violet" | "amber" | "orange" | "rose" | "red";
  icon: LucideIcon;
}) {
  const toneMap = {
    sky: "bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20",
    emerald: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20",
    violet: "bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20",
    amber: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20",
    orange: "bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/20",
    rose: "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20",
    red: "bg-red-500/10 text-red-300 ring-1 ring-red-500/20",
  };

  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
      }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 transition-colors hover:border-slate-700"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className={`rounded-xl p-2 ${toneMap[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-500/20">
          <TrendingUp className="h-3 w-3" />
          {change}
        </div>
      </div>

      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</div>
    </motion.div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  isTall = false,
  id,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  isTall?: boolean;
  id?: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      id={id} 
      className={`rounded-2xl border border-slate-800 bg-slate-900/80 p-4 transition-colors hover:border-slate-700 ${isTall ? "min-h-[360px]" : "min-h-[280px]"}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{subtitle}</div>
          <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
        </div>
        <div className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
          Live
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function SettingBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{title}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function getTrendText(value: number): string {
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}
