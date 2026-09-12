import { engagementRecords, viewerActivity, viewers, videos } from "@/lib/data";
import type { EngagementRecord, Viewer, ViewerActivity } from "@/lib/types";

export type AnalyticsRange = "7d" | "30d" | "90d" | "all";
export type AnalyticsFilters = { range: AnalyticsRange; videoId: string; segment: string };

export const analyticsReferenceDate = new Date("2026-09-30T00:00:00Z");

const rangeDays: Record<AnalyticsRange, number | null> = { "7d": 7, "30d": 30, "90d": 90, all: null };
const average = (values: number[]) => values.reduce((total, value) => total + value, 0) / Math.max(values.length, 1);
const toTimestamp = (date: string) => new Date(`${date}T00:00:00Z`).getTime();

export function getAudienceSegment(viewer: Viewer) {
  if (viewer.riskScore >= 81) return "Urgent re-engagement";
  if (viewer.riskScore >= 61) return "Cooling loyalists";
  if (viewer.returnRate >= 65) return "Core loyalists";
  return "Exploring audience";
}

export const audienceSegments = Array.from(new Set(viewers.map(getAudienceSegment)));

function inRange(date: string, range: AnalyticsRange) {
  const timestamp = toTimestamp(date);
  if (timestamp > analyticsReferenceDate.getTime()) return false;
  const days = rangeDays[range];
  if (days === null) return true;
  return timestamp >= analyticsReferenceDate.getTime() - days * 86400000;
}

