"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Database,
  Filter,
  Info,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { generateCreatorRecommendations } from "@/lib/retention-intelligence/service";
import type { RecommendationType } from "@/lib/retention-intelligence/types";

const TYPE_ICONS: Record<RecommendationType, React.ComponentType<{ className?: string }>> = {
  "Content Recommendation": Lightbulb,
  "Retention Recommendation": TrendingUp,
  "Engagement Recommendation": Zap,
  "Audience Recommendation": Users,
  "Risk Reduction Recommendation": ShieldAlert,
};

const TYPE_COLORS: Record<RecommendationType, { border: string; text: string; bg: string }> = {
  "Content Recommendation": { border: "border-sky-500/30", text: "text-sky-400", bg: "bg-sky-500/10" },
  "Retention Recommendation": { border: "border-indigo-500/30", text: "text-indigo-400", bg: "bg-indigo-500/10" },
  "Engagement Recommendation": { border: "border-emerald-500/30", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  "Audience Recommendation": { border: "border-amber-500/30", text: "text-amber-400", bg: "bg-amber-500/10" },
  "Risk Reduction Recommendation": { border: "border-rose-500/30", text: "text-rose-400", bg: "bg-rose-500/10" },
};

export function RetentionIntelligenceAnalytics() {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedImpact, setSelectedImpact] = useState<string>("all");

  const summary = useMemo(() => generateCreatorRecommendations(), []);

  const filteredRecommendations = useMemo(() => {
    return summary.recommendations.filter((rec) => {
      const matchesType = selectedType === "all" || rec.type === selectedType;
      const matchesImpact = selectedImpact === "all" || rec.impactLevel === selectedImpact;
      return matchesType && matchesImpact;
    });
  }, [summary, selectedType, selectedImpact]);

  return (
    <main className="min-h-screen bg-[#020817] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] font-semibold text-sky-400">Intelligence Engine · Step 11</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Retention Intelligence</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-400 leading-relaxed">
              Synthesizing disengagement risk, content analytics, viewer behavior, sentiment, intent, and segment profiles into evidence-backed strategic recommendations for YouTube creators.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
          >
            Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Methodology Banner */}
        <section className="rounded-2xl border border-sky-900/40 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Non-Causal Recommendation Engine</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Recommendations analyze underlying channel data correlations. They provide strategic suggestions but do not guarantee retention gains.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="rounded-full bg-slate-800 px-3 py-1 border border-slate-700 font-mono">
                {summary.totalRecommendations} Recommendations Generated
              </span>
              <span className="rounded-full bg-emerald-500/10 text-emerald-300 px-3 py-1 border border-emerald-500/30 font-mono">
                {summary.avgConfidence}% Avg Confidence
              </span>
            </div>
          </div>
        </section>

        {/* Filter Controls */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mr-2">
              <Filter className="h-3.5 w-3.5" /> Recommendation Type:
            </span>
            {[
              "all",
              "Content Recommendation",
              "Retention Recommendation",
              "Engagement Recommendation",
              "Audience Recommendation",
              "Risk Reduction Recommendation",
            ].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  selectedType === type
                    ? "bg-sky-500 text-white shadow-sm"
                    : "bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800"
                }`}
              >
                {type === "all" ? "All Types" : type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedImpact}
              onChange={(e) => setSelectedImpact(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
            >
              <option value="all">All Impact Levels</option>
              <option value="High Impact">High Impact</option>
              <option value="Quick Win">Quick Win</option>
              <option value="Medium Impact">Medium Impact</option>
            </select>
          </div>
        </section>

        {/* RECOMMENDATION CARDS LIST */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Active Recommendations ({filteredRecommendations.length})</h2>
            <span className="text-xs text-slate-400">Derived from 6 channel telemetry sources</span>
          </div>

          <div className="grid gap-6">
            {filteredRecommendations.map((rec) => {
              const Icon = TYPE_ICONS[rec.type] || Lightbulb;
              const color = TYPE_COLORS[rec.type] || { border: "border-slate-700", text: "text-slate-200", bg: "bg-slate-800" };

              return (
                <div
                  key={rec.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm space-y-5 transition hover:border-slate-700"
                >
                  {/* Recommendation Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color.bg} ${color.text} border ${color.border}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                          <span className={color.text}>{rec.type}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400 font-mono">ID: {rec.id}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mt-0.5">{rec.title}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          rec.impactLevel === "High Impact"
                            ? "bg-sky-500/10 text-sky-300 border border-sky-500/30"
                            : rec.impactLevel === "Quick Win"
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {rec.impactLevel}
                      </span>
                      <span className="rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-mono text-slate-200">
                        {rec.confidence}% Confidence
                      </span>
                    </div>
                  </div>

                  {/* 4 Required Structural Sections */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Detected Issue */}
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400">
                        <AlertCircle className="h-4 w-4" /> Detected Issue
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">{rec.detectedIssue}</p>
                    </div>

                    {/* Supporting Evidence */}
                    <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
                        <Info className="h-4 w-4" /> Supporting Evidence
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">{rec.supportingEvidence}</p>
                    </div>

                    {/* Recommended Action */}
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1.5 md:col-span-2">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" /> Recommended Action
                      </div>
                      <p className="text-sm text-slate-100 leading-relaxed font-semibold">{rec.recommendedAction}</p>
                    </div>
                  </div>

                  {/* Footer Meta Details & Action */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>Target Audience: <strong className="text-slate-200">{rec.targetAudience}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Database className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span>Data Sources: {rec.dataSources.map((ds) => (
                        <span key={ds} className="inline-block rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 mr-1 ml-1">
                          {ds}
                        </span>
                      ))}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const btn = document.getElementById(`rec-btn-${rec.id}`);
                        if (btn) {
                          btn.innerText = "✓ Action Executed";
                          btn.className = "rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition";
                        }
                      }}
                      id={`rec-btn-${rec.id}`}
                      className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition"
                    >
                      Execute Strategy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
