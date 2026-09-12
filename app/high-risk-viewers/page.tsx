"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { viewers } from "@/lib/data";
import { featureEngineerViewer, getRiskLevel } from "@/lib/prediction";

const riskPalette = {
  Low: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25",
  Medium: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25",
  High: "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/25",
  Critical: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/25",
};

const statusPalette = {
  Escalated: "bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/30",
  "At Risk": "bg-orange-500/15 text-orange-200 ring-1 ring-orange-500/30",
  Monitor: "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30",
  Healthy: "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30",
};

const pageSize = 8;
const formatSignedPercent = (value: number) => `${value > 0 ? "+" : ""}${value}%`;
const formatSignedTrend = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

const getStatus = (viewer: (typeof viewers)[number]) => {
  if (viewer.riskScore >= 81) return "Escalated";
  if (viewer.riskScore >= 61) return "At Risk";
  if (viewer.returnRate < 50 || viewer.engagementRate < 6) return "Monitor";
  return "Healthy";
};

const getFilterValue = (value: string) => {
  switch (value) {
    case "decline-15":
      return -15;
    case "decline-8":
      return -8;
    case "stable":
      return 0;
    case "improving":
      return 5;
    default:
      return null;
  }
};

export default function HighRiskViewersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskLevel, setRiskLevel] = useState("All");
  const [watchTimeFilter, setWatchTimeFilter] = useState("all");
  const [engagementFilter, setEngagementFilter] = useState("all");
  const [inactivityFilter, setInactivityFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("all");
  const [contentFilter, setContentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("highest-risk");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const requestedContent = new URLSearchParams(window.location.search).get("content");
    if (requestedContent) setContentFilter(requestedContent);
  }, []);

  const contentOptions = useMemo(
    () => Array.from(new Set(viewers.flatMap((viewer) => viewer.contentPreferences))).sort(),
    [],
  );

  const rows = useMemo(
    () =>
      viewers.map((viewer) => {
        const features = featureEngineerViewer(viewer);

        return {
          viewer,
          churnRisk: viewer.riskScore,
          riskLevel: getRiskLevel(viewer.riskScore),
          lastActive: viewer.lastActive,
          watchTime: viewer.watchTimeMinutes,
          watchTimeChange: features.watchTimeChange,
          viewingFrequency: viewer.watchFrequency,
          frequencyChange: features.frequencyChange,
          engagement: viewer.engagementRate,
          engagementChange: features.engagementChange,
          avgPercentageViewed: viewer.avgPercentageViewed,
          preferredContent: viewer.contentPreferences.join(" • "),
          status: getStatus(viewer),
          inactivityDays: features.inactivityDuration,
        };
      }),
    [],
  );

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    return rows
      .filter((row) => {
        const matchesSearch =
          normalizedQuery.length === 0 ||
          row.viewer.id.toLowerCase().includes(normalizedQuery) ||
          row.preferredContent.toLowerCase().includes(normalizedQuery) ||
          row.viewer.contentPreferences.some((value) => value.toLowerCase().includes(normalizedQuery));

        const matchesRisk = riskLevel === "All" || row.riskLevel === riskLevel;

        const matchesWatchTime = (() => {
          const threshold = getFilterValue(watchTimeFilter);
          if (threshold === null) return true;
          if (watchTimeFilter === "stable") return row.watchTimeChange >= -4 && row.watchTimeChange <= 4;
          if (watchTimeFilter === "improving") return row.watchTimeChange > 0;
          return row.watchTimeChange <= threshold;
        })();

        const matchesEngagement = (() => {
          const threshold = getFilterValue(engagementFilter);
          if (threshold === null) return true;
          if (engagementFilter === "stable") return row.engagementChange >= -4 && row.engagementChange <= 4;
          if (engagementFilter === "improving") return row.engagementChange > 0;
          return row.engagementChange <= threshold;
        })();

        const matchesInactivity = (() => {
          if (inactivityFilter === "all") return true;
          if (inactivityFilter === "7d") return row.inactivityDays >= 7;
          if (inactivityFilter === "14d") return row.inactivityDays >= 14;
          if (inactivityFilter === "30d") return row.inactivityDays >= 30;
          return true;
        })();

        const matchesFrequency = (() => {
          if (frequencyFilter === "all") return true;
          if (frequencyFilter === "low") return row.viewingFrequency <= 4;
          if (frequencyFilter === "moderate") return row.viewingFrequency > 4 && row.viewingFrequency <= 8;
          if (frequencyFilter === "high") return row.viewingFrequency > 8;
          return true;
        })();

        const matchesContent =
          contentFilter === "all" || row.viewer.contentPreferences.includes(contentFilter);

        return (
          matchesSearch &&
          matchesRisk &&
          matchesWatchTime &&
          matchesEngagement &&
          matchesInactivity &&
          matchesFrequency &&
          matchesContent
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "lowest-risk":
            return a.churnRisk - b.churnRisk;
          case "largest-watch-time-decline":
            return a.watchTimeChange - b.watchTimeChange;
          case "largest-engagement-decline":
            return a.engagementChange - b.engagementChange;
          case "longest-inactivity":
            return b.inactivityDays - a.inactivityDays;
          case "highest-risk":
          default:
            return b.churnRisk - a.churnRisk;
        }
      });
  }, [contentFilter, engagementFilter, frequencyFilter, inactivityFilter, riskLevel, rows, searchTerm, sortBy, watchTimeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRows = filteredRows.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const summaryCards = useMemo(() => {
    const totalAtRisk = rows.filter((row) => row.churnRisk >= 61).length;
    const critical = rows.filter((row) => row.churnRisk >= 81).length;
    const high = rows.filter((row) => row.churnRisk >= 61 && row.churnRisk < 81).length;
    const medium = rows.filter((row) => row.churnRisk >= 31 && row.churnRisk < 61).length;
    const deteriorating = rows.filter(
      (row) => row.watchTimeChange <= -10 || row.engagementChange <= -8 || row.inactivityDays >= 18,
    ).length;

    return [
      { label: "Total At-Risk Viewers", value: totalAtRisk, tone: "rose", icon: ShieldAlert },
      { label: "Critical Risk", value: critical, tone: "red", icon: AlertTriangle },
      { label: "High Risk", value: high, tone: "orange", icon: TrendingDown },
      { label: "Medium Risk", value: medium, tone: "amber", icon: Users },
      { label: "Recently Deteriorating Viewers", value: deteriorating, tone: "sky", icon: TrendingDown },
    ];
  }, [rows]);

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(Math.min(Math.max(1, nextPage), totalPages));
  };

  return (
    <main className="min-h-screen bg-[#020817] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-sky-400">Retention intelligence</div>
            <h1 className="mt-2 text-3xl font-semibold text-white">High-Risk Viewers</h1>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-600"
          >
            Back to dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map(({ label, value, tone, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div
                  className={`rounded-xl p-2 ring-1 ${
                    tone === "rose"
                      ? "bg-rose-500/10 text-rose-300 ring-rose-500/20"
                      : tone === "red"
                        ? "bg-red-500/10 text-red-300 ring-red-500/20"
                        : tone === "orange"
                          ? "bg-orange-500/10 text-orange-300 ring-orange-500/20"
                          : tone === "amber"
                            ? "bg-amber-500/10 text-amber-300 ring-amber-500/20"
                            : "bg-sky-500/10 text-sky-300 ring-sky-500/20"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Live</span>
              </div>
              <div className="text-sm text-slate-400">{label}</div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</div>
            </div>
          ))}
        </section>

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Priority filter</div>
              <h2 className="mt-2 text-2xl font-semibold text-white">Retention watchlist</h2>
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">
              {filteredRows.length} viewers
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
            <label className="relative block xl:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search viewer ID or content"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-50 outline-none placeholder:text-slate-500"
              />
            </label>

            <select
              value={riskLevel}
              onChange={(event) => {
                setRiskLevel(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none"
            >
              <option value="All">Risk level</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            <select
              value={watchTimeFilter}
              onChange={(event) => {
                setWatchTimeFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none"
            >
              <option value="all">Watch-time decline</option>
              <option value="decline-15">Down &gt; 15%</option>
              <option value="decline-8">Down &gt; 8%</option>
              <option value="stable">Stable</option>
              <option value="improving">Improving</option>
            </select>

            <select
              value={engagementFilter}
              onChange={(event) => {
                setEngagementFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none"
            >
              <option value="all">Engagement decline</option>
              <option value="decline-15">Down &gt; 15%</option>
              <option value="decline-8">Down &gt; 8%</option>
              <option value="stable">Stable</option>
              <option value="improving">Improving</option>
            </select>

            <select
              value={inactivityFilter}
              onChange={(event) => {
                setInactivityFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none"
            >
              <option value="all">Inactivity</option>
              <option value="7d">7+ days</option>
              <option value="14d">14+ days</option>
              <option value="30d">30+ days</option>
            </select>

            <select
              value={frequencyFilter}
              onChange={(event) => {
                setFrequencyFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none"
            >
              <option value="all">Viewing frequency</option>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>

            <select
              value={contentFilter}
              onChange={(event) => {
                setContentFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none"
            >
              <option value="all">Content preference</option>
              {contentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex flex-col justify-between gap-3 border-t border-slate-800 pt-4 md:flex-row md:items-center">
            <div className="text-sm text-slate-400">Sort by</div>
            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none md:w-72"
            >
              <option value="highest-risk">Highest risk</option>
              <option value="lowest-risk">Lowest risk</option>
              <option value="largest-watch-time-decline">Largest watch-time decline</option>
              <option value="largest-engagement-decline">Largest engagement decline</option>
              <option value="longest-inactivity">Longest inactivity</option>
            </select>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Audience overview</div>
              <h2 className="mt-2 text-2xl font-semibold text-white">Viewer risk table</h2>
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">
              {filteredRows.length} records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1700px] text-left text-sm text-slate-200">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="pb-3 pr-4 font-medium">Viewer ID</th>
                  <th className="pb-3 pr-4 font-medium">Churn Risk</th>
                  <th className="pb-3 pr-4 font-medium">Risk Level</th>
                  <th className="pb-3 pr-4 font-medium">Last Active</th>
                  <th className="pb-3 pr-4 font-medium">Watch Time</th>
                  <th className="pb-3 pr-4 font-medium">Watch Time Change</th>
                  <th className="pb-3 pr-4 font-medium">Viewing Frequency</th>
                  <th className="pb-3 pr-4 font-medium">Frequency Change</th>
                  <th className="pb-3 pr-4 font-medium">Engagement</th>
                  <th className="pb-3 pr-4 font-medium">Engagement Change</th>
                  <th className="pb-3 pr-4 font-medium">Average Percentage Viewed</th>
                  <th className="pb-3 pr-4 font-medium">Preferred Content</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row) => (
                  <tr key={row.viewer.id} className="border-b border-slate-800/80 align-middle text-sm text-slate-200">
                    <td className="py-3 pr-4">
                      <Link href={`/viewers/${row.viewer.id}`} className="font-medium text-sky-300 hover:text-sky-200">
                        {row.viewer.id}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-white">{row.churnRisk}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2 py-1 text-xs ${riskPalette[row.riskLevel]}`}>
                        {row.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{row.lastActive}</td>
                    <td className="py-3 pr-4">{row.watchTime} min</td>
                    <td className={`py-3 pr-4 font-medium ${row.watchTimeChange <= 0 ? "text-amber-300" : "text-emerald-300"}`}>
                      <span className="inline-flex items-center gap-1">
                        {row.watchTimeChange <= 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                        {formatSignedPercent(row.watchTimeChange)}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{row.viewingFrequency}/week</td>
                    <td className={`py-3 pr-4 font-medium ${row.frequencyChange <= 0 ? "text-amber-300" : "text-emerald-300"}`}>
                      {formatSignedPercent(row.frequencyChange)}
                    </td>
                    <td className="py-3 pr-4">{row.engagement.toFixed(1)}%</td>
                    <td className={`py-3 pr-4 font-medium ${row.engagementChange <= 0 ? "text-amber-300" : "text-emerald-300"}`}>
                      <span className="inline-flex items-center gap-1">
                        {row.engagementChange <= 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                        {formatSignedTrend(row.engagementChange)}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{row.avgPercentageViewed}%</td>
                    <td className="py-3 pr-4">{row.preferredContent}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-1 text-xs ${statusPalette[row.status as keyof typeof statusPalette]}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRows.length > 0 && (
            <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-4 sm:flex-row">
              <div className="text-sm text-slate-400">
                Showing {Math.min((safeCurrentPage - 1) * pageSize + 1, filteredRows.length)}-
                {Math.min(safeCurrentPage * pageSize, filteredRows.length)} of {filteredRows.length}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>
                <div className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
                  Page {safeCurrentPage} / {totalPages}
                </div>
                <button
                  type="button"
                  onClick={() => handlePageChange(safeCurrentPage + 1)}
                  disabled={safeCurrentPage === totalPages}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
