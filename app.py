from __future__ import annotations

import argparse
import time
from pathlib import Path

import cv2

from api_client import FitnessAPIClient
from config import (
    DEFAULT_CAMERA_INDEX,
    DEFAULT_HEIGHT,
    DEFAULT_WIDTH,
)
from exercise_engine import ExerciseFactory
from pose_detector import PoseDetector


# ============================================================
# ARGUMENTS
# ============================================================

def parse_args():

    parser = argparse.ArgumentParser(
        description="AI Fitness Trainer"
    )

    parser.add_argument(
        "--source",
        default=str(DEFAULT_CAMERA_INDEX),
        help="Camera index or video file path",
    )

    parser.add_argument(
        "--exercise",
        required=True,
        choices=[
            "bicep_curl",
            "squat",
            "push_up",
        ],
        help="Exercise to track",
    )

    return parser.parse_args()


# ============================================================
# VIDEO SOURCE
# ============================================================

def open_video_source(source: str):

    if source.isdigit():

        source_value = int(source)

    else:

        source_value = source

    cap = cv2.VideoCapture(
        source_value
    )

    if not cap.isOpened():

        raise RuntimeError(
            f"Unable to open video source: {source}"
        )

    if isinstance(source_value, int):

        cap.set(
            cv2.CAP_PROP_FRAME_WIDTH,
            DEFAULT_WIDTH,
        )

        cap.set(
            cv2.CAP_PROP_FRAME_HEIGHT,
            DEFAULT_HEIGHT,
        )

    return cap


# ============================================================
# VIDEO INFORMATION
# ============================================================

def get_video_info(cap):

    fps = cap.get(
        cv2.CAP_PROP_FPS
    )

    total_frames = int(
        cap.get(
            cv2.CAP_PROP_FRAME_COUNT
        )
    )

    if fps <= 0:

        fps = 30.0

    if total_frames > 0:

        duration = (
            total_frames / fps
        )

    else:

        duration = 0.0

    return (
        fps,
        total_frames,
        duration,
    )


# ============================================================
# FORMAT TIME
# ============================================================

def format_time(seconds: float):

    seconds = max(
        0,
        int(seconds),
    )

    minutes = seconds // 60

    remaining_seconds = (
        seconds % 60
    )

    return (
        f"{minutes:02d}:"
        f"{remaining_seconds:02d}"
    )


# ============================================================
# FORM ACCURACY
# ============================================================

def calculate_form_accuracy(
    valid_reps: int,
    invalid_reps: int,
):

    total_attempts = (
        valid_reps
        + invalid_reps
    )

    if total_attempts == 0:

        return 0.0

    return (
        valid_reps
        / total_attempts
    ) * 100.0


# ============================================================
# USER SELECTION
# ============================================================

def select_user(api_client):

    try:

        users = api_client.get_users()

    except Exception as exc:

        print()
        print(
            "Could not retrieve users."
        )

        print(
            f"Reason: {exc}"
        )

        return None

    # --------------------------------------------------------
    # No users
    # --------------------------------------------------------

    if not users:

        print()
        print(
            "No users found."
        )

        print(
            "Create your first user."
        )

        username = input(
            "Enter username: "
        ).strip()

        if not username:

            print(
                "Invalid username."
            )

            return None

        try:

            created = (
                api_client.create_user(
                    username
                )
            )

            print()
            print(
                f"User created: "
                f"{created['username']}"
            )

            print(
                f"User ID: "
                f"{created['user_id']}"
            )

            return created

        except Exception as exc:

            print()
            print(
                "Could not create user."
            )

            print(
                f"Reason: {exc}"
            )

            return None

    # --------------------------------------------------------
    # Display users
    # --------------------------------------------------------

    print()
    print(
        "=========================================="
    )

    print(
        "              SELECT USER"
    )

    print(
        "=========================================="
    )

    for index, user in enumerate(
        users,
        start=1,
    ):

        print(
            f"{index}. "
            f"{user['username']}"
        )

    print(
        "=========================================="
    )

    while True:

        choice = input(
            "Select user number: "
        ).strip()

        try:

            selected_index = int(
                choice
            )

        except ValueError:

            print(
                "Please enter a valid number."
            )

            continue

        if (
            selected_index < 1
            or selected_index > len(users)
        ):

            print(
                "Invalid selection."
            )

            continue

        selected_user = users[
            selected_index - 1
        ]

        print()
        print(
            f"Selected user: "
            f"{selected_user['username']}"
        )

        return selected_user


