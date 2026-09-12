"""
TubePulse AI - Data Preprocessing & Train/Test Split
Preprocesses numerical feature matrices, standardizes scaling, and generates train/test partitions.
"""

from typing import Tuple, List, Dict, Any
import numpy as np

def standardize_features(X: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Standardize features by subtracting mean and scaling to unit variance.
    Returns (X_scaled, mean, std).
    """
    mean = np.mean(X, axis=0)
    std = np.std(X, axis=0)
    std[std == 0] = 1.0  # Prevent division by zero
    X_scaled = (X - mean) / std
    return X_scaled, mean, std

def apply_standard_scaling(X: np.ndarray, mean: np.ndarray, std: np.ndarray) -> np.ndarray:
    """
    Applies pre-computed mean and std scaling to new feature arrays.
    """
    std_copy = np.copy(std)
    std_copy[std_copy == 0] = 1.0
    return (X - mean) / std_copy

def train_test_split_manual(
    X: np.ndarray, y: np.ndarray, test_size: float = 0.2, random_seed: int = 42
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Splits feature matrix X and target labels y into train and test sets.
    """
    np.random.seed(random_seed)
    n_samples = X.shape[0]
    indices = np.arange(n_samples)
    np.random.shuffle(indices)

    n_test = int(n_samples * test_size)
    test_idx = indices[:n_test]
    train_idx = indices[n_test:]

    return X[train_idx], X[test_idx], y[train_idx], y[test_idx]
