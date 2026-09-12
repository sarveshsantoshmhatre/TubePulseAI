-- ====================================================================
-- TubePulse AI - PostgreSQL / Supabase Production Database Schema
-- Step 12: Database Architecture
-- ====================================================================

-- Enable UUID extension for secure, anonymous primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CHANNELS
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_handle VARCHAR(100) UNIQUE NOT NULL,
    channel_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. VIDEOS
CREATE TABLE IF NOT EXISTS videos (
    id VARCHAR(50) PRIMARY KEY, -- e.g. VID-0001 or YouTube Video ID
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    published_date DATE NOT NULL,
    total_views INT DEFAULT 0,
    avg_watch_minutes NUMERIC(8, 2) DEFAULT 0.00,
    retention_rate NUMERIC(5, 2) DEFAULT 0.00,
    engagement_rate NUMERIC(5, 2) DEFAULT 0.00,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. VIEWERS (Anonymous Viewer Telemetry)
CREATE TABLE IF NOT EXISTS viewers (
    id VARCHAR(50) PRIMARY KEY, -- Anonymous viewer handle, e.g. VIEW-1001
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    anonymous_hash VARCHAR(255) UNIQUE NOT NULL,
    watch_time_minutes INT DEFAULT 0,
    watch_frequency NUMERIC(5, 2) DEFAULT 0.00,
    avg_percentage_viewed NUMERIC(5, 2) DEFAULT 0.00,
    engagement_rate NUMERIC(5, 2) DEFAULT 0.00,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    shares INT DEFAULT 0,
    return_rate NUMERIC(5, 2) DEFAULT 0.00,
    content_preferences TEXT[] DEFAULT '{}',
    last_active DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. VIEWER_ACTIVITY (Session-level aggregate logs)
CREATE TABLE IF NOT EXISTS viewer_activity (
    id VARCHAR(100) PRIMARY KEY,
    viewer_id VARCHAR(50) REFERENCES viewers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    active_sessions INT DEFAULT 1,
    total_watch_minutes NUMERIC(8, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. VIEWER_VIDEO_ACTIVITY (Video-level session telemetry)
CREATE TABLE IF NOT EXISTS viewer_video_activity (
    id VARCHAR(100) PRIMARY KEY,
    viewer_id VARCHAR(50) REFERENCES viewers(id) ON DELETE CASCADE,
    video_id VARCHAR(50) REFERENCES videos(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    watch_minutes NUMERIC(8, 2) NOT NULL,
    completion_rate NUMERIC(5, 2) NOT NULL,
    session_type VARCHAR(50) CHECK (session_type IN ('Organic', 'Search', 'Suggested', 'Playlist')),
    engagement_rate NUMERIC(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. COMMENTS
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(100) PRIMARY KEY,
    viewer_id VARCHAR(50) REFERENCES viewers(id) ON DELETE CASCADE,
    video_id VARCHAR(50) REFERENCES videos(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SENTIMENT_RESULTS (Decoupled NLP Sentiment Engine Results)
CREATE TABLE IF NOT EXISTS sentiment_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id VARCHAR(100) UNIQUE REFERENCES comments(id) ON DELETE CASCADE,
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    sentiment_score NUMERIC(5, 2) NOT NULL,
    model_version VARCHAR(50) DEFAULT 'synthetic-nlp-v1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. EMOTION_RESULTS (Decoupled NLP Emotion Results)
CREATE TABLE IF NOT EXISTS emotion_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id VARCHAR(100) UNIQUE REFERENCES comments(id) ON DELETE CASCADE,
    emotion VARCHAR(50) CHECK (emotion IN ('satisfaction', 'excitement', 'frustration', 'disappointment', 'confusion', 'curiosity')),
    confidence NUMERIC(5, 2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. INTENT_RESULTS (Decoupled NLP Intent Results)
CREATE TABLE IF NOT EXISTS intent_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id VARCHAR(100) UNIQUE REFERENCES comments(id) ON DELETE CASCADE,
    intent VARCHAR(100) CHECK (intent IN (
        'asking a question',
        'requesting content',
        'expressing dissatisfaction',
        'expressing interest',
        'seeking help',
        'praising content',
        'reporting an issue',
        'suggesting improvement'
    )),
    confidence NUMERIC(5, 2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. PREDICTIONS (Disengagement & Risk Scores)
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viewer_id VARCHAR(50) REFERENCES viewers(id) ON DELETE CASCADE,
    churn_probability NUMERIC(5, 2) NOT NULL,
    risk_level VARCHAR(20) CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    contributing_factors TEXT[] DEFAULT '{}',
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. AUDIENCE_SEGMENTS (Cohort definitions)
CREATE TABLE IF NOT EXISTS audience_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    segment_key VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. SEGMENT_MEMBERSHIPS (Many-to-Many Viewer Segment Mappings)
CREATE TABLE IF NOT EXISTS segment_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viewer_id VARCHAR(50) REFERENCES viewers(id) ON DELETE CASCADE,
    segment_id UUID REFERENCES audience_segments(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(viewer_id, segment_id)
);

-- Indexing for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_viewers_last_active ON viewers(last_active);
CREATE INDEX IF NOT EXISTS idx_viewer_video_activity_viewer ON viewer_video_activity(viewer_id);
CREATE INDEX IF NOT EXISTS idx_viewer_video_activity_video ON viewer_video_activity(video_id);
CREATE INDEX IF NOT EXISTS idx_comments_video ON comments(video_id);
CREATE INDEX IF NOT EXISTS idx_predictions_risk_level ON predictions(risk_level);
