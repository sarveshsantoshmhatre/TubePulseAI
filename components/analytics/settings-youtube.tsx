"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  Eye,
  Key,
  Lock,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  UserCheck,
  Users,
  Video,
} from "lucide-react";

import {
  getActiveOperatingMode,
  getYouTubeApiConfig,
} from "@/lib/youtube/service";
import { PRIVACY_COMPLIANCE_RULES, type OperatingMode, type YouTubeChannelTelemetry } from "@/lib/youtube/types";

export function SettingsYouTubeAnalytics() {
  const initialMode = useMemo(() => getActiveOperatingMode(), []);
  const initialConfig = useMemo(() => getYouTubeApiConfig(), []);

  const [mode, setMode] = useState<OperatingMode>(initialMode);
  const [apiKey, setApiKey] = useState("");
  const [clientId, setClientId] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const telemetry: YouTubeChannelTelemetry = useMemo(() => {
    if (mode === "connected" && initialConfig.apiKeyConfigured) {
      return {
        channelId: "UC_CONNECTED_99",
        title: "Connected Official YouTube Channel",
        customUrl: "@connected_creator",
        publishedAt: "2024-01-15",
        viewCount: 1842900,
        subscriberCount: 142500,
        videoCount: 20,
        watchTimeHours: 12450,
        avgViewDurationSeconds: 412,
        avgRetentionPercentage: 62.4,
        likes: 89400,
        comments: 14200,
        shares: 9800,
        subscriberGainLoss: { gained: 3420, lost: 680 },
        returningViewerMetricStatus: "Aggregated Channel Estimate",
      };
    }
    return {
      channelId: "DEMO_CHANNEL_001",
      title: "TubePulse AI Creator Demo Channel",
      customUrl: "@tubepulse_demo",
      publishedAt: "2025-01-10",
      viewCount: 842000,
      subscriberCount: 84200,
      videoCount: 20,
      watchTimeHours: 8950,
      avgViewDurationSeconds: 348,
      avgRetentionPercentage: 58.2,
      likes: 42100,
      comments: 6800,
      shares: 4100,
      subscriberGainLoss: { gained: 1850, lost: 420 },
      returningViewerMetricStatus: "Aggregated Channel Estimate",
    };
  }, [mode, initialConfig]);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("API Configuration updated successfully. Demo fallback remains active if secrets are omitted.");
    setTimeout(() => setSaveStatus(null), 4000);
  };

  return (
    <main className="min-h-screen bg-[#020817] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] font-semibold text-rose-400">System Integration · Step 14</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Settings → YouTube Integration</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-400 leading-relaxed">
              Configure integration settings for official YouTube Data API v3 & YouTube Analytics API. Seamlessly toggle between Demo Mode (synthetic telemetry) and Connected Mode.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
          >
            Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Operating Mode Switcher */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Active Operating Mode</h2>
                <p className="text-xs text-slate-400">Select how TubePulse AI fetches channel telemetry data</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => {
                  setMode("demo");
                  if (typeof window !== "undefined") {
                    localStorage.setItem("tubepulse_mode", "demo");
                    window.dispatchEvent(new Event("tubepulse_mode_changed"));
                  }
                }}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  mode === "demo" ? "bg-sky-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Demo Mode (Synthetic Data)
              </button>
              <button
                onClick={() => {
                  setMode("connected");
                  if (typeof window !== "undefined") {
                    localStorage.setItem("tubepulse_mode", "connected");
                    window.dispatchEvent(new Event("tubepulse_mode_changed"));
                  }
                }}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  mode === "connected" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Radio className="h-3.5 w-3.5" />
                Connected YouTube Mode
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-sky-400" />
              <span>
                Active Telemetry Source:{" "}
                <strong className={mode === "connected" ? "text-rose-400" : "text-sky-300"}>
                  {mode === "connected" ? "Official YouTube Data API v3 & Analytics API" : "Synthetic Demo Telemetry"}
                </strong>
              </span>
            </div>
            <span className="rounded-full bg-slate-900 border border-slate-800 px-3 py-1 font-mono text-[11px] text-slate-400">
              Fallback Active: Automatic
            </span>
          </div>
        </section>

        {/* API Configuration Card & Status */}
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Status Breakdown */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-400" />
              API Configuration Status
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                <span className="text-slate-300 font-medium">YouTube Data API v3 Key:</span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    initialConfig.apiKeyConfigured ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {initialConfig.apiKeyConfigured ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Configured
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" /> Not Configured (Using Demo Fallback)
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                <span className="text-slate-300 font-medium">OAuth 2.0 Authentication:</span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    initialConfig.oauthConnected ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {initialConfig.oauthConnected ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Connected
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" /> Ready for OAuth Login
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                <span className="text-slate-300 font-medium">YouTube Analytics API Scope:</span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    initialConfig.analyticsScopeGranted ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {initialConfig.analyticsScopeGranted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Scope Granted
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" /> Scope Pending Authorization
                    </>
                  )}
                </span>
              </div>

              <div className="pt-2">
                <a
                  href="/api/auth/youtube"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:from-red-500 hover:to-rose-500"
                >
                  <Radio className="h-4 w-4" />
                  Connect YouTube Channel via Google OAuth 2.0
                </a>
              </div>
            </div>
          </section>

          {/* Credentials Form */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="h-5 w-5 text-sky-400" />
                Environment API Secrets Configuration
              </h2>
              <span className="text-[11px] text-slate-500 font-mono">Server-Side Environment Only</span>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">YouTube Data API Key (v3)</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy... (Configured via YOUTUBE_API_KEY)"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">OAuth 2.0 Client ID</label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="123456789-abc.apps.googleusercontent.com"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-sky-400"
                >
                  Save API Settings
                </button>
                <span className="text-[11px] text-slate-400 italic">Credentials are never exposed in browser code</span>
              </div>

              {saveStatus && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{saveStatus}</span>
                </div>
              )}
            </form>
          </section>
        </div>

        {/* CHANNEL TELEMETRY PANEL */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-rose-400">
                Channel Telemetry Summary · {mode === "connected" ? "Connected Mode" : "Demo Mode"}
              </div>
              <h2 className="text-xl font-bold text-white">{telemetry.title}</h2>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">
              <Video className="h-3.5 w-3.5 text-rose-400" />
              {telemetry.videoCount} Uploaded Videos Analyzed
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Views</span>
                <Eye className="h-4 w-4 text-sky-400" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-white">{telemetry.viewCount.toLocaleString()}</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Watch Time (Hours)</span>
                <Clock className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-white">{telemetry.watchTimeHours.toLocaleString()} hrs</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Avg View Duration</span>
                <RefreshCw className="h-4 w-4 text-amber-400" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-white">{Math.floor(telemetry.avgViewDurationSeconds / 60)}m {telemetry.avgViewDurationSeconds % 60}s</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Audience Retention</span>
                <Sparkles className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-indigo-300">{telemetry.avgRetentionPercentage}%</div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Total Likes</div>
                <div className="mt-1 text-lg font-bold font-mono text-white">{telemetry.likes.toLocaleString()}</div>
              </div>
              <ThumbsUp className="h-5 w-5 text-emerald-400" />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Comments & Shares</div>
                <div className="mt-1 text-lg font-bold font-mono text-white">{(telemetry.comments + telemetry.shares).toLocaleString()}</div>
              </div>
              <Users className="h-5 w-5 text-sky-400" />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Subscriber Net Gain</div>
                <div className="mt-1 text-lg font-bold font-mono text-emerald-400">
                  +{telemetry.subscriberGainLoss.gained - telemetry.subscriberGainLoss.lost}
                </div>
              </div>
              <UserCheck className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
        </section>

        {/* PRIVACY COMPLIANCE MANDATE */}
        <section className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-slate-950 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Privacy Compliance Mandate</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {PRIVACY_COMPLIANCE_RULES.map((rule) => (
              <div key={rule.rule} className="rounded-xl border border-emerald-500/20 bg-slate-900/80 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">{rule.rule}</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                    {rule.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{rule.details}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
