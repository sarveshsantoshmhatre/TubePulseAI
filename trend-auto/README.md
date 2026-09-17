# Trend-to-Video Automation Blueprint

This directory defines a separate automation module for discovering public trending topics, generating short-form AI video content, and publishing through user-owned social accounts.

## Workflow

1. Collect trends from configurable public sources and RSS/API adapters.
2. Normalize, deduplicate, and score topics using recency, source count, and configurable relevance rules.
3. Generate a fact-aware script, title, caption, hashtags, and scene plan with an LLM.
4. Render video through a configurable video provider, with local FFmpeg fallback for template-based rendering.
5. Run safety/content checks and place the result into an approval queue.
6. Publish only after approval to enabled platform adapters.
7. Store job status, source URLs, generated assets, and publication IDs for auditability.

## Design principles

- User-owned API keys and OAuth connections only.
- No credential values committed to Git.
- Human approval is the default before publishing.
- Platform adapters are isolated so a provider can be changed without rewriting the pipeline.
- Source URLs are retained with every generated topic.
- Rate limits, retries, and idempotency are built into the job model.

## Suggested adapters

Trend sources: Google Trends-compatible provider, RSS feeds, news APIs, Reddit-compatible API, YouTube Data API.

AI: OpenAI-compatible text generation, optional image/video generation provider.

Publishing: YouTube, Instagram, Facebook, TikTok, LinkedIn, and X where the account/API tier permits automated publishing.

## Local setup

Create environment variables in `.env` (never commit secrets). Run the API/worker and scheduler from the root application according to the implementation added alongside this blueprint.
