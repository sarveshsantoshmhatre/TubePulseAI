/**
 * NLP Analytics Types & Modular Interface.
 * Designed to decouple NLP pipeline results from behavioral prediction features.
 * Integrates with synthetic datasets now, with contracts ready for
 * Hugging Face Transformers, BERT, DistilBERT, or Sentence Transformers.
 */

export type SentimentType = "positive" | "neutral" | "negative";

export type EmotionType =
  | "satisfaction"
  | "excitement"
  | "frustration"
  | "disappointment"
  | "confusion"
  | "curiosity";

export type IntentType =
  | "asking a question"
  | "requesting content"
  | "expressing dissatisfaction"
  | "expressing interest"
  | "seeking help"
  | "praising content"
  | "reporting an issue"
  | "suggesting improvement";

export type SemanticTopic =
  | "AI"
  | "programming"
  | "tutorials"
  | "difficulty"
  | "requests"
  | "explanations"
  | "performance";

export interface CommentNLPResult {
  commentId: string;
  viewerId: string;
  videoId: string;
  videoTitle: string;
  date: string;
  commentText: string;
  sentiment: SentimentType;
  sentimentScore: number;
  emotion: EmotionType;
  intent: IntentType;
  topics: SemanticTopic[];
  viewerRiskLevel: "Low" | "Medium" | "High" | "Critical";
  viewerRiskScore: number;
  isDisengagementSignal: boolean;
  disengagementReason?: string;
}

export interface SentimentDistribution {
  sentiment: SentimentType;
  count: number;
  percentage: number;
}

export interface EmotionDistribution {
  emotion: EmotionType;
  count: number;
  percentage: number;
}

export interface IntentDistribution {
  intent: IntentType;
  count: number;
  percentage: number;
}

export interface TopicNLPStats {
  topic: SemanticTopic;
  frequency: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  topVideo: string;
}

export interface SentimentTrendItem {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface VideoSentimentStats {
  videoId: string;
  title: string;
  totalComments: number;
  positive: number;
  neutral: number;
  negative: number;
}
