import type { NextRequest } from "next/server";

type TokenResult = {
  accessToken: string | null;
  refreshed: boolean;
};

const TOKEN_URL = "https://oauth2.googleapis.com/token";

export async function getYouTubeAccessToken(request: NextRequest): Promise<TokenResult> {
  const accessToken = request.cookies.get("youtube_access_token")?.value;
  if (accessToken) return { accessToken, refreshed: false };

  const refreshToken = request.cookies.get("youtube_refresh_token")?.value;
  if (!refreshToken) return { accessToken: null, refreshed: false };

  return refreshYouTubeAccessToken(refreshToken);
}

export async function refreshYouTubeAccessToken(refreshToken: string): Promise<TokenResult> {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return { accessToken: null, refreshed: false };
  }

  try {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("[YouTube OAuth] Refresh failed:", response.status);
      return { accessToken: null, refreshed: false };
    }

    const data = await response.json();
    return {
      accessToken: typeof data.access_token === "string" ? data.access_token : null,
      refreshed: Boolean(data.access_token),
    };
  } catch (error) {
    console.warn("[YouTube OAuth] Refresh exception:", error);
    return { accessToken: null, refreshed: false };
  }
}

export function setYouTubeAccessCookie(response: Response, accessToken: string, expiresIn = 3600) {
  const cookie = [
    `youtube_access_token=${encodeURIComponent(accessToken)}`,
    "Path=/",
    `Max-Age=${Math.max(60, expiresIn)}`,
    "HttpOnly",
    "SameSite=Lax",
    ...(process.env.NODE_ENV === "production" ? ["Secure"] : []),
  ].join("; ");

  response.headers.append("Set-Cookie", cookie);
}
