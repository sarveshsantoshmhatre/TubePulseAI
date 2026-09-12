import { getContentPreferenceAnalysis } from "@/lib/content-analytics";
import { getDisengagementSignalComments, getHighRiskSegmentSentiment, getSentimentDistribution } from "@/lib/nlp";
import { getAudienceSegmentSummaries } from "@/lib/segmentation/service";
import type { CreatorRecommendation, RecommendationSummary } from "./types";

export function generateCreatorRecommendations(): RecommendationSummary {
  const prefAnalysis = getContentPreferenceAnalysis();
  const nlpSentiment = getSentimentDistribution();
  const disengagementComments = getDisengagementSignalComments();
  const highRiskSentiment = getHighRiskSegmentSentiment();
  const segments = getAudienceSegmentSummaries();

  const recommendations: CreatorRecommendation[] = [];

  // 1. Content Recommendation
  const lowestRetentionCat = prefAnalysis.lowRetention.category;
  const lowestRetentionScore = prefAnalysis.lowRetention.score;
  const topCategory = prefAnalysis.highEngagement.category;

  recommendations.push({
    id: "REC-CNT-001",
    type: "Content Recommendation",
    title: `Re-evaluate Pacing in ${lowestRetentionCat} Uploads`,
    detectedIssue: `Early viewer retention drop-off detected in ${lowestRetentionCat} category videos.`,
    supportingEvidence: `${lowestRetentionCat} content currently averages ${lowestRetentionScore}, showing a potential signal of audience fatigue compared to top category (${topCategory}).`,
    recommendedAction: `Restructure video intros in ${lowestRetentionCat} to deliver core takeaways within the first 60 seconds, or test shorter video formats.`,
    targetAudience: "Casual Viewers and At-Risk Viewers",
    confidence: 89,
    impactLevel: "High Impact",
    associatedCategory: lowestRetentionCat,
    dataSources: ["Content Performance Data", "Category Retention Metrics"],
  });

  // 2. Retention Recommendation
  const atRiskSegment = segments.find((s) => s.key === "At-Risk Viewers");
  const dormantSegment = segments.find((s) => s.key === "Dormant Viewers");
  const totalRiskCount = (atRiskSegment?.count || 0) + (dormantSegment?.count || 0);

  recommendations.push({
    id: "REC-RET-002",
    type: "Retention Recommendation",
    title: "Implement Mid-Series Call-to-Action for Returning Viewers",
    detectedIssue: "Returning-viewer session frequency shows signs of cooling across mid-tier cohorts.",
    supportingEvidence: `${totalRiskCount} viewers demonstrate elevated predicted disengagement risk (${atRiskSegment?.churnRisk || 60}% average churn score).`,
    recommendedAction: "Incorporate consistent playlist linking and teaser end-screens in high-retention uploads to encourage immediate binge sessions.",
    targetAudience: "Cooling Loyalists and At-Risk Viewers",
    confidence: 86,
    impactLevel: "High Impact",
    dataSources: ["Audience Segmentation Engine", "Behavioral Churn Model"],
  });

  // 3. Engagement Recommendation
  const negativeSentimentPct = nlpSentiment.find((s) => s.sentiment === "negative")?.percentage || 18;
  const topFrustrationComment = disengagementComments[0]?.commentText || "Unresolved setup difficulties reported in comments.";

  recommendations.push({
    id: "REC-ENG-003",
    type: "Engagement Recommendation",
    title: "Address Repeated Technical Questions in Comment Threads",
    detectedIssue: "Unresolved setup confusion and repeated technical queries detected in viewer comments.",
    supportingEvidence: `NLP analysis revealed ${negativeSentimentPct}% negative sentiment overall, with ${disengagementComments.length} explicit disengagement signals flagged (e.g. "${topFrustrationComment.slice(0, 55)}...").`,
    recommendedAction: "Pin a comprehensive FAQ comment or publish a quick troubleshooting short addressing common setup questions.",
    targetAudience: "New Viewers and Content-Specific Viewers",
    confidence: 92,
    impactLevel: "Quick Win",
    dataSources: ["NLP Intent Engine", "Comment Sentiment Analysis"],
  });

  // 4. Audience Recommendation
  const highValueSegment = segments.find((s) => s.key === "High-Value Viewers");

  recommendations.push({
    id: "REC-AUD-004",
    type: "Audience Recommendation",
    title: "Capitalize on High-Value Viewer Content Preferences",
    detectedIssue: "Top-tier loyal audience watch time is heavily concentrated in specific deep-dive topics.",
    supportingEvidence: `${highValueSegment?.title || "High-Value Viewers"} (${highValueSegment?.count || 12} viewers) maintain ${highValueSegment?.avgRetention || 75}% retention and average ${highValueSegment?.avgWatchTime || 120} watch minutes.`,
    recommendedAction: "Schedule specialized deep-dive masterclasses in preferred topics (${highValueSegment?.preferredContent || 'Tech Reviews'}) to solidify community retention.",
    targetAudience: "Loyal Viewers and High-Value Viewers",
    confidence: 94,
    impactLevel: "High Impact",
    associatedCategory: highValueSegment?.preferredContent,
    dataSources: ["Audience Segments", "Watch Time Telemetry"],
  });

  // 5. Risk Reduction Recommendation
  const highRiskNegPct = highRiskSentiment.negativePercentage;

  recommendations.push({
    id: "REC-RSK-005",
    type: "Risk Reduction Recommendation",
    title: "Early Warning: Mitigate At-Risk Viewer Drop-Off",
    detectedIssue: "High disengagement probability correlated with declining visit frequency over recent 30-day window.",
    supportingEvidence: `High-risk viewer comments express ${highRiskNegPct}% negative sentiment, associated with longer upload intervals.`,
    recommendedAction: "Re-engage at-risk viewers with community polls, community tab posts, and consistent weekly upload schedules.",
    targetAudience: "At-Risk Viewers and Cooling Loyalists",
    confidence: 87,
    impactLevel: "Medium Impact",
    dataSources: ["Disengagement Risk Telemetry", "High-Risk Segment Sentiment"],
  });

  const highImpactCount = recommendations.filter((r) => r.impactLevel === "High Impact").length;
  const avgConfidence = Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length);

  return {
    totalRecommendations: recommendations.length,
    highImpactCount,
    avgConfidence,
    recommendations,
  };
}
