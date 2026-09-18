from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import cv2
import mediapipe as mp


@dataclass
class Landmark:
    x: float
    y: float
    z: float
    visibility: float


class PoseDetector:
    """
    MediaPipe Pose Landmarker wrapper.

    Converts an OpenCV BGR frame into 33 normalized pose landmarks.
    """

    def __init__(
        self,
        model_path: str = "models/pose_landmarker_full.task",
        min_pose_detection_confidence: float = 0.5,
        min_pose_presence_confidence: float = 0.5,
        min_tracking_confidence: float = 0.5,
    ):
        self.model_path = Path(model_path)

        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Pose model not found: {self.model_path}\n"
                "Place pose_landmarker_full.task inside the models/ folder."
            )

        BaseOptions = mp.tasks.BaseOptions
        PoseLandmarker = mp.tasks.vision.PoseLandmarker
        PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
        VisionRunningMode = mp.tasks.vision.RunningMode

        options = PoseLandmarkerOptions(
            base_options=BaseOptions(
                model_asset_path=str(self.model_path.resolve())
            ),
            running_mode=VisionRunningMode.VIDEO,
            num_poses=1,
            min_pose_detection_confidence=min_pose_detection_confidence,
            min_pose_presence_confidence=min_pose_presence_confidence,
            min_tracking_confidence=min_tracking_confidence,
        )

        self.landmarker = PoseLandmarker.create_from_options(options)

        self.timestamp_ms = 0

    def process(self, frame_bgr) -> Optional[list[Landmark]]:
        """
        Process one OpenCV BGR frame.

        Returns:
            List of 33 Landmark objects, or None if no pose is detected.
        """

        frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=frame_rgb,
        )

        self.timestamp_ms += 33

        result = self.landmarker.detect_for_video(
            mp_image,
            self.timestamp_ms,
        )

        if not result.pose_landmarks:
            return None

        pose = result.pose_landmarks[0]

        landmarks = []

        for landmark in pose:
            visibility = (
                landmark.visibility
                if landmark.visibility is not None
                else 0.0
            )

            landmarks.append(
                Landmark(
                    x=landmark.x,
                    y=landmark.y,
                    z=landmark.z,
                    visibility=visibility,
                )
            )

        return landmarks

    def close(self):
        """Release MediaPipe resources."""
        self.landmarker.close()