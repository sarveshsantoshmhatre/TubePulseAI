import { commentRecords, viewerById, videos } from "@/lib/data";
import type {
  CommentNLPResult,
  EmotionDistribution,
  EmotionType,
  IntentDistribution,
  IntentType,
  SemanticTopic,
  SentimentDistribution,
  SentimentTrendItem,
  SentimentType,
  TopicNLPStats,
  VideoSentimentStats,
} from "./types";

const ALL_EMOTIONS: EmotionType[] = [
  "satisfaction",
  "excitement",
  "frustration",
  "disappointment",
  "confusion",
  "curiosity",
];

const ALL_INTENTS: IntentType[] = [
  "asking a question",
  "requesting content",
  "expressing dissatisfaction",
  "expressing interest",
  "seeking help",
  "praising content",
  "reporting an issue",
  "suggesting improvement",
];

const ALL_TOPICS: SemanticTopic[] = [
  "AI",
  "programming",
  "tutorials",
  "difficulty",
  "requests",
  "explanations",
  "performance",
];

// Rich NLP comments corpus for synthetic dataset analysis
const SYNTHETIC_COMMENTS = [
  {
    text: "Can you explain how to set up the BERT transformer model for retention prediction?",
    emotion: "curiosity" as EmotionType,
    intent: "asking a question" as IntentType,
    topics: ["AI", "tutorials", "explanations"] as SemanticTopic[],
    sentiment: "neutral" as SentimentType,
  },
  {
    text: "I am really confused by the pacing in the middle of this video tutorial.",
    emotion: "confusion" as EmotionType,
    intent: "expressing dissatisfaction" as IntentType,
    topics: ["tutorials", "difficulty"] as SemanticTopic[],
    sentiment: "negative" as SentimentType,
  },
  {
    text: "This explanation is brilliant! Saved me hours of programming debugging.",
    emotion: "satisfaction" as EmotionType,
    intent: "praising content" as IntentType,
    topics: ["programming", "explanations"] as SemanticTopic[],
    sentiment: "positive" as SentimentType,
  },
  {
    text: "Please make a follow-up video on high-performance model quantization.",
    emotion: "excitement" as EmotionType,
    intent: "requesting content" as IntentType,
    topics: ["AI", "performance", "requests"] as SemanticTopic[],
    sentiment: "positive" as SentimentType,
  },
  {
    text: "The audio quality was disappointing and I couldn't follow the code steps.",
    emotion: "disappointment" as EmotionType,
    intent: "reporting an issue" as IntentType,
    topics: ["programming", "difficulty"] as SemanticTopic[],
    sentiment: "negative" as SentimentType,
  },
  {
    text: "Having a lot of frustration trying to replicate this workflow on my local setup.",
    emotion: "frustration" as EmotionType,
    intent: "seeking help" as IntentType,
    topics: ["programming", "difficulty", "performance"] as SemanticTopic[],
    sentiment: "negative" as SentimentType,
  },
  {
    text: "It would be great if you added chapters for the tutorial code breakdown.",
    emotion: "satisfaction" as EmotionType,
    intent: "suggesting improvement" as IntentType,
    topics: ["tutorials", "programming"] as SemanticTopic[],
    sentiment: "positive" as SentimentType,
  },
  {
    text: "I still have repeated unresolved questions about the retention math.",
    emotion: "confusion" as EmotionType,
    intent: "asking a question" as IntentType,
    topics: ["explanations", "difficulty"] as SemanticTopic[],
    sentiment: "negative" as SentimentType,
  },
];

/**
 * Generate modular NLP results for all comment records.
 * Completely decoupled from the behavioral risk engine.
 */
export function getCommentNLPResults(): CommentNLPResult[] {
  return commentRecords.map((record, index) => {
    const synthetic = SYNTHETIC_COMMENTS[index % SYNTHETIC_COMMENTS.length];
    const viewer = viewerById.get(record.viewerId);
    const video = videos.find((v) => v.id === record.videoId);

    const sentimentScore = record.sentimentScore;
    const sentiment: SentimentType =
      sentimentScore > 65 ? "positive" : sentimentScore > 40 ? "neutral" : "negative";

    const isDisengagementSignal =
      synthetic.emotion === "frustration" ||
      synthetic.emotion === "disappointment" ||
      synthetic.emotion === "confusion" ||
      synthetic.intent === "expressing dissatisfaction" ||
      sentiment === "negative";

    let disengagementReason = undefined;
    if (isDisengagementSignal) {
      if (synthetic.emotion === "frustration") disengagementReason = "Frustration signal detected in viewer feedback";
      else if (synthetic.emotion === "disappointment") disengagementReason = "Dissatisfaction signal detected regarding content depth";
      else if (synthetic.emotion === "confusion") disengagementReason = "Repeated unresolved questions or confusion signal";
      else disengagementReason = "Potential disengagement signal detected";
    }

    return {
      commentId: record.id,
      viewerId: record.viewerId,
      videoId: record.videoId,
      videoTitle: video?.title || "Unknown Video",
      date: record.date,
      commentText: record.text || synthetic.text,
      sentiment,
      sentimentScore,
      emotion: synthetic.emotion,
      intent: synthetic.intent,
      topics: synthetic.topics,
      viewerRiskLevel: viewer?.riskLevel || "Low",
      viewerRiskScore: viewer?.riskScore || 20,
      isDisengagementSignal,
      disengagementReason,
    };
  });
}

