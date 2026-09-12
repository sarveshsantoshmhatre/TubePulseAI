import { commentRecords, engagementRecords, viewerActivity, viewerById, videos } from "@/lib/data";
import { getAudienceSegment } from "@/lib/analytics";

const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export type VideoPerformance = {
  id: string;
  title: string;
  category: string;
  publishDate: string;
  views: number;
  watchTime: number;
  percentageViewed: number;
  likes: number;
  comments: number;
  shares: number;
  returningViewers: number;
  engagementRate: number;
  retention: number;
  audienceRisk: number;
};

function recordsFor(videoId: string) {
  const activity = viewerActivity.filter((record) => record.videoId === videoId);
  const engagement = engagementRecords.filter((record) => record.videoId === videoId);
  const comments = commentRecords.filter((record) => record.videoId === videoId);
  const viewers = Array.from(new Set(activity.map((record) => record.viewerId))).map((id) => viewerById.get(id)).filter((viewer): viewer is NonNullable<typeof viewer> => Boolean(viewer));
  return { activity, engagement, comments, viewers };
}

export function getVideoPerformance(videoId: string): VideoPerformance | undefined {
  const video = videos.find((item) => item.id === videoId);
  if (!video) return undefined;
  const { activity, engagement, viewers } = recordsFor(videoId);
  const likes = sum(engagement.map((record) => record.likes));
  const comments = sum(engagement.map((record) => record.comments));
  const shares = sum(engagement.map((record) => record.shares));
  const actions = likes + comments + shares;
  return {
    id: video.id,
    title: video.title,
    category: video.category,
    publishDate: video.publishedDate,
    views: video.totalViews,
    watchTime: sum(activity.map((record) => record.watchMinutes)),
    percentageViewed: Math.round(average(activity.map((record) => record.completionRate))),
    likes,
    comments,
    shares,
    returningViewers: new Set(viewers.filter((viewer) => viewer.returnRate >= 55).map((viewer) => viewer.id)).size,
    engagementRate: Number(((actions / Math.max(activity.length, 1)) * 100).toFixed(1)),
    retention: Number(average(activity.map((record) => record.completionRate)).toFixed(1)),
    audienceRisk: Math.round(average(viewers.map((viewer) => viewer.riskScore))),
  };
}

export function getContentPerformance() {
  return videos.map((video) => getVideoPerformance(video.id)!).sort((a, b) => b.audienceRisk - a.audienceRisk);
}

export function getCategoryPerformance() {
  const performances = getContentPerformance();
  return Array.from(new Set(performances.map((item) => item.category))).map((category) => {
    const categoryVideos = performances.filter((item) => item.category === category);
    return {
      category,
      engagement: Number(average(categoryVideos.map((item) => item.engagementRate)).toFixed(1)),
      retention: Math.round(average(categoryVideos.map((item) => item.retention))),
      risk: Math.round(average(categoryVideos.map((item) => item.audienceRisk))),
      views: sum(categoryVideos.map((item) => item.views)),
      videos: categoryVideos.length,
    };
  }).sort((a, b) => b.risk - a.risk);
}

export type TopicPerformance = {
  topic: string;
  engagement: number;
  retention: number;
  risk: number;
  videosCount: number;
};

export function getTopicPerformance(): TopicPerformance[] {
  const performances = getContentPerformance();
  const topicMap = new Map<string, VideoPerformance[]>();

  performances.forEach((video) => {
    const detail = videos.find((v) => v.id === video.id);
    if (detail && detail.tags) {
      detail.tags.forEach((tag) => {
        const list = topicMap.get(tag) || [];
        list.push(video);
        topicMap.set(tag, list);
      });
    }
  });

  return Array.from(topicMap.entries()).map(([topic, videoList]) => ({
    topic,
    engagement: Number(average(videoList.map((v) => v.engagementRate)).toFixed(1)),
    retention: Math.round(average(videoList.map((v) => v.retention))),
    risk: Math.round(average(videoList.map((v) => v.audienceRisk))),
    videosCount: videoList.length,
  })).sort((a, b) => b.engagement - a.engagement);
}

