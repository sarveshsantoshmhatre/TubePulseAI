import { calculateDisengagementPrediction } from "@/lib/prediction";
import type { Viewer } from "@/lib/types";

export interface MLPredictionResponse {
  viewer_id: string;
  probability: number;
  risk_score: number;
  risk_level: "Low" | "Medium" | "High" | "Critical";
  contributing_features: { feature: string; description: string; impact_score: number }[];
  ml_architecture?: {
    status: string;
    algorithm: string;
    features_evaluated: number;
  };
}

/**
 * Frontend ML API client.
 * Calls /api/ml/predict with automatic fallback to in-memory prediction service.
 */
export async function getMLViewerPrediction(viewer: Viewer): Promise<MLPredictionResponse> {
  try {
    const res = await fetch("/api/ml/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ viewer }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Silent fallback to local prediction engine on network/server error
  }

  // Local fallback prediction
  const fallback = calculateDisengagementPrediction(viewer);
  return {
    viewer_id: viewer.id,
    probability: Number((fallback.churnProbability / 100).toFixed(4)),
    risk_score: fallback.churnProbability,
    risk_level: fallback.riskLevel,
    contributing_features: fallback.contributingFactors.map((f) => ({
      feature: f,
      description: f,
      impact_score: 0.8,
    })),
    ml_architecture: {
      status: "Local Fallback Prediction Active",
      algorithm: "Rule-Based Deterministic Engine",
      features_evaluated: 14,
    },
  };
}
