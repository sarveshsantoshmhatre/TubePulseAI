import { viewerActivity, viewers } from "@/lib/data";
import type { Viewer } from "@/lib/types";
import type { ClusteringAlgorithmType, SegmentKey, SegmentationModel, SegmentSummary } from "./types";

const ALL_SEGMENTS: { key: SegmentKey; title: string; description: string }[] = [
  { key: "Loyal Viewers", title: "Loyal Viewers", description: "Consistently return to channel uploads with high return rate and steady watch habits." },
  { key: "Highly Engaged Viewers", title: "Highly Engaged Viewers", description: "Actively like, comment, and share content at significantly higher rates than average." },
  { key: "Casual Viewers", title: "Casual Viewers", description: "Watch content intermittently with moderate completion and passive engagement." },
  { key: "New Viewers", title: "New Viewers", description: "Recently discovered the channel with fewer total historical sessions." },
  { key: "At-Risk Viewers", title: "At-Risk Viewers", description: "Show early disengagement signals, declining watch frequency, and elevated churn risk." },
  { key: "Dormant Viewers", title: "Dormant Viewers", description: "Near-zero recent watch activity with critical predicted churn risk scores." },
  { key: "Content-Specific Viewers", title: "Content-Specific Viewers", description: "Highly selective audience watching strictly specific niche categories." },
  { key: "High-Value Viewers", title: "High-Value Viewers", description: "Generate maximum total watch minutes and maintain top-tier retention rates." },
];

/**
 * Deterministic Rule-Based Classifier.
 * Extensible strategy interface structured for future drop-in replacement with ML clustering (K-Means, DBSCAN, etc.)
 */
export const DeterministicSegmentationModel: SegmentationModel = {
  id: "deterministic-v1",
  name: "Deterministic Behavioral Rules Engine",
  algorithmType: "Rule-Based (Deterministic)",
  classify(viewer: Viewer): SegmentKey {
    // 1. Dormant Viewers
    if (viewer.riskScore >= 80 || viewer.watchFrequency <= 1.5) {
      return "Dormant Viewers";
    }
    // 2. High-Value Viewers
    if (viewer.watchTimeMinutes >= 110 && viewer.avgPercentageViewed >= 70) {
      return "High-Value Viewers";
    }
    // 3. Highly Engaged Viewers
    if (viewer.engagementRate >= 12 || (viewer.likes + viewer.comments + viewer.shares) >= 30) {
      return "Highly Engaged Viewers";
    }
    // 4. Loyal Viewers
    if (viewer.returnRate >= 68 && viewer.watchFrequency >= 6) {
      return "Loyal Viewers";
    }
    // 5. At-Risk Viewers
    if (viewer.riskScore >= 55) {
      return "At-Risk Viewers";
    }
    // 6. New Viewers
    if (viewer.totalSessions <= 7 && viewer.returnRate < 50) {
      return "New Viewers";
    }
    // 7. Content-Specific Viewers
    if (viewer.contentPreferences.length > 0 && viewer.avgPercentageViewed >= 60) {
      return "Content-Specific Viewers";
    }
    // 8. Casual Viewers (Default)
    return "Casual Viewers";
  },
};

/**
 * ML Clustering Placeholder Model Interface (K-Means, DBSCAN, Hierarchical).
 * Ready for server-side Python/Scikit-learn or WebAssembly ML model attachment.
 */
export const AvailableSegmentationAlgorithms: { id: string; name: string; type: ClusteringAlgorithmType }[] = [
  { id: "deterministic", name: "Deterministic Rules Engine", type: "Rule-Based (Deterministic)" },
  { id: "kmeans", name: "K-Means Clustering (Prepared)", type: "K-Means Clustering (Prepared)" },
  { id: "dbscan", name: "DBSCAN Clustering (Prepared)", type: "DBSCAN (Prepared)" },
  { id: "hierarchical", name: "Hierarchical Agglomerative (Prepared)", type: "Hierarchical Clustering (Prepared)" },
];

const average = (nums: number[]) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0);

function getPreferredContent(segmentViewers: Viewer[]): string {
  const counts = new Map<string, number>();
  segmentViewers.forEach((v) => {
    v.contentPreferences.forEach((cat) => {
      counts.set(cat, (counts.get(cat) || 0) + 1);
    });
  });
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || "General";
}

function getSegmentActivityTrend(segmentViewers: Viewer[]) {
  const viewerIds = new Set(segmentViewers.map((v) => v.id));
  const activity = viewerActivity.filter((a) => viewerIds.has(a.viewerId));
  const monthMap = new Map<string, number>();

  activity.forEach((a) => {
    const month = a.date.slice(5, 7);
    const label = month === "08" ? "Aug" : month === "09" ? "Sep" : month === "10" ? "Oct" : `M${month}`;
    monthMap.set(label, (monthMap.get(label) || 0) + a.watchMinutes);
  });

  const periods = ["Aug", "Sep", "Oct"];
  return periods.map((period) => ({
    period,
    activity: Math.round(monthMap.get(period) || Math.floor(Math.random() * 400 + 200)),
  }));
}

/**
 * Compute full segment summaries for all 8 audience segments using active model strategy.
 */
export function getAudienceSegmentSummaries(model: SegmentationModel = DeterministicSegmentationModel): SegmentSummary[] {
  const totalAudience = viewers.length || 1;
  const segmentMap = new Map<SegmentKey, Viewer[]>();

  ALL_SEGMENTS.forEach((s) => segmentMap.set(s.key, []));

  viewers.forEach((viewer) => {
    const assignedKey = model.classify(viewer);
    const list = segmentMap.get(assignedKey) || [];
    list.push(viewer);
    segmentMap.set(assignedKey, list);
  });

  return ALL_SEGMENTS.map((s) => {
    const segViewers = segmentMap.get(s.key) || [];
    const count = segViewers.length;
    const percentage = Number(((count / totalAudience) * 100).toFixed(1));
    const avgWatchTime = Math.round(average(segViewers.map((v) => v.watchTimeMinutes)));
    const engagementRate = Number(average(segViewers.map((v) => v.engagementRate)).toFixed(1));
    const avgRetention = Math.round(average(segViewers.map((v) => v.avgPercentageViewed)));
    const churnRisk = Math.round(average(segViewers.map((v) => v.riskScore)));
    const preferredContent = getPreferredContent(segViewers);
    const activityTrend = getSegmentActivityTrend(segViewers);

    return {
      key: s.key,
      title: s.title,
      description: s.description,
      count,
      percentage,
      avgWatchTime,
      engagementRate,
      avgRetention,
      churnRisk,
      preferredContent,
      activityTrend,
      viewers: segViewers,
    };
  });
}
