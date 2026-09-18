from __future__ import annotations

import asyncio
import base64
import json
import logging
import time
from typing import Optional

import cv2
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from exercise_engine import ExerciseFactory
from pose_detector import PoseDetector

logger = logging.getLogger("realtime_workout")
logger.setLevel(logging.INFO)

router = APIRouter(tags=["Real-time Workout"])


def normalize_exercise_name(name: str) -> str:
    """Normalize exercise string for ExerciseFactory."""
    cleaned = (name or "bicep_curl").strip().lower().replace("-", "_").replace(" ", "_")
    if cleaned in {"bicep", "bicep_curl"}:
        return "bicep_curl"
    if cleaned in {"squat", "squats"}:
        return "squat"
    if cleaned in {"pushup", "push_up"}:
        return "push_up"
    return "bicep_curl"


@router.websocket("/ws/workout")
async def websocket_workout_endpoint(
    websocket: WebSocket,
    exercise: Optional[str] = "bicep_curl",
):
    """
    Real-time WebSocket endpoint for AI exercise tracking.
    Receives camera video frames (Base64 JPEG or binary), runs MediaPipe Pose Landmarker,
    and updates the active ExerciseTracker (Bicep Curl, Squat, Push-up).
    Streams back telemetry: reps, invalid reps, angle, state, feedback, FPS, and landmarks.
    """
    await websocket.accept()
    logger.info("WebSocket client connected to /ws/workout with exercise: %s", exercise)

    detector: Optional[PoseDetector] = None
    tracker = None
    current_exercise = normalize_exercise_name(exercise)

    try:
        detector = PoseDetector()
        tracker = ExerciseFactory.create(current_exercise)
    except Exception as exc:
        logger.error("Failed to initialize PoseDetector or Exercise tracker: %s", exc)
        await websocket.send_json({
            "type": "error",
            "message": f"Initialization failed: {str(exc)}",
        })
        await websocket.close()
        return

    fps = 0.0
    prev_time = time.perf_counter()

    try:
        while True:
            # Receive either binary frame or JSON message
            message = await websocket.receive()

            if "bytes" in message and message["bytes"]:
                raw_bytes = message["bytes"]
            elif "text" in message and message["text"]:
                try:
                    payload = json.loads(message["text"])
                except Exception:
                    continue

                msg_type = payload.get("type", "frame")

                if msg_type == "ping":
                    await websocket.send_json({"type": "pong"})
                    continue

                if msg_type == "switch_exercise":
                    new_ex = normalize_exercise_name(payload.get("exercise", current_exercise))
                    if new_ex != current_exercise:
                        current_exercise = new_ex
                        try:
                            tracker = ExerciseFactory.create(current_exercise)
                            logger.info("Switched exercise to: %s", current_exercise)
                        except Exception as e:
                            logger.error("Error switching exercise to %s: %e", current_exercise, e)
                    await websocket.send_json({
                        "type": "exercise_switched",
                        "exercise": current_exercise,
                    })
                    continue

                if msg_type == "reset":
                    tracker = ExerciseFactory.create(current_exercise)
                    await websocket.send_json({
                        "type": "reset_complete",
                        "exercise": current_exercise,
                    })
                    continue

                if msg_type == "frame":
                    img_data = payload.get("image", "")
                    if not img_data:
                        continue
                    if "," in img_data:
                        img_data = img_data.split(",", 1)[1]
                    try:
                        raw_bytes = base64.b64decode(img_data)
                    except Exception:
                        continue
                else:
                    continue
            else:
                continue

            # Decode frame from JPEG buffer
            np_arr = np.frombuffer(raw_bytes, np.uint8)
            frame_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if frame_bgr is None:
                continue

            # Measure real FPS
            curr_time = time.perf_counter()
            delta = curr_time - prev_time
            prev_time = curr_time
            if delta > 0:
                instant_fps = 1.0 / delta
                fps = instant_fps if fps == 0 else (0.85 * fps + 0.15 * instant_fps)

            # Run pose detection asynchronously without blocking event loop
            try:
                landmarks = await asyncio.to_thread(detector.process, frame_bgr)
            except Exception as e:
                logger.warning("Pose detection error: %s", e)
                landmarks = None

            # Update exercise tracker
            pose_detected = False
            lm_list = None

            if landmarks is not None and len(landmarks) >= 17:
                pose_detected = True
                result = tracker.update(landmarks)

                lm_list = [
                    {
                        "x": round(lm.x, 4),
                        "y": round(lm.y, 4),
                        "z": round(lm.z, 4),
                        "visibility": round(lm.visibility, 3),
                    }
                    for lm in landmarks
                ]

                if isinstance(result, dict):
                    angle_val = result.get("angle")
                    angle = round(float(angle_val), 1) if angle_val is not None else 0.0
                    state = result.get("state", tracker.state)
                    form_valid = result.get("form_valid", tracker.form_valid)
                    feedback = result.get("feedback", tracker.feedback)
                else:
                    angle = (
                        round(float(tracker.last_angle), 1)
                        if getattr(tracker, "last_angle", None) is not None
                        else 0.0
                    )
                    state = getattr(tracker, "state", "READY")
                    form_valid = getattr(tracker, "form_valid", True)
                    feedback = getattr(tracker, "feedback", "READY")
            else:
                # No person or low visibility
                angle = (
                    round(float(tracker.last_angle), 1)
                    if getattr(tracker, "last_angle", None) is not None
                    else 0.0
                )
                state = getattr(tracker, "state", "READY")
                form_valid = getattr(tracker, "form_valid", True)
                feedback = getattr(tracker, "feedback", "MOVE INTO CAMERA VIEW")

            reps = getattr(tracker, "reps", 0)
            invalid_reps = getattr(tracker, "invalid_reps", 0)
            valid_reps = max(0, reps - invalid_reps)
            accuracy_pct = round((valid_reps / reps) * 100) if reps > 0 else 100

            telemetry = {
                "type": "telemetry",
                "pose_detected": pose_detected,
                "exercise": current_exercise,
                "reps": reps,
                "valid_reps": valid_reps,
                "invalid_reps": invalid_reps,
                "accuracy_pct": accuracy_pct,
                "angle": angle,
                "state": state,
                "form_valid": form_valid,
                "feedback": feedback,
                "fps": round(fps, 1),
                "landmarks": lm_list,
            }

            await websocket.send_json(telemetry)

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected gracefully.")
    except Exception as exc:
        logger.warning("WebSocket connection ended: %s", exc)
    finally:
        if detector is not None:
            try:
                detector.close()
            except Exception:
                pass
        logger.info("PoseDetector closed.")