/** Overall Sentiment Distribution */
export function getSentimentDistribution(): SentimentDistribution[] {
  const nlpResults = getCommentNLPResults();
  const total = nlpResults.length || 1;

  const counts: Record<SentimentType, number> = { positive: 0, neutral: 0, negative: 0 };
  nlpResults.forEach((r) => counts[r.sentiment]++);

  return (["positive", "neutral", "negative"] as SentimentType[]).map((sentiment) => ({
    sentiment,
    count: counts[sentiment],
    percentage: Math.round((counts[sentiment] / total) * 100),
  }));
}

/** Sentiment Trend Over Time */
export function getSentimentTrend(): SentimentTrendItem[] {
  const nlpResults = getCommentNLPResults();
  const dateMap = new Map<string, { positive: number; neutral: number; negative: number }>();

  nlpResults.forEach((r) => {
    const item = dateMap.get(r.date) || { positive: 0, neutral: 0, negative: 0 };
    item[r.sentiment]++;
    dateMap.set(r.date, item);
  });

  return Array.from(dateMap.entries())
    .map(([date, counts]) => ({
      date: date.slice(5),
      ...counts,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Sentiment Breakdown By Video */
export function getSentimentByVideo(): VideoSentimentStats[] {
  const nlpResults = getCommentNLPResults();
  const videoMap = new Map<string, { title: string; positive: number; neutral: number; negative: number }>();

  nlpResults.forEach((r) => {
    const item = videoMap.get(r.videoId) || { title: r.videoTitle, positive: 0, neutral: 0, negative: 0 };
    item[r.sentiment]++;
    videoMap.set(r.videoId, item);
  });

  return Array.from(videoMap.entries()).map(([videoId, stats]) => ({
    videoId,
    title: stats.title,
    totalComments: stats.positive + stats.neutral + stats.negative,
    positive: stats.positive,
    neutral: stats.neutral,
    negative: stats.negative,
  }));
}

/** Emotion Distribution */
export function getEmotionDistribution(): EmotionDistribution[] {
  const nlpResults = getCommentNLPResults();
  const total = nlpResults.length || 1;
  const counts = new Map<EmotionType, number>();

  ALL_EMOTIONS.forEach((e) => counts.set(e, 0));
  nlpResults.forEach((r) => counts.set(r.emotion, (counts.get(r.emotion) || 0) + 1));

  return ALL_EMOTIONS.map((emotion) => {
    const count = counts.get(emotion) || 0;
    return {
      emotion,
      count,
      percentage: Math.round((count / total) * 100),
    };
  });
}

/** Intent Distribution */
export function getIntentDistribution(): IntentDistribution[] {
  const nlpResults = getCommentNLPResults();
  const total = nlpResults.length || 1;
  const counts = new Map<IntentType, number>();

  ALL_INTENTS.forEach((i) => counts.set(i, 0));
  nlpResults.forEach((r) => counts.set(r.intent, (counts.get(r.intent) || 0) + 1));

  return ALL_INTENTS.map((intent) => {
    const count = counts.get(intent) || 0;
    return {
      intent,
      count,
      percentage: Math.round((count / total) * 100),
    };
  });
}

/** Semantic Topic Analytics */
export function getTopicStats(): TopicNLPStats[] {
  const nlpResults = getCommentNLPResults();
  const map = new Map<
    SemanticTopic,
    { count: number; pos: number; neu: number; neg: number; videos: Map<string, number> }
  >();

  ALL_TOPICS.forEach((t) => map.set(t, { count: 0, pos: 0, neu: 0, neg: 0, videos: new Map() }));

  nlpResults.forEach((r) => {
    r.topics.forEach((t) => {
      const stats = map.get(t) || { count: 0, pos: 0, neu: 0, neg: 0, videos: new Map() };
      stats.count++;
      if (r.sentiment === "positive") stats.pos++;
      else if (r.sentiment === "neutral") stats.neu++;
      else stats.neg++;

      stats.videos.set(r.videoTitle, (stats.videos.get(r.videoTitle) || 0) + 1);
      map.set(t, stats);
    });
  });

  return ALL_TOPICS.map((topic) => {
    const stats = map.get(topic)!;
    const sortedVideos = Array.from(stats.videos.entries()).sort((a, b) => b[1] - a[1]);
    return {
      topic,
      frequency: stats.count,
      positiveCount: stats.pos,
      neutralCount: stats.neu,
      negativeCount: stats.neg,
      topVideo: sortedVideos[0]?.[0] || "General Portfolio",
    };
  }).sort((a, b) => b.frequency - a.frequency);
}

/** Sentiment Among High-Risk Audience Segments */
export function getHighRiskSegmentSentiment() {
  const nlpResults = getCommentNLPResults();
  const highRiskComments = nlpResults.filter((r) => r.viewerRiskLevel === "High" || r.viewerRiskLevel === "Critical");
  const total = highRiskComments.length || 1;

  const positive = highRiskComments.filter((r) => r.sentiment === "positive").length;
  const neutral = highRiskComments.filter((r) => r.sentiment === "neutral").length;
  const negative = highRiskComments.filter((r) => r.sentiment === "negative").length;

  return {
    totalComments: highRiskComments.length,
    positive,
    neutral,
    negative,
    negativePercentage: Math.round((negative / total) * 100),
  };
}

/** Filter Potential Disengagement Signals */
export function getDisengagementSignalComments(): CommentNLPResult[] {
  return getCommentNLPResults().filter((r) => r.isDisengagementSignal);
}
