"use client";

import Link from "next/link";
import { use } from "react";
import { notFound } from "next/navigation";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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
import { ArrowLeft, Clock, Eye, Info, MessageSquareText, Sparkles, UserCheck, Users } from "lucide-react";

import { getVideoDetail } from "@/lib/content-analytics";

const colors = ["#38bdf8", "#a78bfa", "#f59e0b", "#f97316"];

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="min-h-[340px] rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className="mt-4 flex-1">{children}</div>
    </section>
  );
}

export default function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const detail = getVideoDetail(id);

  if (!detail) notFound();

  const { video, performance, trends, response, sentiments, comments, audienceSegments, riskRelationship, topics } = detail;

  return (
    <main className="min-h-screen bg-[#020817] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Back Link */}
        <Link
          href="/content-analytics"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Content Analytics
        </Link>

        {/* Video Detail Header */}
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-wider font-medium text-sky-400">
            <span>{video.category} · Published {video.publishedDate}</span>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">ID: {video.id}</span>
          </div>
          <h1 className="mt-3 max-w-4xl text-2xl font-bold text-white sm:text-3xl">{video.title}</h1>

          {/* Metric Bar */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Metric label="Views" value={performance.views.toLocaleString()} icon={Eye} />
            <Metric label="Retention" value={`${performance.retention}%`} icon={Sparkles} />
            <Metric label="Engagement Rate" value={`${performance.engagementRate}%`} icon={UserCheck} />
            <Metric label="Returning Viewers" value={performance.returningViewers.toString()} icon={Users} />
            <Metric
              label="Audience Risk Signal"
              value={`${performance.audienceRisk}%`}
              isRisk
              icon={Clock}
            />
          </div>
        </header>

        {/* 10 Required Video Analytics Sections */}
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
          {/* 1. Views Trend */}
          <ChartCard title="Views Trend" subtitle="Daily view accumulation over time">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#020817", border: "1px solid #334155", borderRadius: 12 }} />
                  <Line type="monotone" dataKey="views" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* 2. Watch Time Trend */}
          <ChartCard title="Watch Time Trend" subtitle="Daily watch minutes generated">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#020817", border: "1px solid #334155", borderRadius: 12 }} />
                  <Line type="monotone" dataKey="watchTime" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* 3. Retention Curve */}
          <ChartCard title="Retention Curve" subtitle="Audience retention trajectory across video timeline">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="videoRetention" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#020817", border: "1px solid #334155", borderRadius: 12 }} />
                  <Area type="monotone" dataKey="retention" stroke="#818cf8" fill="url(#videoRetention)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* 4. Engagement Trend */}
          <ChartCard title="Engagement Trend" subtitle="Daily social actions (likes, comments, shares)">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#020817", border: "1px solid #334155", borderRadius: 12 }} />
                  <Bar dataKey="engagement" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* 5. Audience Response */}
          <ChartCard title="Audience Response" subtitle="Traffic source and session entry distribution">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={response} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={4}>
                    {response.map((entry, index) => (
                      <Cell key={entry.name} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#020817", border: "1px solid #334155", borderRadius: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* 9. Audience Segments */}
          <ChartCard title="Audience Segments" subtitle="Viewer breakdown across behavioral segments">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={audienceSegments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="segment" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#020817", border: "1px solid #334155", borderRadius: 12 }} />
                  <Bar dataKey="viewers" fill="#a78bfa" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* 10. Churn/Disengagement Relationship */}
          <div className="md:col-span-2">
            <ChartCard
              title="Churn / Disengagement Relationship"
              subtitle="Scatter analysis of viewer video completion vs predicted audience risk"
            >
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="completion" name="Video Completion Rate" unit="%" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="risk" name="Audience Risk" unit="%" domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <ZAxis range={[50, 150]} />
                    <Tooltip contentStyle={{ background: "#020817", border: "1px solid #334155", borderRadius: 12 }} />
                    <Scatter data={riskRelationship} fill="#f43f5e" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-400 flex items-center gap-2">
                <Info className="h-4 w-4 text-sky-400 shrink-0" />
                <span>
                  Lower video completion rate is <strong className="text-slate-200">associated with</strong> higher predicted viewer risk. This serves as a <strong className="text-slate-200">potential signal</strong> for content optimization and is <strong className="text-slate-200">correlated with</strong> audience drop-off.
                </span>
              </div>
            </ChartCard>
          </div>
        </section>

        {/* 6. Sentiment, 7. Comments, 8. Top Topics */}
        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          {/* Topics & Sentiment */}
          <div className="space-y-6">
            {/* 8. Top Topics */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Sparkles className="h-4 w-4 text-sky-400" />
                <span>Top Topics</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-200"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </div>

            {/* 6. Sentiment */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <MessageSquareText className="h-4 w-4 text-emerald-400" />
                <span>Sentiment Analysis</span>
              </div>
              <div className="mt-4 space-y-2">
                {sentiments.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm">
                    <span className="capitalize font-medium text-slate-300">{item.name} Sentiment</span>
                    <span className="font-mono font-semibold text-white">{item.value} comments</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 7. Comments */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Viewer Feedback</div>
            <h2 className="mt-1 text-xl font-bold text-white">Recent Audience Comments</h2>
            <div className="mt-4 space-y-3">
              {comments.length ? (
                comments.map((comment) => (
                  <div key={comment.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                      <span>{comment.date}</span>
                      <span
                        className={`capitalize font-semibold ${
                          comment.sentiment === "positive"
                            ? "text-emerald-400"
                            : comment.sentiment === "negative"
                            ? "text-rose-400"
                            : "text-amber-400"
                        }`}
                      >
                        {comment.sentiment}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-200">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No comment records associated with this video.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, isRisk, icon: Icon }: { label: string; value: string; isRisk?: boolean; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-xs uppercase tracking-wider font-medium">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
      </div>
      <div className={`mt-2 text-xl font-bold font-mono ${isRisk ? "text-rose-300" : "text-white"}`}>{value}</div>
    </div>
  );
}
