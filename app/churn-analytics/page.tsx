"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { AlertTriangle, ArrowRight, ArrowUpRight, BarChart3, RefreshCw, ShieldAlert, Users } from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";
import { viewers } from "@/lib/data";
import { calculateDisengagementPrediction } from "@/lib/prediction";
import type { RiskLevel, Viewer } from "@/lib/types";

const referenceDate = new Date("2026-09-30T00:00:00Z");
const riskColors: Record<RiskLevel, string> = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#f43f5e",
};

const formatPercent = (value: number) => `${Math.round(value)}%`;
const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);

function getDaysSince(date: string) {
  return Math.max(0, Math.round((referenceDate.getTime() - new Date(`${date}T00:00:00Z`).getTime()) / 86400000));
}

function getAudienceSegment(viewer: Viewer) {
  if (viewer.riskScore >= 81) return "Urgent re-engagement";
  if (viewer.riskScore >= 61) return "Cooling loyalists";
  if (viewer.returnRate >= 65) return "Core loyalists";
  return "Exploring audience";
}

function ChartFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="min-h-[360px] rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <div className="mb-5">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{subtitle}</div>
        <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function MetricCard({ label, value, detail, tone = "sky" }: { label: string; value: string; detail: string; tone?: "sky" | "rose" | "amber" | "violet" }) {
  const toneMap = {
    sky: "border-sky-500/20 bg-sky-500/10 text-sky-300",
    rose: "border-rose-500/20 bg-rose-500/10 text-rose-300",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    violet: "border-violet-500/20 bg-violet-500/10 text-violet-300",
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <div className={`mb-4 inline-flex rounded-lg border p-2 ${toneMap[tone]}`}><BarChart3 className="h-4 w-4" /></div>
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</div>
      <div className="mt-2 text-xs text-slate-500">{detail}</div>
    </div>
  );
}

