"""
TubePulse AI - Model Training Script
Loads synthetic viewer telemetry, extracts features, trains model, evaluates metrics, and persists artifacts.
"""

import json
import os
import sys
import numpy as np

# Ensure parent directory is in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ml.features.feature_pipeline import FEATURE_NAMES, extract_viewer_features
from ml.preprocessing.preprocess import standardize_features, train_test_split_manual
from ml.models.model_factory import LogisticRegressionModel
from ml.evaluation.evaluate import evaluate_predictions

def train_and_persist_model():
    print("=" * 60)
    print("TubePulse AI - Model Training & Persistence Pipeline")
    print("=" * 60)

    # 1. Generate Synthetic Training Data from Schema
    # Simulated 100 viewer dataset features & binary ground truth labels (churn >= 55)
    np.random.seed(42)
    n_samples = 100

    raw_viewers = []
    for i in range(n_samples):
        risk_score = 15.0 + (i % 17) * 4.8 + (i % 5) * 2.1
        is_churn = 1 if risk_score >= 55 else 0
        raw_viewers.append({
            "id": f"VIEW-{1001 + i}",
            "recencyDays": float((i % 12) * 2.5),
            "inactivityDays": float((i % 10) * 3.0),
            "watchTimeMinutes": float(20.0 + (i % 15) * 11.0),
            "watchTimeTrend": float(((i % 5) - 2) * 1.5),
            "watchFrequency": float(1.0 + (i % 8) * 1.5),
            "frequencyTrend": float(((i % 4) - 2) * 0.8),
            "engagementRate": float(1.0 + (i % 11) * 1.8),
            "engagementTrend": float(((i % 3) - 1) * 0.5),
            "avgPercentageViewed": float(25.0 + (i % 14) * 4.5),
            "avgViewDuration": float(10.0 + (i % 9) * 4.0),
            "returnRate": float(30.0 + (i % 16) * 4.0),
            "contentPreferences": ["Gaming", "Tech Reviews"],
            "sentimentScore": float(20.0 + (i % 15) * 5.0),
            "intent": "Exploring",
            "ground_truth_churn": is_churn,
        })

    # 2. Extract Features
    X_list = [extract_viewer_features(v) for v in raw_viewers]
    y_list = [v["ground_truth_churn"] for v in raw_viewers]

    X = np.array(X_list)
    y = np.array(y_list)

    print(f"[+] Extracted {X.shape[0]} samples with {X.shape[1]} features.")

    # 3. Standard Scaling & Train/Test Split
    X_scaled, mean, std = standardize_features(X)
    X_train, X_test, y_train, y_test = train_test_split_manual(X_scaled, y, test_size=0.25)

    print(f"[+] Train split: {X_train.shape[0]} samples | Test split: {X_test.shape[0]} samples")

    # 4. Train Logistic Regression Model
    model = LogisticRegressionModel(learning_rate=0.08, n_iterations=1200)
    model.fit(X_train, y_train)

    # 5. Evaluate Predictions
    y_test_proba = model.predict_proba(X_test)
    eval_results = evaluate_predictions(y_test, y_test_proba)

    print("\n[+] Model Evaluation Metrics (Test Set):")
    print(f"    - Accuracy  : {eval_results['accuracy']}")
    print(f"    - Precision : {eval_results['precision']}")
    print(f"    - Recall    : {eval_results['recall']}")
    print(f"    - F1 Score  : {eval_results['f1_score']}")
    print(f"    - ROC-AUC   : {eval_results['roc_auc']}")
    print(f"    - Confusion Matrix : {eval_results['confusion_matrix']}")
    print(f"    - Disclosure: {eval_results['evaluation_note']}")

    # 6. Model Persistence
    artifacts_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../models/saved"))
    os.makedirs(artifacts_dir, exist_ok=True)

    artifacts = {
        "algorithm": "Logistic Regression",
        "weights": model.weights.tolist(),
        "bias": float(model.bias),
        "mean": mean.tolist(),
        "std": std.tolist(),
        "feature_names": FEATURE_NAMES,
        "evaluation": eval_results,
    }

    artifact_path = os.path.join(artifacts_dir, "model_artifacts.json")
    with open(artifact_path, "w") as f:
        json.dump(artifacts, f, indent=2)

    print(f"\n[✓] Model artifacts persisted successfully to {artifact_path}")
    return artifacts

if __name__ == "__main__":
    train_and_persist_model()