export function getContentPreferenceAnalysis() {
  const categories = getCategoryPerformance();
  const topics = getTopicPerformance();

  const sortedByEngagement = [...categories].sort((a, b) => b.engagement - a.engagement);
  const sortedByRetention = [...categories].sort((a, b) => b.retention - a.retention);
  const sortedByRisk = [...categories].sort((a, b) => b.risk - a.risk);

  const topTopicsByEngagement = [...topics].sort((a, b) => b.engagement - a.engagement);
  const topTopicsByRetention = [...topics].sort((a, b) => b.retention - a.retention);

  return {
    highEngagement: {
      category: sortedByEngagement[0]?.category || "N/A",
      score: `${sortedByEngagement[0]?.engagement}% engagement rate`,
      topTopic: topTopicsByEngagement[0]?.topic || "N/A",
    },
    highRetention: {
      category: sortedByRetention[0]?.category || "N/A",
      score: `${sortedByRetention[0]?.retention}% avg retention`,
      topTopic: topTopicsByRetention[0]?.topic || "N/A",
    },
    lowRetention: {
      category: sortedByRetention[sortedByRetention.length - 1]?.category || "N/A",
      score: `${sortedByRetention[sortedByRetention.length - 1]?.retention}% avg retention`,
      lowestTopic: topTopicsByRetention[topTopicsByRetention.length - 1]?.topic || "N/A",
    },
    highChurnRisk: {
      category: sortedByRisk[0]?.category || "N/A",
      score: `${sortedByRisk[0]?.risk}% predicted audience risk`,
      associatedSignal: "Correlated with early viewer drop-off in recent uploads",
    },
    lowChurnRisk: {
      category: sortedByRisk[sortedByRisk.length - 1]?.category || "N/A",
      score: `${sortedByRisk[sortedByRisk.length - 1]?.risk}% predicted audience risk`,
      associatedSignal: "Associated with consistent returning viewer retention",
    },
  };
}

export function getVideoDetail(videoId: string) {
  const performance = getVideoPerformance(videoId);
  if (!performance) return undefined;
  const video = videos.find((item) => item.id === videoId)!;
  const { activity, engagement, comments, viewers } = recordsFor(videoId);
  const dates = Array.from(new Set(activity.map((record) => record.date))).sort();
  const trends = dates.map((date) => {
    const dayActivity = activity.filter((record) => record.date === date);
    const dayEngagement = engagement.filter((record) => record.date === date);
    return {
      date: date.slice(5),
      views: dayActivity.length,
      watchTime: sum(dayActivity.map((record) => record.watchMinutes)),
      retention: Math.round(average(dayActivity.map((record) => record.completionRate))),
      engagement: sum(dayEngagement.map((record) => record.likes + record.comments + record.shares)),
    };
  });
  const response = ["Organic", "Search", "Suggested", "Playlist"].map((type) => ({ name: type, value: activity.filter((record) => record.sessionType === type).length }));
  const sentiments = ["positive", "neutral", "negative"].map((sentiment) => ({ name: sentiment, value: comments.filter((record) => record.sentiment === sentiment).length }));
  const audienceSegments = Array.from(new Set(viewers.map(getAudienceSegment))).map((segment) => ({ segment, viewers: viewers.filter((viewer) => getAudienceSegment(viewer) === segment).length, risk: Math.round(average(viewers.filter((viewer) => getAudienceSegment(viewer) === segment).map((viewer) => viewer.riskScore))) }));
  const riskRelationship = viewers.map((viewer) => ({ viewer: viewer.id, risk: viewer.riskScore, completion: Math.round(average(activity.filter((record) => record.viewerId === viewer.id).map((record) => record.completionRate))) }));
  return { video, performance, trends, response, sentiments, comments, audienceSegments, riskRelationship, topics: video.tags };
}

