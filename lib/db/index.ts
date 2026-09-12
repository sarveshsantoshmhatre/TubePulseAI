import { getRepository } from "./repository";

export * from "./repository";

export function getDatabaseStatus() {
  const repo = getRepository();
  const isConnected = repo.isDatabaseConnected();
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

  return {
    provider: isConnected ? "PostgreSQL / Supabase" : "Synthetic Demo Telemetry",
    isConnected,
    isDemoMode,
    entities: [
      "channels",
      "videos",
      "viewers",
      "viewer_activity",
      "viewer_video_activity",
      "comments",
      "sentiment_results",
      "emotion_results",
      "intent_results",
      "predictions",
      "audience_segments",
      "segment_memberships",
    ],
  };
}
