import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("youtube_access_token")?.value;
  const refreshToken = request.cookies.get("youtube_refresh_token")?.value;
  const channelCookie = request.cookies.get("youtube_channel_info")?.value;

  let channel: {
    id: string;
    title: string;
    customUrl: string;
    subscriberCount: number;
  } | null = null;

  if (channelCookie) {
    try {
      const parsed = JSON.parse(channelCookie);
      if (parsed && typeof parsed.id === "string" && typeof parsed.title === "string") {
        channel = {
          id: parsed.id,
          title: parsed.title,
          customUrl: typeof parsed.customUrl === "string" ? parsed.customUrl : "",
          subscriberCount: Number(parsed.subscriberCount || 0),
        };
      }
    } catch {
      // Ignore a malformed stale cookie.
    }
  }

  return NextResponse.json({
    connected: Boolean(accessToken || refreshToken),
    hasAccessToken: Boolean(accessToken),
    hasRefreshToken: Boolean(refreshToken),
    channel,
  });
}