# ============================================================
# HUD
# ============================================================

def draw_hud(
    frame,
    exercise_name,
    username,
    reps,
    invalid_reps,
    angle,
    state,
    feedback,
    fps,
    current_time,
    total_duration,
    is_video,
):

    # --------------------------------------------------------
    # Main panel
    # --------------------------------------------------------

    cv2.rectangle(
        frame,
        (15, 15),
        (500, 325),
        (20, 20, 20),
        -1,
    )

    cv2.putText(
        frame,
        f"USER: {username}",
        (30, 45),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (255, 255, 255),
        2,
        cv2.LINE_AA,
    )

    cv2.putText(
        frame,
        f"EXERCISE: {exercise_name.upper()}",
        (30, 80),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (255, 255, 255),
        2,
        cv2.LINE_AA,
    )

    cv2.putText(
        frame,
        f"REPS: {reps}",
        (30, 115),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.70,
        (255, 255, 255),
        2,
        cv2.LINE_AA,
    )

    cv2.putText(
        frame,
        f"INVALID: {invalid_reps}",
        (30, 150),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (255, 255, 255),
        2,
        cv2.LINE_AA,
    )

    if angle is None:

        angle_text = "ANGLE: --"

    else:

        angle_text = (
            f"ANGLE: {angle:.1f} deg"
        )

    cv2.putText(
        frame,
        angle_text,
        (30, 185),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (255, 255, 255),
        2,
        cv2.LINE_AA,
    )

    cv2.putText(
        frame,
        f"STATE: {state}",
        (30, 220),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (255, 255, 255),
        2,
        cv2.LINE_AA,
    )

    cv2.putText(
        frame,
        f"FPS: {fps:.1f}",
        (30, 255),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (255, 255, 255),
        2,
        cv2.LINE_AA,
    )

    # --------------------------------------------------------
    # TIME
    # --------------------------------------------------------

    if is_video:

        if total_duration > 0:

            time_text = (
                f"VIDEO: "
                f"{format_time(current_time)} / "
                f"{format_time(total_duration)}"
            )

        else:

            time_text = (
                f"VIDEO: "
                f"{format_time(current_time)}"
            )

    else:

        time_text = (
            f"TIME: "
            f"{format_time(current_time)}"
        )

    cv2.putText(
        frame,
        time_text,
        (30, 295),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.60,
        (255, 255, 255),
        2,
        cv2.LINE_AA,
    )

    # --------------------------------------------------------
    # Feedback
    # --------------------------------------------------------

    panel_top = (
        frame.shape[0] - 75
    )

    panel_bottom = (
        frame.shape[0] - 15
    )

    cv2.rectangle(
        frame,
        (15, panel_top),
        (
            frame.shape[1] - 15,
            panel_bottom,
        ),
        (20, 20, 20),
        -1,
    )

    cv2.putText(
        frame,
        f"FEEDBACK: {feedback}",
        (
            30,
            frame.shape[0] - 38,
        ),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (255, 255, 255),
        2,
        cv2.LINE_AA,
    )

    cv2.putText(
        frame,
        "Press Q to finish",
        (
            frame.shape[1] - 220,
            35,
        ),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.55,
        (255, 255, 255),
        1,
        cv2.LINE_AA,
    )


# ============================================================
# LANDMARK DRAWING
# ============================================================