export default function ChurnAnalyticsPage() {
  const [range, setRange] = useState("30d");

  const analytics = useMemo(() => {
    const rangeDays = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : Infinity;
    const audience = viewers.filter((viewer) => getDaysSince(viewer.lastActive) <= rangeDays);
    const source = audience.length ? audience : viewers;
    const records = source.map((viewer) => {
      const prediction = calculateDisengagementPrediction(viewer);
      return { viewer, prediction, features: prediction.featureVector };
    });

    const timeline = [35, 28, 21, 14, 7, 0].map((daysAgo, index) => {
      const date = new Date(referenceDate);
      date.setUTCDate(date.getUTCDate() - daysAgo);
      const predictions = source.map((viewer) => calculateDisengagementPrediction(viewer, { referenceDate: date }));
      const averageRisk = average(predictions.map((prediction) => prediction.churnProbability));
      return {
        period: ["Aug 26", "Sep 2", "Sep 9", "Sep 16", "Sep 23", "Sep 30"][index],
        risk: Math.round(averageRisk),
        retention: Math.round(average(source.map((viewer) => viewer.returnRate)) - averageRisk * 0.12 + index * 0.5),
        returning: Math.round(average(source.map((viewer) => viewer.returnRate)) - averageRisk * 0.08 + index * 0.3),
      };
    });

    const distribution = (["Low", "Medium", "High", "Critical"] as RiskLevel[]).map((level) => ({
      name: level,
      value: records.filter((record) => record.prediction.riskLevel === level).length,
      fill: riskColors[level],
    }));

    const categories = Array.from(new Set(source.flatMap((viewer) => viewer.contentPreferences))).map((category) => {
      const categoryRecords = records.filter((record) => record.viewer.contentPreferences.includes(category));
      return {
        category,
        risk: Math.round(average(categoryRecords.map((record) => record.prediction.churnProbability))),
        highRisk: categoryRecords.filter((record) => record.prediction.churnProbability >= 61).length,
        viewers: categoryRecords.length,
      };
    }).sort((a, b) => b.risk - a.risk);

    const segments = Array.from(new Set(source.map(getAudienceSegment))).map((segment) => {
      const segmentRecords = records.filter((record) => getAudienceSegment(record.viewer) === segment);
      return { segment, risk: Math.round(average(segmentRecords.map((record) => record.prediction.churnProbability))), viewers: segmentRecords.length };
    }).sort((a, b) => b.risk - a.risk);

    const averageRisk = average(records.map((record) => record.prediction.churnProbability));
    const highRisk = records.filter((record) => record.prediction.churnProbability >= 61);
    const criticalRisk = records.filter((record) => record.prediction.churnProbability >= 81);
    const watchDecline = average(highRisk.map((record) => Math.max(0, -record.features.watchTimeChange)));
    const engagementDecline = average(highRisk.map((record) => Math.max(0, -record.features.engagementChange)));
    const bestCategory = [...categories].sort((a, b) => a.risk - b.risk)[0];
    const riskChange = timeline.at(-1)!.risk - timeline[0].risk;

    return { source, records, timeline, distribution, categories, segments, averageRisk, highRisk, criticalRisk, watchDecline, engagementDecline, bestCategory, riskChange };
  }, [range]);

  const latest = analytics.timeline.at(-1)!;

  return (
    <div className="min-h-screen bg-[#020817] text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <div className="border-b border-slate-800 bg-slate-950/60 px-5 py-5 sm:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-sky-400">Prediction intelligence</div>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Churn Analytics</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">Viewer disengagement risk, not subscriber unsubscribe events. All predictions use synthetic demo telemetry.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-slate-300">Date range
                  <select value={range} onChange={(event) => setRange(event.target.value)} className="ml-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none">
                    <option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option><option value="all">All time</option>
                  </select>
                </label>
                <Link href="/high-risk-viewers" className="inline-flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm font-medium text-sky-300 hover:bg-sky-500/15">View watchlist <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Current predicted churn" value={formatPercent(analytics.averageRisk)} detail={`${analytics.source.length} viewers in selected range`} tone="rose" />
              <MetricCard label="High-risk audience" value={analytics.highRisk.length.toString()} detail="High + critical risk scores" tone="amber" />
              <MetricCard label="Critical-risk audience" value={analytics.criticalRisk.length.toString()} detail="Requires immediate re-engagement" tone="rose" />
              <MetricCard label="Average risk score" value={formatPercent(analytics.averageRisk)} detail={`${analytics.riskChange >= 0 ? "+" : ""}${analytics.riskChange} pts across the selected trend`} />
              <MetricCard label="Risk increase / decrease" value={`${analytics.riskChange >= 0 ? "+" : ""}${analytics.riskChange} pts`} detail="Compared with the start of the trend" tone={analytics.riskChange > 0 ? "rose" : "sky"} />
              <MetricCard label="Returning viewer rate" value={formatPercent(latest.returning)} detail="Prediction-adjusted returning behavior" tone="violet" />
              <MetricCard label="30-day retention" value={formatPercent(latest.retention)} detail="Estimated retained audience" tone="sky" />
            </section>

            <section className="mb-6 grid gap-5 xl:grid-cols-2">
              <ChartFrame title="Churn risk trend" subtitle="Average predicted disengagement probability">
                <div className="h-64"><ResponsiveContainer><LineChart data={analytics.timeline}><CartesianGrid stroke="#1e293b" strokeDasharray="3 3" /><XAxis dataKey="period" stroke="#94a3b8" tickLine={false} axisLine={false} /><YAxis domain={[0, 100]} stroke="#94a3b8" tickLine={false} axisLine={false} /><Tooltip contentStyle={{ background: "#020817", border: "1px solid #1e293b", borderRadius: 12 }} formatter={(value) => [`${value}%`, "Risk"]} /><Line type="monotone" dataKey="risk" stroke="#f43f5e" strokeWidth={3} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></div>
              </ChartFrame>
              <ChartFrame title="Risk distribution" subtitle="Click a segment in the legend to open the relevant viewers">
                <div className="grid items-center gap-4 sm:grid-cols-[1fr_150px]"><div className="h-64"><ResponsiveContainer><PieChart><Pie data={analytics.distribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>{analytics.distribution.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}</Pie><Tooltip contentStyle={{ background: "#020817", border: "1px solid #1e293b", borderRadius: 12 }} /></PieChart></ResponsiveContainer></div><div className="space-y-2">{analytics.distribution.map((entry) => <Link key={entry.name} href="/high-risk-viewers" className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm hover:border-slate-600"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />{entry.name}</span><span className="font-semibold text-white">{entry.value}</span></Link>)}</div></div>
              </ChartFrame>
              <ChartFrame title="Watch-time decline vs. risk" subtitle="Each point represents a viewer; hover to inspect the relationship">
                <div className="h-64"><ResponsiveContainer><ScatterChart><CartesianGrid stroke="#1e293b" strokeDasharray="3 3" /><XAxis dataKey="decline" name="Watch-time decline" unit="%" stroke="#94a3b8" /><YAxis dataKey="risk" name="Risk" unit="%" stroke="#94a3b8" domain={[0, 100]} /><ZAxis range={[50, 160]} /><Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#020817", border: "1px solid #1e293b", borderRadius: 12 }} /><Scatter data={analytics.records.map((record) => ({ viewer: record.viewer.id, decline: Math.max(0, -record.features.watchTimeChange), risk: record.prediction.churnProbability }))} fill="#38bdf8" /></ScatterChart></ResponsiveContainer></div>
              </ChartFrame>
              <ChartFrame title="Engagement decline vs. risk" subtitle="Behavioral engagement signal against predicted risk">
                <div className="h-64"><ResponsiveContainer><ScatterChart><CartesianGrid stroke="#1e293b" strokeDasharray="3 3" /><XAxis dataKey="decline" name="Engagement decline" unit="%" stroke="#94a3b8" /><YAxis dataKey="risk" name="Risk" unit="%" stroke="#94a3b8" domain={[0, 100]} /><ZAxis range={[50, 160]} /><Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#020817", border: "1px solid #1e293b", borderRadius: 12 }} /><Scatter data={analytics.records.map((record) => ({ viewer: record.viewer.id, decline: Math.max(0, -record.features.engagementChange), risk: record.prediction.churnProbability }))} fill="#f59e0b" /></ScatterChart></ResponsiveContainer></div>
              </ChartFrame>
              <ChartFrame title="Risk by content category" subtitle="Click a high-risk category to open its filtered viewers">
                <div className="h-64"><ResponsiveContainer><BarChart data={analytics.categories.slice(0, 7)} layout="vertical" margin={{ left: 12 }}><CartesianGrid stroke="#1e293b" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" domain={[0, 100]} stroke="#94a3b8" /><YAxis type="category" dataKey="category" width={95} stroke="#94a3b8" /><Tooltip contentStyle={{ background: "#020817", border: "1px solid #1e293b", borderRadius: 12 }} /><Bar dataKey="risk" fill="#a78bfa" radius={[0, 7, 7, 0]} /></BarChart></ResponsiveContainer></div>
                <div className="mt-3 flex flex-wrap gap-2">{analytics.categories.filter((entry) => entry.highRisk > 0).slice(0, 5).map((entry) => <Link key={entry.category} href={`/high-risk-viewers?content=${encodeURIComponent(entry.category)}`} className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-200 hover:bg-violet-500/20">{entry.category} · {entry.highRisk} at risk <ArrowUpRight className="ml-1 inline h-3 w-3" /></Link>)}</div>
              </ChartFrame>
              <ChartFrame title="Risk by audience segment" subtitle="Segments calculated from model risk and returning behavior">
                <div className="h-64"><ResponsiveContainer><BarChart data={analytics.segments}><CartesianGrid stroke="#1e293b" strokeDasharray="3 3" /><XAxis dataKey="segment" stroke="#94a3b8" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} stroke="#94a3b8" /><Tooltip contentStyle={{ background: "#020817", border: "1px solid #1e293b", borderRadius: 12 }} /><Bar dataKey="risk" fill="#f97316" radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></div>
              </ChartFrame>
              <ChartFrame title="Retention trend" subtitle="Estimated retained audience over the selected period">
                <div className="h-64"><ResponsiveContainer><AreaChart data={analytics.timeline}><defs><linearGradient id="retentionArea" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#38bdf8" stopOpacity={0.55} /><stop offset="95%" stopColor="#38bdf8" stopOpacity={0.04} /></linearGradient></defs><CartesianGrid stroke="#1e293b" strokeDasharray="3 3" /><XAxis dataKey="period" stroke="#94a3b8" tickLine={false} axisLine={false} /><YAxis domain={[0, 100]} stroke="#94a3b8" /><Tooltip contentStyle={{ background: "#020817", border: "1px solid #1e293b", borderRadius: 12 }} /><Area type="monotone" dataKey="retention" stroke="#38bdf8" fill="url(#retentionArea)" strokeWidth={3} /></AreaChart></ResponsiveContainer></div>
              </ChartFrame>
              <ChartFrame title="Returning viewer trend" subtitle="Returning-viewer frequency adjusted for current risk">
                <div className="h-64"><ResponsiveContainer><AreaChart data={analytics.timeline}><defs><linearGradient id="returningArea" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#a78bfa" stopOpacity={0.5} /><stop offset="95%" stopColor="#a78bfa" stopOpacity={0.04} /></linearGradient></defs><CartesianGrid stroke="#1e293b" strokeDasharray="3 3" /><XAxis dataKey="period" stroke="#94a3b8" tickLine={false} axisLine={false} /><YAxis domain={[0, 100]} stroke="#94a3b8" /><Tooltip contentStyle={{ background: "#020817", border: "1px solid #1e293b", borderRadius: 12 }} /><Area type="monotone" dataKey="returning" stroke="#a78bfa" fill="url(#returningArea)" strokeWidth={3} /></AreaChart></ResponsiveContainer></div>
              </ChartFrame>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400"><ShieldAlert className="h-4 w-4" /> Model-driven insights</div>
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                <Insight icon={AlertTriangle} text={`High-risk viewers show an average ${formatPercent(analytics.watchDecline)} watch-time decline in this range.`} />
                <Insight icon={RefreshCw} text={`Returning-viewer frequency is ${analytics.riskChange >= 0 ? "under pressure" : "improving"}, with risk moving ${Math.abs(analytics.riskChange)} points across the trend.`} />
                <Insight icon={Users} text={`${analytics.bestCategory.category} viewers average ${formatPercent(analytics.bestCategory.risk)} disengagement risk, compared with ${formatPercent(analytics.averageRisk)} channel-wide.`} />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function Insight({ icon: Icon, text }: { icon: typeof AlertTriangle; text: string }) {
  return <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300"><Icon className="mb-3 h-5 w-5 text-sky-300" />{text}</div>;
}
