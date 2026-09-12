# TubePulseAI

TubePulseAI is a Next.js application for YouTube audience analytics, churn-risk analysis, retention intelligence, and creator telemetry.

## Stack

- Next.js 15 + React 19 + TypeScript
- Supabase authentication and PostgreSQL with Row Level Security
- YouTube Data API v3
- YouTube Analytics API
- Recharts / Tailwind / Lucide
- Server-side YouTube OAuth token handling with HttpOnly cookies

## Local development

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

See `.env.example`. For a real deployment, configure:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `YOUTUBE_CLIENT_ID`
- `YOUTUBE_CLIENT_SECRET`
- `YOUTUBE_REDIRECT_URI`
- `YOUTUBE_API_KEY`
- `NEXT_PUBLIC_DEMO_MODE=false`

Never commit `.env.local`, OAuth secrets, or API keys.

## Supabase

Apply the SQL migrations in `supabase/migrations` to the production project. The current migration enables RLS and scopes channel connections, snapshots, and alert preferences to the authenticated owner.

## YouTube OAuth

The Google OAuth redirect URI must exactly match:

```text
https://YOUR_DOMAIN/api/auth/callback/youtube
```

The deployed domain must also be registered in the Google OAuth configuration and the YouTube APIs required by the application must be enabled.

## Production verification

Before release:

```bash
npm ci
npm run lint
npm run build
npm run start
```

Then manually verify:

1. Sign up / sign in.
2. Supabase data is isolated between users.
3. Connect YouTube through Google OAuth.
4. Confirm live channel statistics load.
5. Confirm Analytics API metrics load.
6. Disconnect YouTube and confirm tokens are cleared/revoked.
7. Confirm demo mode is not active in production.
8. Confirm the deployed HTTPS origin matches `NEXT_PUBLIC_APP_URL` and the Google OAuth redirect URI.

## Deployment

TubePulseAI can be deployed as a standard Next.js server application, including Vercel. Production deployment is conditional on completing the environment, Google OAuth, Supabase migration, and local/CI `lint` + `build` verification above.