function weekLabel(date: string) {
  const start = new Date(`${date}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  return start.toISOString().slice(5, 10);
}

function groupByDate(records: ViewerActivity[]) {
  return Array.from(new Set(records.map((record) => record.date))).sort().map((date) => {
    const daily = records.filter((record) => record.date === date);
    return {
      date: date.slice(5),
      active: new Set(daily.map((record) => record.viewerId)).size,
      sessions: daily.length,
      watchTime: daily.reduce((sum, record) => sum + record.watchMinutes, 0),
      completion: Math.round(average(daily.map((record) => record.completionRate))),
    };
  });
}

function groupByWeek(records: ViewerActivity[]) {
  const buckets = new Map<string, ViewerActivity[]>();
  records.forEach((record) => {
    const label = weekLabel(record.date);
    buckets.set(label, [...(buckets.get(label) ?? []), record]);
  });
  return Array.from(buckets.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([week, sessions]) => ({
    week,
    active: new Set(sessions.map((session) => session.viewerId)).size,
    sessions: sessions.length,
    duration: Math.round(average(sessions.map((session) => session.watchMinutes))),
  }));
}

function viewerMatches(viewer: Viewer, segment: string) {
  return segment === "all" || getAudienceSegment(viewer) === segment;
}

export function buildAudienceAnalytics(filters: AnalyticsFilters) {
  const candidateViewers = viewers.filter((viewer) => viewerMatches(viewer, filters.segment));
  const viewerIds = new Set(candidateViewers.map((viewer) => viewer.id));
  const activity = viewerActivity.filter((record) =>
    viewerIds.has(record.viewerId) && inRange(record.date, filters.range) && (filters.videoId === "all" || record.videoId === filters.videoId),
  );
  const activeIds = new Set(activity.map((record) => record.viewerId));
  const sessionCounts = new Map<string, number>();
  activity.forEach((record) => sessionCounts.set(record.viewerId, (sessionCounts.get(record.viewerId) ?? 0) + 1));
  const firstSessions = new Map<string, string>();
  viewerActivity.filter((record) => viewerIds.has(record.viewerId)).forEach((record) => {
    const earliest = firstSessions.get(record.viewerId);
    if (!earliest || record.date < earliest) firstSessions.set(record.viewerId, record.date);
  });

  const totalWatchTime = activity.reduce((sum, record) => sum + record.watchMinutes, 0);
  return {
    kpis: {
      dailyActive: groupByDate(activity).at(-1)?.active ?? 0,
      weeklyActive: groupByWeek(activity).at(-1)?.active ?? 0,
      returning: Array.from(sessionCounts.values()).filter((count) => count > 1).length,
      newViewers: Array.from(activeIds).filter((id) => {
        const first = firstSessions.get(id);
        return first ? inRange(first, filters.range) : false;
      }).length,
      inactive: Math.max(candidateViewers.length - activeIds.size, 0),
      sessions: activity.length,
      sessionDuration: Math.round(average(activity.map((record) => record.watchMinutes))),
      watchTime: totalWatchTime,
      frequency: Number((activity.length / Math.max(activeIds.size, 1)).toFixed(1)),
      completion: Math.round(average(activity.map((record) => record.completionRate))),
      repeatViewing: Math.round((Array.from(sessionCounts.values()).filter((count) => count > 1).length / Math.max(activeIds.size, 1)) * 100),
    },
    daily: groupByDate(activity),
    weekly: groupByWeek(activity),
    sessionDistribution: [
      { name: "1 session", value: Array.from(sessionCounts.values()).filter((count) => count === 1).length },
      { name: "2–3 sessions", value: Array.from(sessionCounts.values()).filter((count) => count >= 2 && count <= 3).length },
      { name: "4+ sessions", value: Array.from(sessionCounts.values()).filter((count) => count >= 4).length },
    ],
  };
}

function filteredEngagement(filters: AnalyticsFilters, viewerIds: Set<string>) {
  return engagementRecords.filter((record) =>
    viewerIds.has(record.viewerId) && inRange(record.date, filters.range) && (filters.videoId === "all" || record.videoId === filters.videoId),
  );
}

function actionTotals(activity: ViewerActivity[], engagement: EngagementRecord[], matchingViewers: Viewer[]) {
  const viewerById = new Map(matchingViewers.map((viewer) => [viewer.id, viewer]));
  const subscriptions = activity.filter((record) => {
    const viewer = viewerById.get(record.viewerId);
    return viewer && viewer.returnRate >= 65 && record.completionRate >= 70;
  }).length;
  const unsubscribes = activity.filter((record) => {
    const viewer = viewerById.get(record.viewerId);
    return viewer && viewer.riskScore >= 81 && record.completionRate < 50;
  }).length;
  return {
    views: activity.length,
    likes: engagement.reduce((sum, record) => sum + record.likes, 0),
    comments: engagement.reduce((sum, record) => sum + record.comments, 0),
    shares: engagement.reduce((sum, record) => sum + record.shares, 0),
    subscriptions,
    unsubscribes,
  };
}

export function buildActionAnalytics(filters: AnalyticsFilters) {
  const matchingViewers = viewers.filter((viewer) => viewerMatches(viewer, filters.segment));
  const viewerIds = new Set(matchingViewers.map((viewer) => viewer.id));
  const activity = viewerActivity.filter((record) => viewerIds.has(record.viewerId) && inRange(record.date, filters.range) && (filters.videoId === "all" || record.videoId === filters.videoId));
  const engagement = filteredEngagement(filters, viewerIds);
  const totals = actionTotals(activity, engagement, matchingViewers);
  const actionVolume = Object.entries(totals).map(([name, value]) => ({ name, value }));
  const actionTrend = groupByDate(activity).map((point) => {
    const date = `2026-${point.date}`;
    const dayEngagement = engagement.filter((record) => record.date === date);
    return {
      date: point.date,
      views: point.sessions,
      likes: dayEngagement.reduce((sum, record) => sum + record.likes, 0),
      comments: dayEngagement.reduce((sum, record) => sum + record.comments, 0),
      shares: dayEngagement.reduce((sum, record) => sum + record.shares, 0),
    };
  });
  const byVideo = videos.map((video) => {
    const videoActivity = activity.filter((record) => record.videoId === video.id);
    const videoEngagement = engagement.filter((record) => record.videoId === video.id);
    const actionCount = videoEngagement.reduce((sum, record) => sum + record.likes + record.comments + record.shares, 0);
    return { video: video.title, views: videoActivity.length, actions: actionCount, rate: Number(((actionCount / Math.max(videoActivity.length, 1)) * 100).toFixed(1)) };
  }).filter((video) => video.views > 0 || video.actions > 0).sort((a, b) => b.actions - a.actions).slice(0, 8);
  const bySegment = audienceSegments.map((segment) => {
    const segmentViewers = matchingViewers.filter((viewer) => getAudienceSegment(viewer) === segment);
    const ids = new Set(segmentViewers.map((viewer) => viewer.id));
    const segmentActivity = activity.filter((record) => ids.has(record.viewerId));
    const segmentEngagement = engagement.filter((record) => ids.has(record.viewerId));
    const actions = segmentEngagement.reduce((sum, record) => sum + record.likes + record.comments + record.shares, 0);
    return { segment, actions, rate: Number(((actions / Math.max(segmentActivity.length, 1)) * 100).toFixed(1)) };
  });
  const riskRelationship = matchingViewers.map((viewer) => {
    const actions = engagement.filter((record) => record.viewerId === viewer.id).reduce((sum, record) => sum + record.likes + record.comments + record.shares, 0);
    return { viewer: viewer.id, actions, risk: viewer.riskScore };
  });
  const totalActions = totals.likes + totals.comments + totals.shares;
  return { totals, actionVolume, actionTrend, byVideo, bySegment, riskRelationship, actionRate: Number(((totalActions / Math.max(totals.views, 1)) * 100).toFixed(1)) };
}