def draw_landmarks(
    frame,
    landmarks,
    exercise,
):

    if landmarks is None:

        return

    if exercise == "bicep_curl":

        connections = [
            (11, 13),
            (13, 15),
            (12, 14),
            (14, 16),
        ]

    elif exercise == "squat":

        connections = [
            (11, 23),
            (23, 25),
            (25, 27),
            (12, 24),
            (24, 26),
            (26, 28),
        ]

    elif exercise == "push_up":

        connections = [
            (11, 13),
            (13, 15),
            (11, 23),
            (23, 25),
            (25, 27),
        ]

    else:

        connections = []

    height, width = (
        frame.shape[:2]
    )

    for start_idx, end_idx in connections:

        if (
            start_idx >= len(landmarks)
            or end_idx >= len(landmarks)
        ):

            continue

        start = landmarks[
            start_idx
        ]

        end = landmarks[
            end_idx
        ]

        x1 = int(
            start.x * width
        )

        y1 = int(
            start.y * height
        )

        x2 = int(
            end.x * width
        )

        y2 = int(
            end.y * height
        )

        cv2.line(
            frame,
            (x1, y1),
            (x2, y2),
            (255, 255, 255),
            2,
        )

    important_indices = set()

    for start_idx, end_idx in connections:

        important_indices.add(
            start_idx
        )

        important_indices.add(
            end_idx
        )

    for idx in important_indices:

        if idx >= len(landmarks):

            continue

        landmark = landmarks[idx]

        x = int(
            landmark.x * width
        )

        y = int(
            landmark.y * height
        )

        cv2.circle(
            frame,
            (x, y),
            5,
            (255, 255, 255),
            -1,
        )


# ============================================================
# SAFE TRACKER RESULT
# ============================================================

def normalize_tracker_result(
    tracker,
    result,
):

    if result is None:

        return {
            "reps": getattr(
                tracker,
                "reps",
                0,
            ),
            "invalid_reps": getattr(
                tracker,
                "invalid_reps",
                0,
            ),
            "angle": getattr(
                tracker,
                "angle",
                None,
            ),
            "state": getattr(
                tracker,
                "state",
                "UNKNOWN",
            ),
            "feedback": getattr(
                tracker,
                "feedback",
                "Keep going",
            ),
        }

    if not isinstance(
        result,
        dict,
    ):

        return {
            "reps": getattr(
                tracker,
                "reps",
                0,
            ),
            "invalid_reps": getattr(
                tracker,
                "invalid_reps",
                0,
            ),
            "angle": None,
            "state": "UNKNOWN",
            "feedback": "Keep going",
        }

    return result


# ============================================================
# MAIN
# ============================================================

