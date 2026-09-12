/**
 * TubePulse AI - YouTube API & Analytics Integration Types
 * Step 14: Official YouTube Integration Architecture
 */

export type OperatingMode = "demo" | "connected";

export interface YouTubeApiConfig {
  apiKeyConfigured: boolean;
  oauthConnected: boolean;
  analyticsScopeGranted: boolean;
  channelId?: string;
  channelTitle?: string;
  subscriberCount?: number;
  videoCount?: number;
}

export interface YouTubeChannelTelemetry {
  channelId: string;
  title: string;
  customUrl?: string;
  publishedAt: string;
  viewCount: number;
  subscriberCount: number;
  videoCount: number;
  watchTimeHours: number;
  avgViewDurationSeconds: number;
  avgRetentionPercentage: number;
  likes: number;
  comments: number;
  shares: number;
  subscriberGainLoss: { gained: number; lost: number };
  returningViewerMetricStatus: "Aggregated Channel Estimate" | "Not Exposed by API";
}

export interface PrivacyComplianceNotice {
  rule: string;
  status: "Enforced";
  details: string;
}

export const PRIVACY_COMPLIANCE_RULES: PrivacyComplianceNotice[] = [
  {
    rule: "No Private Viewer Identity Access",
    status: "Enforced",
    details: "TubePulse AI never requests or accesses private individual Google or YouTube viewer identities.",
  },
  {
    rule: "Strict Anonymization",
    status: "Enforced",
    details: "All viewer-level disengagement predictions operate exclusively on anonymized telemetry and aggregated channel data.",
  },
  {
    rule: "Channel-Level Scope Only",
    status: "Enforced",
    details: "YouTube Data API and Analytics API tokens request channel-level read-only analytics permissions.",
  },
];
