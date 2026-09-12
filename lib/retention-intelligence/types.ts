export type RecommendationType =
  | "Content Recommendation"
  | "Retention Recommendation"
  | "Engagement Recommendation"
  | "Audience Recommendation"
  | "Risk Reduction Recommendation";

export type ImpactLevel = "High Impact" | "Medium Impact" | "Quick Win";

export interface CreatorRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  detectedIssue: string;
  supportingEvidence: string;
  recommendedAction: string;
  targetAudience: string;
  confidence: number; // Percentage (e.g. 88)
  impactLevel: ImpactLevel;
  associatedCategory?: string;
  dataSources: string[];
}

export interface RecommendationSummary {
  totalRecommendations: number;
  highImpactCount: number;
  avgConfidence: number;
  recommendations: CreatorRecommendation[];
}
