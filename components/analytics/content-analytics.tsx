"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { ArrowRight, Flame, Info, Search, ShieldAlert, ShieldCheck, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

import {
  getCategoryPerformance,
  getContentPerformance,
  getContentPreferenceAnalysis,
  getTopicPerformance,
} from "@/lib/content-analytics";

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export function ContentAnalytics() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const performances = useMemo(() => getContentPerformance(), []);
  const categories = useMemo(() => getCategoryPerformance(), []);
  const topics = useMemo(() => getTopicPerformance(), []);
  const preference = useMemo(() => getContentPreferenceAnalysis(), []);

  const visibleVideos = performances.filter(
    (video) => (category === "all" || video.category === category) && video.title.toLowerCase().includes(query.toLowerCase())
  );

  const channelRisk = Math.round(performances.reduce((sum, video) => sum + video.audienceRisk, 0) / performances.length);

  return (
    <main className="min-h-screen bg-[#020817] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] font-semibold text-sky-400">Content Intelligence · Step 8</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Content Analytics</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-400 leading-relaxed">
              Analyze how individual videos affect audience behavior. Identify content preferences, category retention, and engagement signals across your channel portfolio.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
          >
            Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Content Preference Analysis Cards */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sky-400" />
            <h2 className="text-xl font-bold text-white">Content Preference Overview</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* High Engagement */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition hover:border-emerald-500/40">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="text-xs uppercase tracking-wider font-medium">High Engagement</span>
                <Flame className="h-4 w-4" />
              </div>
              <div className="mt-3 text-lg font-bold text-white">{preference.highEngagement.category}</div>
              <div className="mt-1 text-xs text-emerald-300 font-medium">{preference.highEngagement.score}</div>
              <div className="mt-2 text-[11px] text-slate-400">Top topic: <span className="text-slate-200">{preference.highEngagement.topTopic}</span></div>
            </div>

            {/* High Retention */}
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 transition hover:border-sky-500/40">
              <div className="flex items-center justify-between text-sky-400">
                <span className="text-xs uppercase tracking-wider font-medium">High Retention</span>
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="mt-3 text-lg font-bold text-white">{preference.highRetention.category}</div>
              <div className="mt-1 text-xs text-sky-300 font-medium">{preference.highRetention.score}</div>
              <div className="mt-2 text-[11px] text-slate-400">Top topic: <span className="text-slate-200">{preference.highRetention.topTopic}</span></div>
            </div>

            {/* Low Retention */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 transition hover:border-amber-500/40">
              <div className="flex items-center justify-between text-amber-400">
                <span className="text-xs uppercase tracking-wider font-medium">Low Retention</span>
                <TrendingDown className="h-4 w-4" />
              </div>
              <div className="mt-3 text-lg font-bold text-white">{preference.lowRetention.category}</div>
              <div className="mt-1 text-xs text-amber-300 font-medium">{preference.lowRetention.score}</div>
              <div className="mt-2 text-[11px] text-slate-400">Lowest topic: <span className="text-slate-200">{preference.lowRetention.lowestTopic}</span></div>
            </div>

            {/* High Churn Risk */}
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 transition hover:border-rose-500/40">
              <div className="flex items-center justify-between text-rose-400">
                <span className="text-xs uppercase tracking-wider font-medium">High Churn Risk</span>
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="mt-3 text-lg font-bold text-white">{preference.highChurnRisk.category}</div>
              <div className="mt-1 text-xs text-rose-300 font-medium">{preference.highChurnRisk.score}</div>
              <div className="mt-2 text-[11px] text-slate-400">{preference.highChurnRisk.associatedSignal}</div>
            </div>

            {/* Low Churn Risk */}
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 transition hover:border-indigo-500/40">
              <div className="flex items-center justify-between text-indigo-400">
                <span className="text-xs uppercase tracking-wider font-medium">Low Churn Risk</span>
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="mt-3 text-lg font-bold text-white">{preference.lowChurnRisk.category}</div>
              <div className="mt-1 text-xs text-indigo-300 font-medium">{preference.lowChurnRisk.score}</div>
              <div className="mt-2 text-[11px] text-slate-400">{preference.lowChurnRisk.associatedSignal}</div>
            </div>
          </div>
        </section>

        {/* Content-Category Performance Charts */}
        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Content-Category Performance"
            subtitle="Comparing engagement rate, retention %, and predicted audience risk across content categories"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="category" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#020817", border: "1px solid #334155", borderRadius: 12 }} />
                  <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                  <Bar dataKey="engagement" name="Engagement Rate (%)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="retention" name="Retention (%)" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="risk" name="Predicted Audience Risk (%)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Topic Preference Matrix"
            subtitle="Evaluating engagement and retention across specific video topics"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="topic" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#020817", border: "1px solid #334155", borderRadius: 12 }} />
                  <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                  <Bar dataKey="engagement" name="Engagement Rate (%)" fill="#34d399" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="retention" name="Retention (%)" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        {/* Content Impact on Audience */}
        <section className="rounded-2xl border border-sky-900/40 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-sky-400">Statistical Correlation & Disengagement Signals</div>
              <h2 className="text-xl font-bold text-white">Content Impact on Audience</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs text-sky-300">
              <Info className="h-3.5 w-3.5" />
              Non-Causal Analytical Correlation
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="retention" name="Video Retention Rate" unit="%" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="risk" name="Predicted Audience Risk Impact" unit="%" domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <ZAxis range={[100, 300]} />
                  <Tooltip
                    contentStyle={{ background: "#020817", border: "1px solid #334155", borderRadius: 12 }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value?: any, name?: any) => [`${value ?? 0}%`, String(name ?? "Value")]}
                  />
                  <Scatter
                    name="Videos"
                    data={performances.map((video) => ({
                      title: video.title,
                      retention: video.retention,
                      risk: video.audienceRisk,
                      engagement: video.engagementRate,
                    }))}
                    fill="#a78bfa"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Analytical Methodology Note</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Data in this section highlights patterns <strong className="text-sky-300">correlated with</strong> viewer retention drop-off and early exit behavior.
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                  <span className="font-medium text-amber-400">Associated with:</span> Videos with retention &lt;45% show a strong potential signal for elevated viewer churn risk.
                </div>
                <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                  <span className="font-medium text-emerald-400">Correlated with:</span> High engagement rate (&gt;25%) is correlated with lower overall channel audience risk.
                </div>
              </div>

              <div className="text-[11px] italic text-slate-500">
                Note: TubePulse AI models statistical relationships and potential disengagement signals. It does not claim direct single-cause attribution.
              </div>
            </div>
          </div>
        </section>

        {/* Video Table */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400">Video Table</div>
              <h2 className="mt-1 text-2xl font-bold text-white">Individual Video Analytics</h2>
              <p className="text-xs text-slate-400 mt-1">Detailed performance metrics and audience risk impact for each video upload.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search video title..."
                  className="rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
                />
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
              >
                <option value="all">All categories</option>
                {categories.map((item) => (
                  <option key={item.category} value={item.category}>
                    {item.category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Video Title</th>
                  <th className="py-3 px-4 font-semibold">Publish Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Views</th>
                  <th className="py-3 px-4 font-semibold text-right">Watch Time</th>
                  <th className="py-3 px-4 font-semibold text-right">Average Percentage Viewed</th>
                  <th className="py-3 px-4 font-semibold text-right">Likes</th>
                  <th className="py-3 px-4 font-semibold text-right">Comments</th>
                  <th className="py-3 px-4 font-semibold text-right">Shares</th>
                  <th className="py-3 px-4 font-semibold text-right">Returning Viewers</th>
                  <th className="py-3 px-4 font-semibold text-right">Engagement Rate</th>
                  <th className="py-3 px-4 font-semibold text-right">Retention</th>
                  <th className="py-3 px-4 font-semibold text-right">Predicted Audience Risk Impact</th>
                  <th className="py-3 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {visibleVideos.map((video) => (
                  <tr key={video.id} className="transition hover:bg-slate-800/40 text-slate-200">
                    <td className="max-w-xs py-3.5 px-4 font-medium text-white">
                      <Link href={`/content-analytics/${video.id}`} className="hover:text-sky-400 hover:underline line-clamp-2">
                        {video.title}
                      </Link>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{video.category}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">{video.publishDate}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-200">{formatNumber(video.views)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-200">{formatNumber(video.watchTime)} min</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-200">{video.percentageViewed}%</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-200">{formatNumber(video.likes)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-200">{formatNumber(video.comments)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-200">{formatNumber(video.shares)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-200">{formatNumber(video.returningViewers)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-sky-300 font-semibold">{video.engagementRate}%</td>
                    <td className="py-3.5 px-4 text-right font-mono text-indigo-300 font-semibold">{video.retention}%</td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          video.audienceRisk >= channelRisk
                            ? "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                            : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {video.audienceRisk}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/content-analytics/${video.id}`}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-sky-300 transition hover:border-sky-500 hover:text-white"
                      >
                        Detail <ArrowRight className="h-3 w-3" />
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
