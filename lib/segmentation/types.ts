import type { Viewer } from "@/lib/types";

export type SegmentKey =
  | "Loyal Viewers"
  | "Highly Engaged Viewers"
  | "Casual Viewers"
  | "New Viewers"
  | "At-Risk Viewers"
  | "Dormant Viewers"
  | "Content-Specific Viewers"
  | "High-Value Viewers";

export type ClusteringAlgorithmType =
  | "Rule-Based (Deterministic)"
  | "K-Means Clustering (Prepared)"
  | "DBSCAN (Prepared)"
  | "Hierarchical Clustering (Prepared)";

export interface SegmentSummary {
  key: SegmentKey;
  title: string;
  description: string;
  count: number;
  percentage: number;
  avgWatchTime: number; // minutes
  engagementRate: number; // %
  avgRetention: number; // %
  churnRisk: number; // %
  preferredContent: string;
  activityTrend: { period: string; activity: number }[];
  viewers: Viewer[];
}

export interface SegmentationModel {
  id: string;
  name: string;
  algorithmType: ClusteringAlgorithmType;
  classify(viewer: Viewer): SegmentKey;
}
