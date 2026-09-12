import { calculateDisengagementPrediction } from "@/lib/prediction";
import type {
  EngagementRecord,
  PreferenceBucket,
  RiskBucket,
  Video,
  Viewer,
  ViewerActivity,
  ViewerComment,
} from "@/lib/types";

const categories = [
  "Gaming",
  "Tech Reviews",
  "Tutorials",
  "Vlogs",
  "Music",
  "Education",
  "Productivity",
  "Comedy",
  "Fitness",
  "Travel",
  "Documentary",
];

const emotions = ["Curious", "Confident", "Frustrated", "Excited", "Neutral", "Skeptical"];
const intents = ["Learning", "Exploring", "Comparing", "Reviewing", "Benchmarking", "Engaging"];
const videoTitles = [
  "Build a Creator Workflow That Actually Lasts",
  "How Top Channels Keep Viewers Watching Longer",
  "The 7 Habits of High-Retention Shorts",
  "Fixing Drop-Off in Long-Form Content",
  "Creator Analytics That Matter More Than Views",
  "A Smarter Way to Test YouTube Thumbnails",
  "Why Best-Selling topics fade after 6 weeks",
  "Partnering with Brands Without Losing Trust",
  "Making Data Actionable for Small Channels",
  "What a 3% Lift in Retention Can Do",
  "The Psychology Behind Repeat Viewership",
  "From Search Traffic to Loyal Return Audiences",
  "How to Spot Rising Churn Before It hits",
  "Can Short-Form Content Build a Long-Term Brand?",
  "Build a YouTube Strategy Around Viewer Signals",
  "Why New Views Often Drift Away Fast",
  "Audience Segmentation for Better Discovery",
  "Fewer uploads, better retention",
  "The metrics behind expert content retention",
  "What high-LTV viewers look like in practice",
];

export const videos: Video[] = videoTitles.map((title, index) => ({
  id: `VID-${(index + 1).toString().padStart(4, "0")}`,
  title,
  category: categories[index % categories.length],
  publishedDate: `2025-0${(index % 9) + 1}-1${(index % 7) + 1}`,
  avgWatchMinutes: 4 + (index % 10) * 2.4,
  retentionRate: 42 + (index % 13) * 3.1,
  totalViews: 42000 + index * 1800,
  engagement: 7 + (index % 9) * 0.8,
  tags: [categories[index % categories.length], "growth", "analytics", "audience"],
}));

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export const viewers: Viewer[] = Array.from({ length: 100 }, (_, index) => {
  const id = `VIEW-${(1001 + index).toString()}`;
  const watchTimeMinutes = clamp(18 + (index % 19) * 11 + (index % 5) * 17, 16, 180);
  const watchFrequency = clamp(2 + (index % 12) * 0.7 + (index % 4) * 1.2, 1, 16);
  const avgPercentageViewed = clamp(42 + (index % 11) * 4.6 + ((index * 7) % 20), 22, 94);
  const engagementRate = clamp(1.2 + ((index * 3) % 15) + (index % 5) * 1.8, 0.9, 21.8);
  const likes = clamp(Math.round(4 + index * 0.42 + (index % 9) * 2), 0, 80);
  const comments = clamp(Math.round(1 + index * 0.18 + (index % 6) * 1.6), 0, 42);
  const shares = clamp(Math.round(0.5 + (index * 0.09) % 6), 0, 12);
  const returnRate = clamp(36 + (index % 17) * 3.6 + (index % 4) * 6, 22, 96);
  const categoryBias = categories[index % categories.length];
  const secondaryBias = categories[(index + 3) % categories.length];
  const contentPreferences = [categoryBias, secondaryBias, categories[(index + 8) % categories.length]];
  const sentimentScore = clamp(52 + ((index * 17) % 38) - ((index % 12) * 2.5), 18, 95);
  const emotion = emotions[index % emotions.length];
  const intent = intents[index % intents.length];
  const totalSessions = clamp(Math.round(5 + (index % 18) * 0.9), 3, 35);
  const avgViewDuration = clamp(Math.round(watchTimeMinutes / Math.max(watchFrequency, 1)), 8, 58);
  const viewer: Viewer = {
    id,
    // These are populated exclusively by the shared prediction service below.
    riskScore: 0,
    riskLevel: "Low",
    watchTimeMinutes,
    watchFrequency,
    avgPercentageViewed,
    engagementRate,
    likes,
    comments,
    shares,
    returnRate,
    contentPreferences,
    lastActive: `2026-09-${String(4 + (index % 25)).padStart(2, "0")}`,
    sentimentScore,
    emotion,
    intent,
    riskFactors: [],
    totalSessions,
    avgViewDuration,
  };

  const prediction = calculateDisengagementPrediction(viewer);

  return {
    ...viewer,
    riskScore: prediction.churnProbability,
    riskLevel: prediction.riskLevel,
    riskFactors: prediction.contributingFactors,
  };
});

