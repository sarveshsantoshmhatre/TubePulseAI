import type {
  DisengagementPredictionService,
  PredictionOptions,
  RiskLevel,
  RiskThresholds,
  Viewer,
  ViewerFeatureVector,
  ViewerPrediction,
} from "@/lib/types";

export const defaultRiskThresholds: RiskThresholds = {
  lowMax: 30,
  mediumMax: 60,
  highMax: 80,
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getInactivityDays = (lastActive: string, referenceDate: Date) => {
  const lastActiveTime = new Date(`${lastActive}T00:00:00Z`).getTime();
  return Math.max(0, Math.round((referenceDate.getTime() - lastActiveTime) / 86400000));
};

const getTrendMetric = (value: number, low: number, medium: number, high: number) => {
  if (value <= low) return -18;
  if (value <= medium) return -8;
  if (value <= high) return 2;
  return 8;
};

export function getRiskLevel(score: number, thresholds: RiskThresholds = defaultRiskThresholds): RiskLevel {
  if (score <= thresholds.lowMax) return "Low";
  if (score <= thresholds.mediumMax) return "Medium";
  if (score <= thresholds.highMax) return "High";
  return "Critical";
}

export function featureEngineerViewer(
  viewer: Viewer,
  referenceDate: Date = new Date("2026-09-30T00:00:00Z"),
): ViewerFeatureVector {
  const recencyDays = getInactivityDays(viewer.lastActive, referenceDate);

  const watchTimeChange = clamp(
    Math.round(
      getTrendMetric(viewer.watchTimeMinutes, 18, 42, 70) +
        (viewer.returnRate < 50 ? -7 : 3) +
        (viewer.watchFrequency <= 3 ? -9 : 2),
    ),
    -30,
    18,
  );

  const frequencyChange = clamp(
    Math.round(
      getTrendMetric(viewer.watchFrequency, 2, 5, 9) +
        (viewer.returnRate < 50 ? -8 : 2) +
        (viewer.totalSessions <= 6 ? -5 : 2),
    ),
    -28,
    16,
  );

  const engagementChange = clamp(
    Math.round(
      getTrendMetric(viewer.engagementRate, 3, 6, 10) +
        ((viewer.likes + viewer.comments + viewer.shares) <= 6 ? -5 : 2) +
        (viewer.returnRate < 50 ? -5 : 2),
    ),
    -26,
    14,
  );

  const retentionChange = clamp(
    Math.round((viewer.returnRate <= 45 ? -20 : viewer.returnRate <= 60 ? -10 : 2) + (viewer.watchFrequency <= 3 ? -5 : 2)),
    -24,
    12,
  );

  const historicalBehaviorChange = clamp(
    Math.round(
      (viewer.avgPercentageViewed <= 45 ? -12 : 2) +
        (viewer.watchTimeMinutes <= 40 ? -8 : 2) +
        (recencyDays >= 14 ? -10 : 2),
    ),
    -24,
    12,
  );

  return {
    recencyDays,
    inactivityDuration: recencyDays,
    viewingFrequency: viewer.watchFrequency,
    totalWatchTime: viewer.watchTimeMinutes,
    averageSessionDuration: viewer.avgViewDuration,
    averagePercentageViewed: viewer.avgPercentageViewed,
    returningViewerFrequency: viewer.returnRate,
    likes: viewer.likes,
    comments: viewer.comments,
    shares: viewer.shares,
    engagementRate: viewer.engagementRate,
    watchTimeChange,
    frequencyChange,
    engagementChange,
    retentionChange,
    historicalBehaviorChange,
    contentPreference: viewer.contentPreferences,
    sentiment: viewer.sentimentScore,
    intent: viewer.intent,
  };
}

function predictDisengagement(
  viewer: Viewer,
  options?: PredictionOptions,
): ViewerPrediction {
  const referenceDate = options?.referenceDate ?? new Date("2026-09-30T00:00:00Z");
  const thresholds = options?.thresholds ?? defaultRiskThresholds;
  const features = featureEngineerViewer(viewer, referenceDate);

  let score = 0;
  const contributingFactors = new Set<string>();

  if (features.recencyDays >= 14) {
    score += 18 + Math.min(features.recencyDays, 45) * 0.25;
    contributingFactors.add("Long inactivity");
  }

  if (features.viewingFrequency <= 3) {
    score += 16;
    contributingFactors.add("Viewing frequency declining");
  }

  if (features.totalWatchTime <= 35) {
    score += 14;
    contributingFactors.add("Watch time declining");
  }

  if (features.averageSessionDuration <= 12) {
    score += 8;
    contributingFactors.add("Shorter average sessions");
  }

  if (features.averagePercentageViewed <= 45) {
    score += 12;
    contributingFactors.add("Lower completion rate");
  }

  if (features.returningViewerFrequency <= 48) {
    score += 14;
    contributingFactors.add("Lower return rate");
  }

  if (features.engagementRate <= 5) {
    score += 12;
    contributingFactors.add("Lower engagement");
  }

  if (features.likes + features.comments + features.shares <= 6) {
    score += 9;
    contributingFactors.add("Reduced interaction volume");
  }

  if (features.watchTimeChange < 0) {
    score += Math.min(10, Math.abs(features.watchTimeChange) * 0.55);
    contributingFactors.add("Watch-time change trending down");
  }

  if (features.frequencyChange < 0) {
    score += Math.min(10, Math.abs(features.frequencyChange) * 0.65);
    contributingFactors.add("Frequency change trending down");
  }

  if (features.engagementChange < 0) {
    score += Math.min(10, Math.abs(features.engagementChange) * 0.55);
    contributingFactors.add("Engagement change trending down");
  }

  if (features.retentionChange < 0) {
    score += Math.min(12, Math.abs(features.retentionChange) * 0.6);
    contributingFactors.add("Retention change weakening");
  }

  if (features.historicalBehaviorChange < 0) {
    score += Math.min(10, Math.abs(features.historicalBehaviorChange) * 0.7);
    contributingFactors.add("Historical behavior deteriorating");
  }

  if (features.sentiment !== null && features.sentiment < 45) {
    score += 4;
    contributingFactors.add("Sentiment weakening");
  }

  if (features.contentPreference.length <= 1) {
    score += 3;
    contributingFactors.add("Content preference narrowing");
  }

  if (features.intent && (features.intent === "Comparing" || features.intent === "Benchmarking")) {
    score += 2;
    contributingFactors.add("Lower intent depth");
  }

  const churnProbability = clamp(Math.round(score), 0, 100);

  return {
    viewerId: viewer.id,
    churnProbability,
    riskLevel: getRiskLevel(churnProbability, thresholds),
    contributingFactors: Array.from(contributingFactors).slice(0, 5),
    featureVector: features,
  };
}

/**
 * Deterministic demo model. Behavioral activity accounts for nearly all score
 * weight; sentiment and intent are deliberately limited to small adjustments.
 * Replace this object with a trained-model adapter when one is available.
 */
export const deterministicDisengagementPredictionService: DisengagementPredictionService = {
  featureEngineer: featureEngineerViewer,
  predict: predictDisengagement,
};

export function calculateDisengagementPrediction(viewer: Viewer, options?: PredictionOptions): ViewerPrediction {
  return deterministicDisengagementPredictionService.predict(viewer, options);
}
