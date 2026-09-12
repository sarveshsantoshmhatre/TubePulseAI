export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type RiskThresholds = {
  lowMax: number;
  mediumMax: number;
  highMax: number;
};

/**
 * Contract for the demo predictor. A trained model can implement this same
 * interface later without requiring UI or data-layer changes.
 */
export type DisengagementPredictionService = {
  featureEngineer: (viewer: Viewer, referenceDate?: Date) => ViewerFeatureVector;
  predict: (viewer: Viewer, options?: PredictionOptions) => ViewerPrediction;
};

export type PredictionOptions = {
  referenceDate?: Date;
  thresholds?: RiskThresholds;
};

export type ViewerFeatureVector = {
  recencyDays: number;
  inactivityDuration: number;
  viewingFrequency: number;
  totalWatchTime: number;
  averageSessionDuration: number;
  averagePercentageViewed: number;
  returningViewerFrequency: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  watchTimeChange: number;
  frequencyChange: number;
  engagementChange: number;
  retentionChange: number;
  historicalBehaviorChange: number;
  contentPreference: string[];
  sentiment: number | null;
  intent: string | null;
};

export type ViewerPrediction = {
  viewerId: string;
  churnProbability: number;
  riskLevel: RiskLevel;
  contributingFactors: string[];
  featureVector: ViewerFeatureVector;
};

export type ViewerComment = {
  id: string;
  viewerId: string;
  videoId: string;
  text: string;
  date: string;
  sentiment: "positive" | "neutral" | "negative";
  emotion: string;
  intent: string;
  sentimentScore: number;
};

export type ViewerActivity = {
  id: string;
  viewerId: string;
  videoId: string;
  date: string;
  watchMinutes: number;
  completionRate: number;
  sessionType: "Organic" | "Search" | "Suggested" | "Playlist";
  engagementRate: number;
};

export type EngagementRecord = {
  id: string;
  viewerId: string;
  videoId: string;
  date: string;
  likes: number;
  comments: number;
  shares: number;
  avgPercentViewed: number;
};

export type Viewer = {
  id: string;
  riskScore: number;
  riskLevel: RiskLevel;
  watchTimeMinutes: number;
  watchFrequency: number;
  avgPercentageViewed: number;
  engagementRate: number;
  likes: number;
  comments: number;
  shares: number;
  returnRate: number;
  contentPreferences: string[];
  lastActive: string;
  sentimentScore: number;
  emotion: string;
  intent: string;
  riskFactors: string[];
  totalSessions: number;
  avgViewDuration: number;
};

export type Video = {
  id: string;
  title: string;
  category: string;
  publishedDate: string;
  avgWatchMinutes: number;
  retentionRate: number;
  totalViews: number;
  engagement: number;
  tags: string[];
};

export type RiskBucket = {
  name: string;
  value: number;
  fill: string;
};

export type PreferenceBucket = {
  category: string;
  viewers: number;
};
