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
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Cpu,
  HeartHandshake,
  Info,
  MessageSquareText,
  Search,
  Sparkles,
  Smile,
  Frown,
} from "lucide-react";

import {
  getCommentNLPResults,
  getDisengagementSignalComments,
  getEmotionDistribution,
  getHighRiskSegmentSentiment,
  getIntentDistribution,
  getSentimentByVideo,
  getSentimentDistribution,
  getSentimentTrend,
  getTopicStats,
} from "@/lib/nlp";

const EMOTION_COLORS: Record<string, string> = {
  satisfaction: "#10b981",
  excitement: "#06b6d4",
  frustration: "#f43f5e",
  disappointment: "#f97316",
  confusion: "#eab308",
  curiosity: "#8b5cf6",
};

const INTENT_COLORS: Record<string, string> = {
  "asking a question": "#38bdf8",
  "requesting content": "#818cf8",
  "expressing dissatisfaction": "#f43f5e",
  "expressing interest": "#34d399",
  "seeking help": "#fbbf24",
  "praising content": "#22c55e",
  "reporting an issue": "#f97316",
  "suggesting improvement": "#a78bfa",
};

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className="mt-4 flex-1">{children}</div>
    </section>
  );
}

export function SentimentIntentAnalytics() {
  const [query, setQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [emotionFilter, setEmotionFilter] = useState("all");
  const [intentFilter, setIntentFilter] = useState("all");

  const commentsNLP = useMemo(() => getCommentNLPResults(), []);
  const sentimentDist = useMemo(() => getSentimentDistribution(), []);
  const sentimentTrend = useMemo(() => getSentimentTrend(), []);
  const sentimentVideo = useMemo(() => getSentimentByVideo(), []);
  const emotionDist = useMemo(() => getEmotionDistribution(), []);
  const intentDist = useMemo(() => getIntentDistribution(), []);
  const topicStats = useMemo(() => getTopicStats(), []);
  const highRiskSentiment = useMemo(() => getHighRiskSegmentSentiment(), []);
  const disengagementSignals = useMemo(() => getDisengagementSignalComments(), []);

  const filteredComments = commentsNLP.filter((comment) => {
    const matchesQuery =
      comment.commentText.toLowerCase().includes(query.toLowerCase()) ||
      comment.videoTitle.toLowerCase().includes(query.toLowerCase()) ||
      comment.viewerId.toLowerCase().includes(query.toLowerCase());
    const matchesSentiment = sentimentFilter === "all" || comment.sentiment === sentimentFilter;
    const matchesEmotion = emotionFilter === "all" || comment.emotion === emotionFilter;
    const matchesIntent = intentFilter === "all" || comment.intent === intentFilter;
    return matchesQuery && matchesSentiment && matchesEmotion && matchesIntent;
  });

  return (
    <main className="min-h-screen bg-[#020817] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] font-semibold text-sky-400">NLP Module · Step 9</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Sentiment & Intent Analysis</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-400 leading-relaxed">
              Extract natural language insights from viewer comments. Classify sentiment, detect subtle emotions and user intent, map semantic topic clusters, and spot potential disengagement signals.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
          >
            Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* NLP Architecture Decoupling Notice */}
        <section className="rounded-2xl border border-sky-500/20 bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Decoupled NLP Architecture</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  NLP results are stored independently from viewer risk scores. Plug-and-play architecture for <span className="text-sky-300 font-medium">Hugging Face Transformers</span>, <span className="text-sky-300 font-medium">BERT</span>, <span className="text-sky-300 font-medium">DistilBERT</span> & <span className="text-sky-300 font-medium">Sentence Transformers</span>.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 whitespace-nowrap">
              <Cpu className="h-3.5 w-3.5" />
              Synthetic NLP Engine Active
            </span>
          </div>
        </section>

        {/* Key Metrics Bar */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Overall Sentiment</span>
              <Smile className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-white font-mono">
              {sentimentDist.find((s) => s.sentiment === "positive")?.percentage}% Positive
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {sentimentDist.find((s) => s.sentiment === "negative")?.percentage}% Negative · {sentimentDist.find((s) => s.sentiment === "neutral")?.percentage}% Neutral
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Dominant Emotion</span>
              <Sparkles className="h-4 w-4 text-sky-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-white capitalize font-mono">
              {emotionDist[0]?.emotion}
            </div>
            <div className="mt-1 text-xs text-slate-400">{emotionDist[0]?.percentage}% of analyzed audience feedback</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>High-Risk Sentiment</span>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-rose-300 font-mono">
              {highRiskSentiment.negativePercentage}% Negative
            </div>
            <div className="mt-1 text-xs text-slate-400">Sentiment distribution among high-risk audience segments</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Disengagement Signals</span>
              <Frown className="h-4 w-4 text-rose-400" />
            </div>
            <div className="mt-3 text-2xl font-bold text-white font-mono">{disengagementSignals.length} Comments</div>
            <div className="mt-1 text-xs text-rose-300">Potential disengagement signals detected</div>
          </div>
        </section>

        {/* SENTIMENT SECTION */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-sky-400" />
            <h2 className="text-xl font-bold text-white">Sentiment Classification</h2>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {/* Sentiment Distribution */}
            <Card title="Sentiment Distribution" subtitle="Overall sentiment classification across dataset comments">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sentimentDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="sentiment" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#020817", border: "1px solid #334155", borderRadius: 12 }} />
                    <Bar dataKey="count" name="Comment Count" radius={[6, 6, 0, 0]}>
                      {sentimentDist.map((entry) => (
                        <Cell
                          key={entry.sentiment}
                          fill={entry.sentiment === "positive" ? "#22c55e" : entry.sentiment === "negative" ? "#f43f5e" : "#f59e0b"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Sentiment Trend Over Time */}
            <Card title="Sentiment Trend Over Time" subtitle="Daily trajectory of positive, neutral, and negative comments">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sentimentTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#020817", border: "1px solid #334155", borderRadius: 12 }} />
                    <Area type="monotone" dataKey="positive" name="Positive" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} strokeWidth={2} />
                    <Area type="monotone" dataKey="neutral" name="Neutral" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={2} />
                    <Area type="monotone" dataKey="negative" name="Negative" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Sentiment by Video & Sentiment by Topic */}
          <div className="grid gap-6 xl:grid-cols-2">
            {/* Sentiment by Video */}
            <Card title="Sentiment by Video" subtitle="Top video uploads with comment sentiment breakdown">
              <div className="h-64 overflow-y-auto pr-2">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400 sticky top-0 bg-slate-900 py-2">
                    <tr>
                      <th className="py-2">Video Title</th>
                      <th className="py-2 text-right">Positive</th>
                      <th className="py-2 text-right">Neutral</th>
                      <th className="py-2 text-right">Negative</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {sentimentVideo.slice(0, 6).map((item) => (
                      <tr key={item.videoId} className="text-slate-200">
                        <td className="py-2.5 max-w-[200px] truncate font-medium text-white">{item.title}</td>
                        <td className="py-2.5 text-right font-mono text-emerald-400 font-semibold">{item.positive}</td>
                        <td className="py-2.5 text-right font-mono text-amber-400">{item.neutral}</td>
                        <td className="py-2.5 text-right font-mono text-rose-400 font-semibold">{item.negative}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Sentiment Among High-Risk Audience Segments */}
            <Card title="Sentiment Among High-Risk Audience Segments" subtitle="Analyzing comments strictly from High and Critical risk viewers">
              <div className="flex flex-col justify-between h-full space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                    <div className="text-xs text-slate-400">Positive</div>
                    <div className="mt-1 text-lg font-bold text-emerald-400 font-mono">{highRiskSentiment.positive}</div>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-center">
                    <div className="text-xs text-slate-400">Neutral</div>
                    <div className="mt-1 text-lg font-bold text-amber-400 font-mono">{highRiskSentiment.neutral}</div>
                  </div>
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-center">
                    <div className="text-xs text-slate-400">Negative</div>
                    <div className="mt-1 text-lg font-bold text-rose-400 font-mono">{highRiskSentiment.negative}</div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300">
                  <p className="leading-relaxed">
                    High-risk viewers express <strong className="text-rose-300">{highRiskSentiment.negativePercentage}% negative sentiment</strong> in their comments, primarily highlighting pacing issues and unresolved setup difficulties.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* EMOTION & INTENT SECTION */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Emotion & Intent Detection</h2>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {/* Emotion Distribution */}
            <Card title="Emotion Distribution" subtitle="Granular classification: satisfaction, excitement, frustration, disappointment, confusion, curiosity">
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={emotionDist} dataKey="count" nameKey="emotion" innerRadius={50} outerRadius={85} paddingAngle={4}>
                      {emotionDist.map((entry) => (
                        <Cell key={entry.emotion} fill={EMOTION_COLORS[entry.emotion] || "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#020817", border: "1px solid #334155", borderRadius: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Intent Detection */}
            <Card title="Viewer Intent Detection" subtitle="Classifying comment intent (asking questions, seeking help, expressing dissatisfaction, etc.)">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={intentDist} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                    <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="intent" stroke="#94a3b8" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip contentStyle={{ background: "#020817", border: "1px solid #334155", borderRadius: 12 }} />
                    <Bar dataKey="count" name="Frequency" radius={[0, 4, 4, 0]}>
                      {intentDist.map((entry) => (
                        <Cell key={entry.intent} fill={INTENT_COLORS[entry.intent] || "#38bdf8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </section>

        {/* SEMANTIC TOPICS SECTION */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Semantic Topics</h2>
          </div>

          <Card title="Top Topic Frequency & Sentiment Breakdown" subtitle="Identifying common topics (AI, programming, tutorials, difficulty, requests, explanations, performance)">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="topic" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#020817", border: "1px solid #334155", borderRadius: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="positiveCount" name="Positive" fill="#22c55e" stackId="a" />
                  <Bar dataKey="neutralCount" name="Neutral" fill="#f59e0b" stackId="a" />
                  <Bar dataKey="negativeCount" name="Negative" fill="#f43f5e" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        {/* POTENTIAL DISENGAGEMENT SIGNALS SECTION */}
        <section className="rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-950/30 to-slate-950 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-rose-400">Signal Detection Engine</div>
              <h2 className="text-xl font-bold text-white">Potential Disengagement Signals</h2>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs text-rose-300">
              <Info className="h-3.5 w-3.5" />
              Non-Presumptive Telemetry Labeling
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Comments in this view contain potential disengagement signals such as frustration, dissatisfaction, repeated unresolved questions, requests for missing content, or confusion.
          </p>

          <div className="grid gap-3">
            {disengagementSignals.map((item) => (
              <div key={item.commentId} className="rounded-xl border border-rose-500/20 bg-slate-900/90 p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-rose-300">{item.disengagementReason}</span>
                  <span className="text-slate-400">{item.date} · Viewer: <strong className="text-slate-200">{item.viewerId}</strong> ({item.viewerRiskLevel} Risk)</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">"{item.commentText}"</p>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-slate-300 capitalize">Emotion: {item.emotion}</span>
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-slate-300 capitalize">Intent: {item.intent}</span>
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-slate-300">Video: {item.videoTitle}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* NLP COMMENT EXPLORER TABLE */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400">NLP Comment Explorer</div>
              <h2 className="text-2xl font-bold text-white">Full Comment NLP Records</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search comment or video..."
                  className="rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
                />
              </label>
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
              <select
                value={emotionFilter}
                onChange={(e) => setEmotionFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
              >
                <option value="all">All Emotions</option>
                <option value="satisfaction">Satisfaction</option>
                <option value="excitement">Excitement</option>
                <option value="frustration">Frustration</option>
                <option value="disappointment">Disappointment</option>
                <option value="confusion">Confusion</option>
                <option value="curiosity">Curiosity</option>
              </select>
              <select
                value={intentFilter}
                onChange={(e) => setIntentFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none"
              >
                <option value="all">All Intents</option>
                <option value="asking a question">Asking a Question</option>
                <option value="requesting content">Requesting Content</option>
                <option value="expressing dissatisfaction">Expressing Dissatisfaction</option>
                <option value="expressing interest">Expressing Interest</option>
                <option value="seeking help">Seeking Help</option>
                <option value="praising content">Praising Content</option>
                <option value="reporting an issue">Reporting an Issue</option>
                <option value="suggesting improvement">Suggesting Improvement</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Comment Text</th>
                  <th className="py-3 px-4 font-semibold">Video</th>
                  <th className="py-3 px-4 font-semibold">Sentiment</th>
                  <th className="py-3 px-4 font-semibold">Emotion</th>
                  <th className="py-3 px-4 font-semibold">Intent</th>
                  <th className="py-3 px-4 font-semibold">Topics</th>
                  <th className="py-3 px-4 font-semibold">Viewer Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {filteredComments.map((comment) => (
                  <tr key={comment.commentId} className="transition hover:bg-slate-800/40 text-slate-200">
                    <td className="max-w-md py-3.5 px-4 font-medium text-white leading-relaxed">
                      "{comment.commentText}"
                      <span className="block text-[11px] text-slate-500 mt-1">{comment.date} · ID: {comment.commentId}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300 max-w-xs truncate">{comment.videoTitle}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`capitalize font-semibold text-xs ${
                          comment.sentiment === "positive"
                            ? "text-emerald-400"
                            : comment.sentiment === "negative"
                            ? "text-rose-400"
                            : "text-amber-400"
                        }`}
                      >
                        {comment.sentiment}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs capitalize text-slate-300">{comment.emotion}</td>
                    <td className="py-3.5 px-4 text-xs capitalize text-slate-300">{comment.intent}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {comment.topics.map((t) => (
                          <span key={t} className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] text-sky-300">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span
                        className={`font-semibold ${
                          comment.viewerRiskLevel === "Critical" || comment.viewerRiskLevel === "High"
                            ? "text-rose-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {comment.viewerRiskLevel} ({comment.viewerRiskScore}%)
                      </span>
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
