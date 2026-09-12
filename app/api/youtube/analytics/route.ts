import { NextResponse, type NextRequest } from "next/server";
import { refreshYouTubeAccessToken } from "@/lib/youtube/auth";

const DEMO_METRICS = {
  totalViews: 842000,
  estimatedMinutesWatched: 537000,
  averageViewDurationSeconds: 348,
  retentionRatePercentage: 58.2,
  subscribersGained: 1850,
  subscribersLost: 420,
  engagementScore: 84.5,
};

async function fetchAnalytics(accessToken: string) {
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const analyticsUrl = new URL("https://youtubeanalytics.googleapis.com/v1/reports");
  analyticsUrl.searchParams.set("ids", "channel==MINE");
  analyticsUrl.searchParams.set("startDate", thirtyDaysAgo);
  analyticsUrl.searchParams.set("endDate", today);
  analyticsUrl.searchParams.set(
    "metrics",
    "views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost",
  );

  return fetch(analyticsUrl.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
}

export async function GET(request: NextRequest) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

  if (isDemoMode) {
    return NextResponse.json({ mode: "demo", source: "synthetic_telemetry", metrics: DEMO_METRICS });
  }

  let accessToken = request.cookies.get("youtube_access_token")?.value || null;
  const refreshToken = request.cookies.get("youtube_refresh_token")?.value || null;

  if (!accessToken && refreshToken) {
    const refreshed = await refreshYouTubeAccessToken(refreshToken);
    accessToken = refreshed.accessToken;
  }

  if (!accessToken) {
    return NextResponse.json(
      { mode: "connected", source: "youtube_auth_required", error: "YouTube connection is missing or expired." },
      { status: 401 },
    );
  }

  try {
    let apiRes = await fetchAnalytics(accessToken);
    let refreshedAccessToken: string | null = null;

    if (apiRes.status === 401 && refreshToken) {
      const refreshed = await refreshYouTubeAccessToken(refreshToken);
      if (refreshed.accessToken) {
        refreshedAccessToken = refreshed.accessToken;
        accessToken = refreshed.accessToken;
        apiRes = await fetchAnalytics(accessToken);
      }
    }

    if (!apiRes.ok) {
      const errorText = await apiRes.text().catch(() => "");
      console.warn("[YouTube Analytics API] Live request failed:", apiRes.status, errorText.slice(0, 300));
      return NextResponse.json(
        {
          mode: "connected",
          source: "youtube_api_error",
          error: "YouTube Analytics API request failed.",
          status: apiRes.status,
        },
        { status: apiRes.status >= 400 && apiRes.status < 600 ? apiRes.status : 502 },
      );
    }

    const data = await apiRes.json();
    const row = data.rows?.[0] ?? [0, 0, 0, 0, 0];

    const response = NextResponse.json({
      mode: "connected",
      source: "official_youtube_analytics_v1",
      metrics: {
        totalViews: Number(row[0] ?? 0),
        estimatedMinutesWatched: Number(row[1] ?? 0),
        averageViewDurationSeconds: Number(row[2] ?? 0),
        subscribersGained: Number(row[3] ?? 0),
        subscribersLost: Number(row[4] ?? 0),
      },
    });

    if (refreshedAccessToken) {
      response.cookies.set("youtube_access_token", refreshedAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3600,
        path: "/",
      });
    }

    return response;
  } catch (err) {
    console.error("[YouTube Analytics API Exception]", err);
    return NextResponse.json(
      { mode: "connected", source: "youtube_api_exception", error: "Unable to reach YouTube Analytics API." },
      { status: 502 },
    );
  }
}
