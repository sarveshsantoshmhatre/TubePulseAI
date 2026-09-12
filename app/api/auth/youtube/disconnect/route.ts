import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("youtube_access_token")?.value;
  const refreshToken = request.cookies.get("youtube_refresh_token")?.value;
  const tokenToRevoke = refreshToken || accessToken;

  if (tokenToRevoke) {
    try {
      await fetch("https://oauth2.googleapis.com/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: tokenToRevoke }),
        cache: "no-store",
      });
    } catch (error) {
      console.warn("[YouTube OAuth] Token revocation request failed:", error);
    }
  }

  const response = NextResponse.json({ disconnected: true });
  response.cookies.delete("youtube_access_token");
  response.cookies.delete("youtube_refresh_token");
  response.cookies.delete("youtube_channel_info");
  response.cookies.delete("youtube_oauth_state");

  return response;
}
