# Architecture

```text
Trend Sources
   |
   v
Ingestion -> Normalizer -> Deduper -> Trend Scorer
                                   |
                                   v
                              Topic Queue
                                   |
                                   v
                         Script/Scene Generator
                                   |
                                   v
                           Video Renderer
                                   |
                                   v
                       Content/Safety Checks
                                   |
                                   v
                           Approval Queue
                              /    |    \
                             /     |     \
                        YouTube Instagram TikTok
                              \     |     /
                               Facebook / X / LinkedIn
                                   |
                                   v
                              Publish Log
```

## Core services

### `collector`
Provider interfaces for RSS/news/trending APIs. Every collected item carries source URL, provider, observed timestamp, and raw title/summary.

### `ranking`
Combines recency, cross-source frequency, configurable categories, and user keywords. The score is a prioritization signal, not a claim that a topic is objectively important.

### `content`
Produces a structured JSON package: hook, narration, scene prompts, on-screen text, caption, title, hashtags, source citations, and estimated duration.

### `render`
Provider interface for AI video generation. Also supports deterministic FFmpeg templates for local testing and low-cost operation.

### `review`
Approval workflow with preview URL, source citations, generated script, and explicit approve/reject state.

### `publish`
Separate adapters with OAuth/token management, rate limiting, retries, idempotency keys, and platform-specific metadata.

### `scheduler`
Runs discovery and publishing jobs on a configurable interval. Production deployments should use a persistent queue and worker rather than an in-process timer.

## Data model

- `trend_items`: source records and normalized topics
- `content_jobs`: generation state and configuration snapshot
- `assets`: rendered media and thumbnails
- `approval_items`: human review state
- `social_accounts`: encrypted connection metadata; never store raw secrets in Git
- `publish_jobs`: platform-specific attempts and external post IDs
- `audit_events`: immutable workflow events for troubleshooting
