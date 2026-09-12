import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");
  const expectedState = request.cookies.get("youtube_oauth_state")?.value;
  const baseUrl = request.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/settings?error=oauth_denied`);
  }

  if (!state || !expectedState || state !== expectedState) {
    const response = NextResponse.redirect(`${baseUrl}/settings?error=oauth_state_mismatch`);
    response.cookies.delete("youtube_oauth_state");
    return response;
  }

  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI || `${baseUrl}/api/auth/callback/youtube`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/settings?error=missing_oauth_config`);
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("[OAuth Token Error]", tokenData.error || tokenResponse.status);
      return NextResponse.redirect(`${baseUrl}/settings?error=token_exchange_failed`);
    }

    let channelInfo = {
      id: "UC_CONNECTED_CHANNEL",
      title: "Connected YouTube Channel",
      customUrl: "@youtube_creator",
      subscriberCount: 0,
    };

    const channelRes = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
        cache: "no-store",
      },
    );

    if (channelRes.ok) {
      const channelData = await channelRes.json();
      const item = channelData.items?.[0];
      if (item) {
        channelInfo = {
          id: item.id,
          title: item.snippet.title,
          customUrl: item.snippet.customUrl || `@${item.snippet.title.toLowerCase().replace(/\s+/g, "_")}`,
          subscriberCount: Number.parseInt(item.statistics.subscriberCount || "0", 10),
        };
      }
    }

    const response = NextResponse.redirect(`${baseUrl}/settings?connected=true`);
    const secure = process.env.NODE_ENV === "production";

    response.cookies.set("youtube_access_token", tokenData.access_token, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: Math.max(60, Number(tokenData.expires_in || 3600)),
      path: "/",
    });

    if (tokenData.refresh_token) {
      response.cookies.set("youtube_refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60,
        path: "/",
      });
    }

    response.cookies.set("youtube_channel_info", JSON.stringify(channelInfo), {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });
    response.cookies.delete("youtube_oauth_state");

    return response;
  } catch (err) {
    console.error("[OAuth Handler Exception]", err);
    return NextResponse.redirect(`${baseUrl}/settings?error=server_oauth_exception`);
  }
}
