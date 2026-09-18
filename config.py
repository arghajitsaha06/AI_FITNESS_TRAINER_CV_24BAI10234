"""
Application configuration.
"""

from pathlib import Path


# ============================================================
# PROJECT PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

DATABASE_PATH = BASE_DIR / "fitness_trainer.sqlite3"


# ============================================================
# CAMERA / VIDEO SETTINGS
# ============================================================

DEFAULT_CAMERA_INDEX = 0

DEFAULT_WIDTH = 1280
DEFAULT_HEIGHT = 720


# ============================================================
# PERFORMANCE SETTINGS
# ============================================================

TARGET_FPS = 30.0

FPS_SMOOTHING = 0.90


# ============================================================
# MEDIAPIPE POSE SETTINGS
# ============================================================

MIN_POSE_DETECTION_CONFIDENCE = 0.50

MIN_POSE_PRESENCE_CONFIDENCE = 0.50

MIN_TRACKING_CONFIDENCE = 0.50


# ============================================================
# SESSION SETTINGS
# ============================================================

MIN_SESSION_SECONDS = 1.0