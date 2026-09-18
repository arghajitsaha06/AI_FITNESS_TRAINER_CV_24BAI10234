from __future__ import annotations

import cv2

from config import WINDOW_NAME
from exercise_engine import ExerciseResult


def draw_hud(frame, result: ExerciseResult, fps: float):
    h, w = frame.shape[:2]

    # Semi-transparent top panel
    overlay = frame.copy()
    cv2.rectangle(overlay, (15, 15), (430, 170), (20, 20, 20), -1)
    frame = cv2.addWeighted(overlay, 0.70, frame, 0.30, 0)

    cv2.putText(frame, "AI FITNESS TRAINER", (30, 45),
                cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 255), 2)

    cv2.putText(frame, f"Exercise: {result.exercise}", (30, 75),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    angle_text = f"Angle: {result.angle:.1f} deg" if result.angle is not None else "Angle: --"
    cv2.putText(frame, angle_text, (30, 105),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    cv2.putText(frame, f"Reps: {result.reps}", (30, 135),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    status = "FORM: GOOD" if result.form_valid else f"FORM: {result.form_error}"
    cv2.putText(frame, status, (30, 160),
                cv2.FONT_HERSHEY_SIMPLEX, 0.52,
                (0, 255, 0) if result.form_valid else (0, 0, 255), 2)

    cv2.putText(frame, f"FPS: {fps:.1f}", (w - 150, 35),
                cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)

    return frame
