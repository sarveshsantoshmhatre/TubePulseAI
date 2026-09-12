"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import {
  ArrowRight,
  BarChart2,
  Cpu,
  Layers,
  Search,
  Users,
} from "lucide-react";

import {
  AvailableSegmentationAlgorithms,
  DeterministicSegmentationModel,
  getAudienceSegmentSummaries,
} from "@/lib/segmentation/service";
import type { SegmentKey } from "@/lib/segmentation/types";

const SEGMENT_COLORS: Record<SegmentKey, string> = {
  "Loyal Viewers": "#22c55e",
  "Highly Engaged Viewers": "#38bdf8",
  "Casual Viewers": "#a78bfa",
  "New Viewers": "#f59e0b",
  "At-Risk Viewers": "#f97316",
  "Dormant Viewers": "#f43f5e",
  "Content-Specific Viewers": "#06b6d4",
  "High-Value Viewers": "#10b981",
};

export function AudienceSegmentsAnalytics() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("deterministic");
  const [activeSegmentFilter, setActiveSegmentFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const summaries = useMemo(() => {
    return getAudienceSegmentSummaries(DeterministicSegmentationModel);
  }, []);

  const activeSegmentSummary = useMemo(() => {
    if (activeSegmentFilter === "all") return null;
    return summaries.find((s) => s.key === activeSegmentFilter) || null;
  }, [summaries, activeSegmentFilter]);

  const allViewers = useMemo(() => {
    return summaries.flatMap((s) => s.viewers.map((v) => ({ ...v, segmentKey: s.key })));
  }, [summaries]);

  const filteredViewers = useMemo(() => {
    return allViewers.filter((v) => {
      const matchesSegment = activeSegmentFilter === "all" || v.segmentKey === activeSegmentFilter;
      const matchesQuery =
        v.id.toLowerCase().includes(query.toLowerCase()) ||
        v.contentPreferences.some((cat) => cat.toLowerCase().includes(query.toLowerCase()));
      return matchesSegment && matchesQuery;
    });
  }, [allViewers, activeSegmentFilter, query]);

  return (
    <main className="min-h-screen bg-[#020817] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] font-semibold text-sky-400">Audience Intelligence · Step 10</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Audience Segmentation</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-400 leading-relaxed">
              Categorize viewers into 8 distinct behavioral cohorts. Analyze audience composition, engagement profiles, watch time habits, and disengagement risk to drive targeted retention strategies.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
          >
            Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Algorithm Strategy Banner */}
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Segmentation Engine Architecture</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Modular segmentation pipeline ready for drop-in replacement with unsupervised ML clustering algorithms.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={selectedAlgorithm}
                onChange={(e) => setSelectedAlgorithm(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
              >
                {AvailableSegmentationAlgorithms.map((algo) => (
                  <option key={algo.id} value={algo.id}>
                    {algo.name} ({algo.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* 8 SEGMENT CARDS GRID */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-sky-400" />
              <h2 className="text-xl font-bold text-white">Audience Segments Overview (8 Cohorts)</h2>
            </div>
            {activeSegmentFilter !== "all" && (
              <button
                onClick={() => setActiveSegmentFilter("all")}
                className="text-xs text-sky-400 hover:text-sky-300 underline"
              >
                Show All Segments
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaries.map((segment) => {
              const isSelected = activeSegmentFilter === segment.key;
              const color = SEGMENT_COLORS[segment.key];

              return (
                <div
                  key={segment.key}
                  onClick={() => setActiveSegmentFilter(isSelected ? "all" : segment.key)}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? "border-sky-400 bg-slate-900 ring-2 ring-sky-500/30 shadow-lg"
                      : "border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{segment.title}</span>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 leading-snug line-clamp-2">{segment.description}</p>

                    <div className="mt-4 flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-white font-mono">{segment.count}</span>
                      <span className="text-xs font-semibold text-sky-300">{segment.percentage}% of audience</span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs border-t border-slate-800/80 pt-3">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Avg. Watch Time:</span>
                        <span className="font-mono font-medium">{segment.avgWatchTime} min</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Engagement Rate:</span>
                        <span className="font-mono font-medium text-sky-300">{segment.engagementRate}%</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Avg. Retention:</span>
                        <span className="font-mono font-medium">{segment.avgRetention}%</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Churn Risk:</span>
                        <span className={`font-mono font-semibold ${segment.churnRisk >= 55 ? "text-rose-400" : "text-emerald-400"}`}>
                          {segment.churnRisk}%
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Preferred Content:</span>
                        <span className="font-medium text-indigo-300 truncate max-w-[120px]">{segment.preferredContent}</span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Sparkline Trend */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[10px] uppercase text-slate-500 font-semibold">Activity Trend</span>
                    <div className="flex items-end gap-1 h-6">
                      {segment.activityTrend.map((t, idx) => (
                        <div
                          key={idx}
                          className="w-2.5 rounded-t"
                          style={{
                            height: `${Math.min(Math.max((t.activity / 800) * 100, 20), 100)}%`,
                            backgroundColor: color,
                            opacity: 0.8,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SEGMENT COMPARISON CHARTS */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Segment Comparison Analysis</h2>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {/* Chart 1: Audience Distribution & Churn Risk */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-white">Audience Volume & Churn Risk Comparison</h3>
              <p className="text-xs text-slate-400 mt-1">Comparing viewer count and average predicted churn risk across all 8 segments</p>
              <div className="mt-5 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summaries} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="title" stroke="#94a3b8" tick={{ fontSize: 9 }} interval={0} angle={-25} textAnchor="end" />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#020817", border: "1px solid #334155", borderRadius: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Bar dataKey="count" name="Audience Count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="churnRisk" name="Churn Risk (%)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Watch Time vs Retention Scatter */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-white">Watch Time vs Retention Profile</h3>
              <p className="text-xs text-slate-400 mt-1">Evaluating average watch minutes against completion percentage per segment</p>
              <div className="mt-5 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="avgWatchTime" name="Avg Watch Time" unit=" min" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="avgRetention" name="Avg Retention" unit="%" domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <ZAxis range={[120, 400]} />
                    <Tooltip
                      contentStyle={{ background: "#020817", border: "1px solid #334155", borderRadius: 12 }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value?: any, name?: any) => [`${value ?? 0}`, String(name ?? "Value")]}
                    />
                    <Scatter name="Segments" data={summaries} fill="#a78bfa">
                      {summaries.map((entry) => (
                        <Cell key={entry.key} fill={SEGMENT_COLORS[entry.key]} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* VIEWER DRILLDOWN TABLE */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400">Viewer Drilldown</div>
              <h2 className="text-2xl font-bold text-white">
                {activeSegmentSummary ? `${activeSegmentSummary.title} Viewers (${filteredViewers.length})` : `All Segment Viewers (${filteredViewers.length})`}
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search viewer ID or category..."
                  className="rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
                />
              </label>
              <select
                value={activeSegmentFilter}
                onChange={(e) => setActiveSegmentFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
              >
                <option value="all">All 8 Segments</option>
                {summaries.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.title} ({s.count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Viewer ID</th>
                  <th className="py-3 px-4 font-semibold">Assigned Segment</th>
                  <th className="py-3 px-4 font-semibold text-right">Watch Time</th>
                  <th className="py-3 px-4 font-semibold text-right">Frequency</th>
                  <th className="py-3 px-4 font-semibold text-right">Avg Retention</th>
                  <th className="py-3 px-4 font-semibold text-right">Engagement Rate</th>
                  <th className="py-3 px-4 font-semibold text-right">Return Rate</th>
                  <th className="py-3 px-4 font-semibold text-right">Churn Risk</th>
                  <th className="py-3 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {filteredViewers.slice(0, 15).map((viewer) => (
                  <tr key={viewer.id} className="transition hover:bg-slate-800/40 text-slate-200">
                    <td className="py-3.5 px-4 font-mono font-medium text-white">
                      <Link href={`/viewers/${viewer.id}`} className="hover:text-sky-400 hover:underline">
                        {viewer.id}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `${SEGMENT_COLORS[viewer.segmentKey as SegmentKey]}15`,
                          color: SEGMENT_COLORS[viewer.segmentKey as SegmentKey],
                          border: `1px solid ${SEGMENT_COLORS[viewer.segmentKey as SegmentKey]}40`,
                        }}
                      >
                        {viewer.segmentKey}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">{viewer.watchTimeMinutes} min</td>
                    <td className="py-3.5 px-4 text-right font-mono">{viewer.watchFrequency}/mo</td>
                    <td className="py-3.5 px-4 text-right font-mono">{viewer.avgPercentageViewed}%</td>
                    <td className="py-3.5 px-4 text-right font-mono text-sky-300">{viewer.engagementRate}%</td>
                    <td className="py-3.5 px-4 text-right font-mono text-indigo-300">{viewer.returnRate}%</td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold">
                      <span className={viewer.riskScore >= 55 ? "text-rose-400" : "text-emerald-400"}>
                        {viewer.riskScore}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/viewers/${viewer.id}`}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-sky-300 transition hover:border-sky-500 hover:text-white"
                      >
                        Profile <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
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
