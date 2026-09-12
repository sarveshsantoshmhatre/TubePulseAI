import { NextResponse, type NextRequest } from "next/server";
import { getYouTubeChannelTelemetry } from "@/lib/youtube/service";
import { refreshYouTubeAccessToken } from "@/lib/youtube/auth";

async function fetchChannelStats(accessToken: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "snippet,statistics,contentDetails");
  url.searchParams.set("mine", "true");
  if (apiKey) url.searchParams.set("key", apiKey);

  return fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
}

export async function GET(request: NextRequest) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

  if (isDemoMode) {
    const demoTelemetry = await getYouTubeChannelTelemetry();
    return NextResponse.json({ mode: "demo", source: "synthetic_telemetry", data: demoTelemetry });
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
    let apiRes = await fetchChannelStats(accessToken);
    let refreshedAccessToken: string | null = null;

    if (apiRes.status === 401 && refreshToken) {
      const refreshed = await refreshYouTubeAccessToken(refreshToken);
      if (refreshed.accessToken) {
        refreshedAccessToken = refreshed.accessToken;
        accessToken = refreshed.accessToken;
        apiRes = await fetchChannelStats(accessToken);
      }
    }

    if (!apiRes.ok) {
      const errorText = await apiRes.text().catch(() => "");
      console.warn("[YouTube Stats API] Live request failed:", apiRes.status, errorText.slice(0, 300));
      return NextResponse.json(
        {
          mode: "connected",
          source: "youtube_api_error",
          error: "YouTube Data API request failed.",
          status: apiRes.status,
        },
        { status: apiRes.status >= 400 && apiRes.status < 600 ? apiRes.status : 502 },
      );
    }

    const data = await apiRes.json();
    const item = data.items?.[0];

    if (!item) {
      return NextResponse.json(
        { mode: "connected", source: "youtube_channel_missing", error: "No YouTube channel was returned for this account." },
        { status: 404 },
      );
    }

    const stats = item.statistics;
    const snippet = item.snippet;

    const response = NextResponse.json({
      mode: "connected",
      source: "official_youtube_api_v3",
      data: {
        channelId: item.id,
        title: snippet.title,
        customUrl: snippet.customUrl || `@${snippet.title.toLowerCase().replace(/\s+/g, "")}`,
        publishedAt: snippet.publishedAt,
        viewCount: Number.parseInt(stats.viewCount || "0", 10),
        subscriberCount: Number.parseInt(stats.subscriberCount || "0", 10),
        videoCount: Number.parseInt(stats.videoCount || "0", 10),
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
    console.error("[YouTube Stats API Exception]", err);
    return NextResponse.json(
      { mode: "connected", source: "youtube_api_exception", error: "Unable to reach YouTube Data API." },
      { status: 502 },
    );
  }
}
