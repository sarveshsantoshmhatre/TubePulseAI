"""
TubePulse AI - Model Evaluation Module
Computes Classification Metrics: Accuracy, Precision, Recall, F1 Score, ROC-AUC, and Confusion Matrix.
Employs empirical, honest evaluation without fabricated metrics.
"""

from typing import Dict, Any
import numpy as np

def compute_confusion_matrix(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, int]:
    tp = int(np.sum((y_true == 1) & (y_pred == 1)))
    tn = int(np.sum((y_true == 0) & (y_pred == 0)))
    fp = int(np.sum((y_true == 0) & (y_pred == 1)))
    fn = int(np.sum((y_true == 1) & (y_pred == 0)))
    return {"TP": tp, "TN": tn, "FP": fp, "FN": fn}

def compute_roc_auc_simple(y_true: np.ndarray, y_proba: np.ndarray) -> float:
    """
    Simplified ROC-AUC calculation via Mann-Whitney U statistic rank sum.
    """
    pos_mask = (y_true == 1)
    neg_mask = (y_true == 0)
    n_pos = np.sum(pos_mask)
    n_neg = np.sum(neg_mask)

    if n_pos == 0 or n_neg == 0:
        return 0.5  # Neutral baseline if single-class target in split

    ranks = np.argsort(np.argsort(y_proba)) + 1
    sum_pos_ranks = np.sum(ranks[pos_mask])
    u_stat = sum_pos_ranks - (n_pos * (n_pos + 1)) / 2.0
    return float(u_stat / (n_pos * n_neg))

def evaluate_predictions(y_true: np.ndarray, y_proba: np.ndarray, threshold: float = 0.5) -> Dict[str, Any]:
    """
    Evaluates model performance against true ground truth.
    Returns honest metric outputs with explicit dataset sample size disclosures.
    """
    y_pred = (y_proba >= threshold).astype(int)
    cm = compute_confusion_matrix(y_true, y_pred)
    total_samples = len(y_true)

    accuracy = (cm["TP"] + cm["TN"]) / max(total_samples, 1)
    precision = cm["TP"] / max(cm["TP"] + cm["FP"], 1)
    recall = cm["TP"] / max(cm["TP"] + cm["FN"], 1)
    f1 = (2 * precision * recall) / max(precision + recall, 1e-6)
    roc_auc = compute_roc_auc_simple(y_true, y_proba)

    dataset_note = (
        f"Evaluation performed on N={total_samples} sample split. "
        "Metrics reflect initial synthetic dataset baseline and should be re-evaluated as live telemetry grows."
    )

    return {
        "sample_size": total_samples,
        "accuracy": round(float(accuracy), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1_score": round(float(f1), 4),
        "roc_auc": round(float(roc_auc), 4),
        "confusion_matrix": cm,
        "evaluation_note": dataset_note,
    }
