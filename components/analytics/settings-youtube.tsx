"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { PRIVACY_COMPLIANCE_RULES, type OperatingMode } from "@/lib/youtube/types";

type ChannelConnection = {
  id: string;
  channel_name: string;
  channel_handle: string | null;
  youtube_channel_id: string | null;
  connected: boolean;
  subscriber_count: number;
  video_count: number;
  total_views: number;
  created_at: string;
};

export function SettingsYouTubeAnalytics() {
  const { user } = useAuth();
  const [mode, setMode] = useState<OperatingMode>("demo");
  const [channels, setChannels] = useState<ChannelConnection[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelHandle, setNewChannelHandle] = useState("");
  const [savingChannel, setSavingChannel] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedMode = localStorage.getItem("tubepulse_mode");
    if (savedMode === "connected" || savedMode === "demo") {
      setMode(savedMode as OperatingMode);
    }
  }, []);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    setLoadingChannels(true);
    const { data, error: queryError } = await supabase
      .from("channel_connections")
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
    } else {
      setChannels(data as ChannelConnection[]);
    }
    setLoadingChannels(false);
  };

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    setSavingChannel(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("channel_connections")
      .insert({
        channel_name: newChannelName.trim(),
        channel_handle: newChannelHandle.trim() || null,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
    } else {
      setChannels([data as ChannelConnection, ...channels]);
      setNewChannelName("");
      setNewChannelHandle("");
      setShowAddForm(false);
      setSaveStatus("Channel added successfully.");
      setTimeout(() => setSaveStatus(null), 4000);
    }
    setSavingChannel(false);
  };

  const handleDeleteChannel = async (id: string) => {
    const { error: deleteError } = await supabase
      .from("channel_connections")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setChannels(channels.filter((c) => c.id !== id));
    }
  };

  const telemetry = useMemo(() => {
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
      returningViewerMetricStatus: "Aggregated Channel Estimate" as const,
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#020817] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] font-semibold text-rose-400">System Integration</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Settings & YouTube Integration</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-400 leading-relaxed">
              Manage your channel connections and configure integration settings for YouTube Data API v3 & YouTube Analytics API.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
          >
            Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {saveStatus && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{saveStatus}</span>
          </div>
        )}

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
                  localStorage.setItem("tubepulse_mode", "demo");
                  window.dispatchEvent(new Event("tubepulse_mode_changed"));
                }}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  mode === "demo" ? "bg-sky-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Demo Mode
              </button>
              <button
                onClick={() => {
                  setMode("connected");
                  localStorage.setItem("tubepulse_mode", "connected");
                  window.dispatchEvent(new Event("tubepulse_mode_changed"));
                }}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  mode === "connected" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Radio className="h-3.5 w-3.5" />
                Connected Mode
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

        {/* Channel Connections */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Video className="h-5 w-5 text-sky-400" />
              Your Channel Connections
            </h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-400"
            >
              <Plus className="h-4 w-4" />
              Add Channel
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddChannel} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Channel Name</label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  required
                  placeholder="e.g. Creator Growth Lab"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">YouTube Handle (optional)</label>
                <input
                  type="text"
                  value={newChannelHandle}
                  onChange={(e) => setNewChannelHandle(e.target.value)}
                  placeholder="@yourchannel"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={savingChannel}
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
                >
                  {savingChannel ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {savingChannel ? "Saving..." : "Save Channel"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loadingChannels ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            </div>
          ) : channels.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center">
              <Video className="mx-auto h-8 w-8 text-slate-600" />
              <p className="mt-3 text-sm text-slate-400">No channels connected yet. Add your first YouTube channel to start tracking analytics.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {channels.map((channel) => (
                <div key={channel.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{channel.channel_name}</h3>
                      {channel.channel_handle && (
                        <p className="text-xs text-slate-400">{channel.channel_handle}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteChannel(channel.id)}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {channel.connected ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" /> Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
                        <AlertCircle className="h-3 w-3" /> Not Connected
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-slate-500">Subscribers</div>
                      <div className="font-semibold text-white">{channel.subscriber_count.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Videos</div>
                      <div className="font-semibold text-white">{channel.video_count}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Views</div>
                      <div className="font-semibold text-white">{channel.total_views.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* API Configuration */}
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-400" />
              API Configuration Status
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                <span className="text-slate-300 font-medium">YouTube Data API v3 Key:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                  <AlertCircle className="h-4 w-4" /> Not Configured
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                <span className="text-slate-300 font-medium">OAuth 2.0 Authentication:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                  <AlertCircle className="h-4 w-4" /> Ready for OAuth Login
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3.5">
                <span className="text-slate-300 font-medium">YouTube Analytics API Scope:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                  <AlertCircle className="h-4 w-4" /> Scope Pending
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

          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="h-5 w-5 text-sky-400" />
                Environment API Secrets
              </h2>
              <span className="text-[11px] text-slate-500 font-mono">Server-Side Only</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              API credentials are configured securely through environment variables on the server. They are never exposed in browser code.
            </p>
          </section>
        </div>

        {/* Channel Telemetry Panel */}
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
                <Sparkles className="h-4 w-4 text-sky-400" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-sky-300">{telemetry.avgRetentionPercentage}%</div>
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

        {/* Privacy Compliance */}
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