export const viewerActivity: ViewerActivity[] = viewers.flatMap((viewer, viewerIndex) => {
  const sessionTypes = ["Organic", "Search", "Suggested", "Playlist"] as const;

  return Array.from({ length: 8 }, (_, activityIndex) => {
    const video = videos[(viewerIndex + activityIndex) % videos.length];
    const date = new Date("2026-08-05T00:00:00Z");
    date.setDate(date.getDate() + viewerIndex * 2 + activityIndex * 3);

    return {
      id: `ACT-${viewer.id}-${activityIndex}`,
      viewerId: viewer.id,
      videoId: video.id,
      date: date.toISOString().slice(0, 10),
      watchMinutes: clamp(Math.round(viewer.watchTimeMinutes / 4 + activityIndex * 2.3), 4, 52),
      completionRate: clamp(Math.round(viewer.avgPercentageViewed - 5 + activityIndex), 18, 95),
      sessionType: sessionTypes[activityIndex % 4],
      engagementRate: clamp(Number((viewer.engagementRate * (0.45 + (activityIndex % 5) * 0.18)).toFixed(1)), 0.8, 21),
    };
  });
});

export const engagementRecords: EngagementRecord[] = viewers.flatMap((viewer, viewerIndex) =>
  Array.from({ length: 6 }, (_, recordIndex) => {
    const video = videos[(viewerIndex + recordIndex * 2) % videos.length];
    const date = new Date("2026-08-07T00:00:00Z");
    date.setDate(date.getDate() + viewerIndex + recordIndex * 2);

    return {
      id: `ENG-${viewer.id}-${recordIndex}`,
      viewerId: viewer.id,
      videoId: video.id,
      date: date.toISOString().slice(0, 10),
      likes: clamp(Math.round(viewer.likes / 3 + recordIndex), 0, 38),
      comments: clamp(Math.round(viewer.comments / 2 + (recordIndex % 3)), 0, 25),
      shares: clamp(Math.round(viewer.shares / 2 + (recordIndex % 4)), 0, 8),
      avgPercentViewed: clamp(Math.round(viewer.avgPercentageViewed - recordIndex * 2), 18, 96),
    };
  }),
);

export const commentRecords: ViewerComment[] = viewers.flatMap((viewer, viewerIndex) =>
  Array.from({ length: 2 }, (_, commentIndex) => {
    const video = videos[(viewerIndex + commentIndex + 1) % videos.length];
    const date = new Date("2026-08-15T00:00:00Z");
    date.setDate(date.getDate() + viewerIndex + commentIndex * 4);

    const commentText = [
      "Love the breakdown here — it actually made the strategy clearer.",
      "This feels useful but I still want a better explanation of the retention curve.",
      "The content is thoughtful, but I expected a bit more practical examples.",
      "Very actionable guidance; this would help my channel a lot.",
      "I’m curious about how this applies to new channels with lower volume.",
      "This is relevant, but the pacing could be tighter for a shorter video.",
    ][(viewerIndex + commentIndex) % 6];

    return {
      id: `COM-${viewer.id}-${commentIndex}`,
      viewerId: viewer.id,
      videoId: video.id,
      text: commentText,
      date: date.toISOString().slice(0, 10),
      sentiment: viewer.riskScore > 55 ? "negative" : viewer.riskScore > 35 ? "neutral" : "positive",
      emotion: emotions[(viewerIndex + commentIndex) % emotions.length],
      intent: intents[(viewerIndex + commentIndex) % intents.length],
      sentimentScore: clamp(Math.round(viewer.sentimentScore - commentIndex * 12), 10, 97),
    };
  }),
);