def main():

    args = parse_args()

    print()
    print(
        "=========================================="
    )

    print(
        "          AI FITNESS TRAINER"
    )

    print(
        "=========================================="
    )

    print(
        f"Exercise : {args.exercise}"
    )

    print(
        f"Source   : {args.source}"
    )

    print(
        "=========================================="
    )

    # ========================================================
    # API CLIENT
    # ========================================================

    api_client = FitnessAPIClient()

    print()
    print(
        "Checking FastAPI backend..."
    )

    try:

        health = (
            api_client.health_check()
        )

        print(
            f"FastAPI status : "
            f"{health.get('status')}"
        )

        print(
            f"Database status: "
            f"{health.get('database')}"
        )

    except Exception as exc:

        print()
        print(
            "ERROR: FastAPI backend is not available."
        )

        print(
            f"Reason: {exc}"
        )

        print()
        print(
            "Start the backend first:"
        )

        print(
            "python api.py"
        )

        print()

        return

    # ========================================================
    # USER
    # ========================================================

    selected_user = select_user(
        api_client
    )

    if selected_user is None:

        print(
            "No user selected. "
            "Application closed."
        )

        return

    user_id = selected_user[
        "user_id"
    ]

    username = selected_user[
        "username"
    ]

    print()
    print(
        f"Workout will be saved for:"
    )

    print(
        f"User: {username}"
    )

    print(
        f"User ID: {user_id}"
    )

    # ========================================================
    # SOURCE
    # ========================================================

    cap = None
    detector = None
    tracker = None

    is_video = not args.source.isdigit()

    source_fps = 30.0
    total_frames = 0
    video_duration = 0.0

    session_start = None
    frame_count = 0
    processing_fps = 0.0

    try:

        cap = open_video_source(
            args.source
        )

        print()
        print(
            "Video source opened successfully."
        )

        # ----------------------------------------------------
        # Video information
        # ----------------------------------------------------

        if is_video:

            (
                source_fps,
                total_frames,
                video_duration,
            ) = get_video_info(
                cap
            )

            print(
                f"Source FPS     : "
                f"{source_fps:.2f}"
            )

            print(
                f"Total frames   : "
                f"{total_frames}"
            )

            print(
                f"Video duration : "
                f"{video_duration:.2f} sec"
            )

        # ====================================================
        # POSE DETECTOR
        # ====================================================

        detector = PoseDetector()

        print(
            "Pose detector initialized."
        )

        # ====================================================
        # TRACKER
        # ====================================================

        tracker = ExerciseFactory.create(
            args.exercise
        )

        print(
            "Exercise tracker initialized."
        )

        # ====================================================
        # SESSION START
        # ====================================================

        session_start = (
            time.perf_counter()
        )

        previous_frame_time = (
            time.perf_counter()
        )

        print()
        print(
            "Workout started."
        )

        print(
            "Press Q to finish."
        )

        print()

        # ====================================================
        # LOOP
        # ====================================================

        while True:

            ret, frame = cap.read()

            if not ret:

                print(
                    "\nVideo ended."
                )

                break

            frame_count += 1

            # ------------------------------------------------
            # PROCESSING FPS
            # ------------------------------------------------

            current_time = (
                time.perf_counter()
            )

            delta = (
                current_time
                - previous_frame_time
            )

            previous_frame_time = (
                current_time
            )

            if delta > 0:

                instant_fps = (
                    1.0 / delta
                )

                if processing_fps == 0:

                    processing_fps = (
                        instant_fps
                    )

                else:

                    processing_fps = (
                        0.90
                        * processing_fps
                        + 0.10
                        * instant_fps
                    )

            # ------------------------------------------------
            # POSE
            # ------------------------------------------------

            landmarks = (
                detector.process(
                    frame
                )
            )

            if landmarks is not None:

                result = tracker.update(
                    landmarks
                )

                draw_landmarks(
                    frame,
                    landmarks,
                    args.exercise,
                )

                result = (
                    normalize_tracker_result(
                        tracker,
                        result,
                    )
                )

            else:

                result = {
                    "reps": getattr(
                        tracker,
                        "reps",
                        0,
                    ),
                    "invalid_reps": getattr(
                        tracker,
                        "invalid_reps",
                        0,
                    ),
                    "angle": None,
                    "state": "NO POSE",
                    "feedback": "No person detected",
                }

            # ------------------------------------------------
            # VALUES
            # ------------------------------------------------

            reps = result.get(
                "reps",
                0,
            )

            invalid_reps = result.get(
                "invalid_reps",
                0,
            )

            angle = result.get(
                "angle",
                None,
            )

            state = result.get(
                "state",
                "UNKNOWN",
            )

            feedback = result.get(
                "feedback",
                "Keep going",
            )

            # ------------------------------------------------
            # CORRECT TIME
            # ------------------------------------------------

            if is_video:

                current_frame = (
                    cap.get(
                        cv2.CAP_PROP_POS_FRAMES
                    )
                )

                video_time = (
                    current_frame
                    / source_fps
                )

                display_time = video_time

            else:

                display_time = (
                    time.perf_counter()
                    - session_start
                )

            # ------------------------------------------------
            # HUD
            # ------------------------------------------------

            draw_hud(
                frame=frame,
                exercise_name=args.exercise,
                username=username,
                reps=reps,
                invalid_reps=invalid_reps,
                angle=angle,
                state=state,
                feedback=feedback,
                fps=processing_fps,
                current_time=display_time,
                total_duration=video_duration,
                is_video=is_video,
            )

            # ------------------------------------------------
            # DISPLAY
            # ------------------------------------------------

            cv2.imshow(
                "AI Fitness Trainer",
                frame,
            )

            key = (
                cv2.waitKey(1)
                & 0xFF
            )

            if key == ord("q"):

                print(
                    "\nFinishing workout..."
                )

                break

        # ====================================================
        # FINAL VALUES
        # ====================================================

        final_reps = getattr(
            tracker,
            "reps",
            0,
        )

        final_invalid_reps = getattr(
            tracker,
            "invalid_reps",
            0,
        )

        # ----------------------------------------------------
        # CORRECT SESSION DURATION
        # ----------------------------------------------------

        if is_video:

            final_duration = (
                video_duration
            )

        else:

            final_duration = (
                time.perf_counter()
                - session_start
            )

        final_form_accuracy = (
            calculate_form_accuracy(
                final_reps,
                final_invalid_reps,
            )
        )

        # ====================================================
        # SUMMARY
        # ====================================================

        print()
        print(
            "=========================================="
        )

        print(
            "          WORKOUT SUMMARY"
        )

        print(
            "=========================================="
        )

        print(
            f"User          : {username}"
        )

        print(
            f"User ID       : {user_id}"
        )

        print(
            f"Exercise      : {args.exercise}"
        )

        print(
            f"Valid Reps    : {final_reps}"
        )

        print(
            f"Invalid Reps  : "
            f"{final_invalid_reps}"
        )

        print(
            f"Form Accuracy : "
            f"{final_form_accuracy:.2f}%"
        )

        print(
            f"Duration      : "
            f"{final_duration:.2f} sec"
        )

        print(
            f"Frames        : "
            f"{frame_count}"
        )

        print(
            f"Processing FPS: "
            f"{processing_fps:.2f}"
        )

        print(
            "=========================================="
        )

        # ====================================================
        # SAVE THROUGH FASTAPI
        # ====================================================

        try:

            api_response = (
                api_client.create_session(
                    user_id=user_id,
                    exercise_type=args.exercise,
                    total_reps=final_reps,
                    invalid_reps=final_invalid_reps,
                    form_accuracy_pct=(
                        final_form_accuracy
                    ),
                    duration_seconds=(
                        final_duration
                    ),
                )
            )

            session_id = (
                api_response[
                    "session_id"
                ]
            )

            print()
            print(
                "=========================================="
            )

            print(
                "       WORKOUT SESSION SAVED"
            )

            print(
                "=========================================="
            )

            print(
                f"Session ID    : "
                f"{session_id}"
            )

            print(
                f"User          : "
                f"{username}"
            )

            print(
                f"User ID       : "
                f"{user_id}"
            )

            print(
                f"Exercise      : "
                f"{args.exercise}"
            )

            print(
                f"Valid Reps    : "
                f"{final_reps}"
            )

            print(
                f"Invalid Reps  : "
                f"{final_invalid_reps}"
            )

            print(
                f"Form Accuracy : "
                f"{final_form_accuracy:.2f}%"
            )

            print(
                "Saved through : FastAPI"
            )

            print(
                "=========================================="
            )

        except Exception as exc:

            print()
            print(
                "ERROR: Could not save session."
            )

            print(
                f"Reason: {exc}"
            )

    except KeyboardInterrupt:

        print(
            "\nWorkout interrupted."
        )

    except Exception as exc:

        print()
        print(
            "APPLICATION ERROR"
        )

        print(
            f"{type(exc).__name__}: {exc}"
        )

    finally:

        if detector is not None:

            try:
                detector.close()
            except Exception:
                pass

        if cap is not None:

            try:
                cap.release()
            except Exception:
                pass

        cv2.destroyAllWindows()

        print()
        print(
            "Application closed."
        )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()