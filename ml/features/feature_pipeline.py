"""
TubePulse AI - Feature Engineering Pipeline
Extracts and transforms the 14 key viewer features for churn/disengagement prediction:
1. recency
2. inactivity
3. watch_time
4. watch_time_trend
5. frequency
6. frequency_trend
7. engagement
8. engagement_trend
9. average_percentage_viewed
10. session_duration
11. returning_viewer_rate
12. content_preference
13. sentiment
14. intent
"""

from typing import Dict, Any, List

FEATURE_NAMES = [
    "recency",
    "inactivity",
    "watch_time",
    "watch_time_trend",
    "frequency",
    "frequency_trend",
    "engagement",
    "engagement_trend",
    "average_percentage_viewed",
    "session_duration",
    "returning_viewer_rate",
    "content_preference_score",
    "sentiment_score",
    "intent_score",
]

# Intent category numerical mapping
INTENT_SCORES = {
    "Praising content": 1.0,
    "Expressing interest": 0.8,
    "Learning": 0.7,
    "Exploring": 0.6,
    "Asking a question": 0.5,
    "Requesting content": 0.5,
    "Suggesting improvement": 0.4,
    "Seeking help": 0.3,
    "Reporting an issue": 0.2,
    "Expressing dissatisfaction": 0.1,
}

# Sentiment score normalization helper
def normalize_sentiment(score: float) -> float:
    return max(0.0, min(1.0, score / 100.0))

def extract_viewer_features(raw_viewer: Dict[str, Any]) -> List[float]:
    """
    Extracts numerical feature vector from raw viewer data dictionary.
    """
    recency = float(raw_viewer.get("recencyDays", 5.0))
    inactivity = float(raw_viewer.get("inactivityDays", recency))
    watch_time = float(raw_viewer.get("watchTimeMinutes", 60.0))
    watch_time_trend = float(raw_viewer.get("watchTimeTrend", 0.0))
    frequency = float(raw_viewer.get("watchFrequency", 4.0))
    frequency_trend = float(raw_viewer.get("frequencyTrend", 0.0))
    engagement = float(raw_viewer.get("engagementRate", 5.0))
    engagement_trend = float(raw_viewer.get("engagementTrend", 0.0))
    avg_percentage_viewed = float(raw_viewer.get("avgPercentageViewed", 50.0))
    session_duration = float(raw_viewer.get("avgViewDuration", 15.0))
    returning_viewer_rate = float(raw_viewer.get("returnRate", 50.0))

    # Content Preference Score (concentration & engagement match)
    prefs = raw_viewer.get("contentPreferences", [])
    content_preference_score = float(len(prefs)) / 3.0

    # Sentiment & Intent
    sentiment_raw = float(raw_viewer.get("sentimentScore", 50.0))
    sentiment_score = normalize_sentiment(sentiment_raw)
    intent_str = str(raw_viewer.get("intent", "Exploring"))
    intent_score = INTENT_SCORES.get(intent_str, 0.5)

    return [
        recency,
        inactivity,
        watch_time,
        watch_time_trend,
        frequency,
        frequency_trend,
        engagement,
        engagement_trend,
        avg_percentage_viewed,
        session_duration,
        returning_viewer_rate,
        content_preference_score,
        sentiment_score,
        intent_score,
    ]