export const audienceActivityTrend = [
  { period: "Jan", active: 6200, watchTime: 18.4, engagement: 5.8 },
  { period: "Feb", active: 6800, watchTime: 19.1, engagement: 6.1 },
  { period: "Mar", active: 7050, watchTime: 19.6, engagement: 6.4 },
  { period: "Apr", active: 7420, watchTime: 20.2, engagement: 6.7 },
  { period: "May", active: 7680, watchTime: 21.4, engagement: 7.1 },
  { period: "Jun", active: 7915, watchTime: 22.8, engagement: 7.4 },
  { period: "Jul", active: 7840, watchTime: 21.9, engagement: 7.2 },
  { period: "Aug", active: 7630, watchTime: 20.7, engagement: 6.9 },
];

export const watchTimeTrend = [
  { period: "Jan", value: 18.2 },
  { period: "Feb", value: 19.0 },
  { period: "Mar", value: 20.1 },
  { period: "Apr", value: 21.2 },
  { period: "May", value: 22.5 },
  { period: "Jun", value: 23.8 },
  { period: "Jul", value: 22.9 },
  { period: "Aug", value: 21.7 },
];

export const engagementTrend = [
  { period: "Jan", value: 5.8 },
  { period: "Feb", value: 6.1 },
  { period: "Mar", value: 6.4 },
  { period: "Apr", value: 6.8 },
  { period: "May", value: 7.4 },
  { period: "Jun", value: 7.8 },
  { period: "Jul", value: 7.2 },
  { period: "Aug", value: 7.0 },
];

export const returningViewerTrend = [
  { period: "Jan", value: 42 },
  { period: "Feb", value: 45 },
  { period: "Mar", value: 47 },
  { period: "Apr", value: 49 },
  { period: "May", value: 53 },
  { period: "Jun", value: 57 },
  { period: "Jul", value: 54 },
  { period: "Aug", value: 51 },
];

export const retentionVsChurn = [
  { period: "Jan", retention: 78, churn: 16 },
  { period: "Feb", retention: 76, churn: 18 },
  { period: "Mar", retention: 74, churn: 20 },
  { period: "Apr", retention: 71, churn: 22 },
  { period: "May", retention: 69, churn: 24 },
  { period: "Jun", retention: 67, churn: 26 },
  { period: "Jul", retention: 66, churn: 27 },
  { period: "Aug", retention: 63, churn: 29 },
];

export const retentionTrend = [
  { month: "Apr", value: 78 },
  { month: "May", value: 76 },
  { month: "Jun", value: 74 },
  { month: "Jul", value: 71 },
  { month: "Aug", value: 69 },
  { month: "Sep", value: 66 },
  { month: "Oct", value: 63 },
];

export const riskDistribution: RiskBucket[] = [
  { name: "Low", fill: "#22c55e" },
  { name: "Medium", fill: "#f59e0b" },
  { name: "High", fill: "#f97316" },
  { name: "Critical", fill: "#ef4444" },
].map((bucket) => ({
  ...bucket,
  value: Math.round((viewers.filter((viewer) => viewer.riskLevel === bucket.name).length / viewers.length) * 100),
}));

export const contentPreferenceData: PreferenceBucket[] = [
  { category: "Gaming", viewers: 24 },
  { category: "Tech Reviews", viewers: 18 },
  { category: "Tutorials", viewers: 16 },
  { category: "Vlogs", viewers: 15 },
  { category: "Music", viewers: 13 },
  { category: "Education", viewers: 11 },
  { category: "Productivity", viewers: 9 },
];

export const churnScoreSignals = viewers
  .slice()
  .sort((a, b) => b.riskScore - a.riskScore)
  .slice(0, 8)
  .map((viewer) => ({
    ...viewer,
    riskLabel: viewer.riskLevel,
  }));

export const viewerById = new Map(viewers.map((viewer) => [viewer.id, viewer]));

/** Shared prediction lookup for profile and future server/API consumers. */
export const viewerPredictions = viewers.map((viewer) => calculateDisengagementPrediction(viewer));
export const viewerPredictionById = new Map(viewerPredictions.map((prediction) => [prediction.viewerId, prediction]));
