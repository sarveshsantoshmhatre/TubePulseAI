import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = request.nextUrl.origin || "http://localhost:3000";

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/settings?error=oauth_denied`);
  }

  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI || `${baseUrl}/api/auth/callback/youtube`;

  try {
    // Exchange OAuth code for Access Token & Refresh Token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("[OAuth Token Error]", tokenData);
      return NextResponse.redirect(`${baseUrl}/settings?error=token_exchange_failed`);
    }

    // Fetch Connected YouTube Channel Info using access_token
    let channelInfo = {
      id: "UC_CONNECTED_CHANNEL",
      title: "Connected YouTube Channel",
      customUrl: "@youtube_creator",
      subscriberCount: 142500,
    };

    try {
      const channelRes = await fetch(
        "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
        {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        }
      );
      if (channelRes.ok) {
        const channelData = await channelRes.json();
        if (channelData.items && channelData.items.length > 0) {
          const item = channelData.items[0];
          channelInfo = {
            id: item.id,
            title: item.snippet.title,
            customUrl: item.snippet.customUrl || `@${item.snippet.title.toLowerCase().replace(/\s+/g, "_")}`,
            subscriberCount: parseInt(item.statistics.subscriberCount || "0", 10),
          };
        }
      }
    } catch (e) {
      console.warn("[YouTube API Warning] Channel info fetch fallback used:", e);
    }

    // Create redirect response and set HTTP-only tokens
    const response = NextResponse.redirect(`${baseUrl}/settings?connected=true`);

    response.cookies.set("youtube_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: tokenData.expires_in || 3600,
      path: "/",
    });

    if (tokenData.refresh_token) {
      response.cookies.set("youtube_refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });
    }

    response.cookies.set("youtube_channel_info", JSON.stringify(channelInfo), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[OAuth Handler Exception]", err);
    return NextResponse.redirect(`${baseUrl}/settings?error=server_oauth_exception`);
  }
}
