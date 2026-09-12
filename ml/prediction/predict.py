"""
TubePulse AI - Real-Time ML Prediction Engine
Loads model artifacts, computes disengagement probability, classifies risk level, and identifies top contributing features.
"""

import json
import os
import sys
import numpy as np
from typing import Dict, Any, List

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from ml.features.feature_pipeline import FEATURE_NAMES, extract_viewer_features

def load_model_artifacts():
    path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../models/saved/model_artifacts.json"))
    if not os.path.exists(path):
        # Generate baseline artifacts if not trained yet
        from ml.training.train import train_and_persist_model
        return train_and_persist_model()

    with open(path, "r") as f:
        return json.load(f)

def sigmoid(z: float) -> float:
    return 1.0 / (1.0 + np.exp(-np.clip(z, -25.0, 25.0)))

def predict_viewer_disengagement(raw_viewer: Dict[str, Any]) -> Dict[str, Any]:
    artifacts = load_model_artifacts()

    weights = np.array(artifacts["weights"])
    bias = float(artifacts["bias"])
    mean = np.array(artifacts["mean"])
    std = np.array(artifacts["std"])

    # Extract & scale features
    x_raw = np.array(extract_viewer_features(raw_viewer))
    std_copy = np.copy(std)
    std_copy[std_copy == 0] = 1.0
    x_scaled = (x_raw - mean) / std_copy

    # Compute probability via logistic regression decision boundary
    linear_score = float(np.dot(x_scaled, weights) + bias)
    probability = float(sigmoid(linear_score))
    risk_score = round(probability * 100, 1)

    # Classify Risk Level
    if risk_score >= 80:
        risk_level = "Critical"
    elif risk_score >= 60:
        risk_level = "High"
    elif risk_score >= 40:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # Compute Contributing Features (weighted impact ranking)
    contributions = x_scaled * weights
    ranked_indices = np.argsort(contributions)[::-1]

    contributing_features = []
    feature_labels = {
        "recency": "High recency days since last active session",
        "inactivity": "Extended inactivity duration between uploads",
        "watch_time": "Lower total accumulated watch minutes",
        "watch_time_trend": "Declining watch time trend over 30 days",
        "frequency": "Infrequent upload visit frequency",
        "frequency_trend": "Negative visit frequency trajectory",
        "engagement": "Low social interaction rate (likes/comments)",
        "engagement_trend": "Declining engagement action trend",
        "average_percentage_viewed": "Early video retention drop-off (<45%)",
        "session_duration": "Short average session watch duration",
        "returning_viewer_rate": "Low return viewing rate",
        "content_preference_score": "Narrow content category preference",
        "sentiment_score": "Negative sentiment detected in comment feedback",
        "intent_score": "Unresolved questions or dissatisfaction intent",
    }

    for idx in ranked_indices[:4]:
        fname = FEATURE_NAMES[idx]
        contributing_features.append({
            "feature": fname,
            "impact_score": round(float(contributions[idx]), 3),
            "description": feature_labels.get(fname, fname.replace("_", " ").capitalize()),
        })

    return {
        "viewer_id": raw_viewer.get("id", "VIEW-ANON"),
        "probability": round(probability, 4),
        "risk_score": risk_score,
        "risk_level": risk_level,
        "contributing_features": contributing_features,
        "model_metadata": {
            "algorithm": artifacts.get("algorithm", "Logistic Regression"),
            "features_used": len(FEATURE_NAMES),
            "persistence_status": "Loaded from ml/models/saved/model_artifacts.json",
        },
    }

if __name__ == "__main__":
    sample_viewer = {
        "id": "VIEW-1001",
        "recencyDays": 14.0,
        "inactivityDays": 14.0,
        "watchTimeMinutes": 25.0,
        "watchFrequency": 2.0,
        "engagementRate": 1.2,
        "avgPercentageViewed": 32.0,
        "returnRate": 34.0,
        "sentimentScore": 30.0,
        "intent": "Expressing dissatisfaction",
    }
    res = predict_viewer_disengagement(sample_viewer)
    print(json.dumps(res, indent=2))
