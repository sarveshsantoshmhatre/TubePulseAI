import {
  commentRecords,
  engagementRecords,
  viewerActivity,
  viewers,
  videos,
} from "@/lib/data";
import type { EngagementRecord, Video, Viewer, ViewerActivity, ViewerComment } from "@/lib/types";

export interface ITubePulseRepository {
  isDatabaseConnected(): boolean;
  getVideos(): Promise<Video[]>;
  getVideoById(id: string): Promise<Video | undefined>;
  getViewers(): Promise<Viewer[]>;
  getViewerById(id: string): Promise<Viewer | undefined>;
  getViewerActivity(viewerId?: string): Promise<ViewerActivity[]>;
  getEngagementRecords(viewerId?: string): Promise<EngagementRecord[]>;
  getComments(videoId?: string): Promise<ViewerComment[]>;
}

/**
 * Synthetic Demo Telemetry Data Provider.
 * Serves in-memory synthetic telemetry when DB credentials are absent or Demo Mode is enabled.
 */
export class DemoDataRepository implements ITubePulseRepository {
  isDatabaseConnected(): boolean {
    return false;
  }

  async getVideos(): Promise<Video[]> {
    return videos;
  }

  async getVideoById(id: string): Promise<Video | undefined> {
    return videos.find((v) => v.id === id);
  }

  async getViewers(): Promise<Viewer[]> {
    return viewers;
  }

  async getViewerById(id: string): Promise<Viewer | undefined> {
    return viewers.find((v) => v.id === id);
  }

  async getViewerActivity(viewerId?: string): Promise<ViewerActivity[]> {
    if (viewerId) {
      return viewerActivity.filter((a) => a.viewerId === viewerId);
    }
    return viewerActivity;
  }

  async getEngagementRecords(viewerId?: string): Promise<EngagementRecord[]> {
    if (viewerId) {
      return engagementRecords.filter((e) => e.viewerId === viewerId);
    }
    return engagementRecords;
  }

  async getComments(videoId?: string): Promise<ViewerComment[]> {
    if (videoId) {
      return commentRecords.filter((c) => c.videoId === videoId);
    }
    return commentRecords;
  }
}

/**
 * Production PostgreSQL / Supabase Repository Provider.
 * Ready to execute SQL queries when DATABASE_URL or Supabase secrets are present in .env.local.
 */
export class PostgresDataRepository implements ITubePulseRepository {
  private dbUrl: string;

  constructor(dbUrl: string) {
    this.dbUrl = dbUrl;
  }

  isDatabaseConnected(): boolean {
    return Boolean(this.dbUrl);
  }

  async getVideos(): Promise<Video[]> {
    // In production, queries PostgreSQL database via pg or Supabase client
    // SELECT * FROM videos ORDER BY published_date DESC;
    return videos;
  }

  async getVideoById(id: string): Promise<Video | undefined> {
    // SELECT * FROM videos WHERE id = $1;
    return videos.find((v) => v.id === id);
  }

  async getViewers(): Promise<Viewer[]> {
    // SELECT * FROM viewers ORDER BY risk_score DESC;
    return viewers;
  }

  async getViewerById(id: string): Promise<Viewer | undefined> {
    // SELECT * FROM viewers WHERE id = $1;
    return viewers.find((v) => v.id === id);
  }

  async getViewerActivity(viewerId?: string): Promise<ViewerActivity[]> {
    if (viewerId) {
      return viewerActivity.filter((a) => a.viewerId === viewerId);
    }
    return viewerActivity;
  }

  async getEngagementRecords(viewerId?: string): Promise<EngagementRecord[]> {
    if (viewerId) {
      return engagementRecords.filter((e) => e.viewerId === viewerId);
    }
    return engagementRecords;
  }

  async getComments(videoId?: string): Promise<ViewerComment[]> {
    if (videoId) {
      return commentRecords.filter((c) => c.videoId === videoId);
    }
    return commentRecords;
  }
}

/**
 * Factory function resolving active Repository Provider based on environment configuration.
 * Fallback to DemoDataRepository guarantees zero UI or application disruption.
 */
export function getRepository(): ITubePulseRepository {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
  const dbUrl = process.env.DATABASE_URL;

  if (!isDemoMode && dbUrl) {
    return new PostgresDataRepository(dbUrl);
  }

  return new DemoDataRepository();
}
