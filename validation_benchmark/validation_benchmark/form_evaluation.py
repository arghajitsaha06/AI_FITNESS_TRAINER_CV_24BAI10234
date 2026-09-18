from __future__ import annotations

import csv
import sys
from pathlib import Path

import cv2


# ============================================================
# PROJECT ROOT
# ============================================================

PROJECT_ROOT = (
    Path(__file__).resolve().parent.parent
)

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from exercise_engine import ExerciseFactory
from pose_detector import PoseDetector


# ============================================================
# CONFIGURATION
# ============================================================

SUPPORTED_EXERCISES = {
    "bicep_curl",
    "squat",
    "push_up",
}


# ============================================================
# PROCESS VIDEO
# ============================================================

def process_video(
    video_path: str,
    exercise: str,
):
    """
    Process a complete video and return
    exercise/form statistics.
    """

    path = Path(video_path)

    if not path.exists():

        raise FileNotFoundError(
            f"Video not found: {path}"
        )

    cap = cv2.VideoCapture(
        str(path)
    )

    if not cap.isOpened():

        raise RuntimeError(
            f"Could not open video: {path}"
        )

    detector = None

    try:

        detector = PoseDetector()

        tracker = ExerciseFactory.create(
            exercise
        )

        frame_count = 0
        pose_frames = 0

        feedback_counter = {}

        while True:

            ret, frame = cap.read()

            if not ret:
                break

            frame_count += 1

            landmarks = detector.process(
                frame
            )

            if landmarks is None:
                continue

            pose_frames += 1

            result = tracker.update(
                landmarks
            )

            # ------------------------------------------------
            # Collect feedback
            # ------------------------------------------------

            if isinstance(
                result,
                dict,
            ):

                feedback = result.get(
                    "feedback"
                )

                if feedback:

                    feedback_counter[
                        feedback
                    ] = (
                        feedback_counter.get(
                            feedback,
                            0
                        )
                        + 1
                    )

        # ----------------------------------------------------
        # Final values
        # ----------------------------------------------------

        reps = getattr(
            tracker,
            "reps",
            0,
        )

        invalid_reps = getattr(
            tracker,
            "invalid_reps",
            0,
        )

        total_attempts = (
            reps + invalid_reps
        )

        if total_attempts > 0:

            form_accuracy = (
                reps
                / total_attempts
            ) * 100.0

        else:

            form_accuracy = 0.0

        # ----------------------------------------------------
        # Dominant feedback
        # ----------------------------------------------------

        if feedback_counter:

            dominant_feedback = max(
                feedback_counter,
                key=feedback_counter.get,
            )

        else:

            dominant_feedback = (
                "No feedback"
            )

        return {
            "frames": frame_count,
            "pose_frames": pose_frames,
            "reps": reps,
            "invalid_reps": invalid_reps,
            "form_accuracy_pct": form_accuracy,
            "dominant_feedback": dominant_feedback,
            "feedback_counts": feedback_counter,
        }

    finally:

        if detector is not None:

            try:
                detector.close()
            except Exception:
                pass

        cap.release()


# ============================================================
# DATASET LABEL
# ============================================================

def get_quality_from_path(
    video_path: str,
):
    """
    Detect whether the video belongs to
    the good or bad dataset folder.
    """

    parts = [
        part.lower()
        for part in Path(video_path).parts
    ]

    if "good" in parts:

        return "good"

    if "bad" in parts:

        return "bad"

    return "unknown"


# ============================================================
# CLASSIFY AI RESULT
# ============================================================

def classify_ai_form(
    result,
):
    """
    Convert tracker output into a simple
    form classification.

    This is an evaluation label, not a new
    ML classifier.
    """

    invalid_reps = result[
        "invalid_reps"
    ]

    reps = result[
        "reps"
    ]

    if invalid_reps > 0:

        return "bad"

    if reps > 0:

        return "good"

    return "unknown"


# ============================================================
# PRINT RESULT
# ============================================================

def print_video_result(
    index,
    video_path,
    quality,
    result,
    prediction,
):

    print()
    print(
        "--------------------------------------------------"
    )

    print(
        f"[{index}] "
        f"{Path(video_path).name}"
    )

    print(
        f"Dataset label      : {quality}"
    )

    print(
        f"AI prediction      : {prediction}"
    )

    print(
        f"Valid reps         : "
        f"{result['reps']}"
    )

    print(
        f"Invalid reps       : "
        f"{result['invalid_reps']}"
    )

    print(
        f"Form accuracy      : "
        f"{result['form_accuracy_pct']:.2f}%"
    )

    print(
        f"Frames             : "
        f"{result['frames']}"
    )

    print(
        f"Pose frames        : "
        f"{result['pose_frames']}"
    )

    print(
        f"Dominant feedback  : "
        f"{result['dominant_feedback']}"
    )


# ============================================================
# SAVE RESULTS
# ============================================================

def save_results(
    results,
    output_path,
):

    fieldnames = [
        "video_path",
        "dataset_label",
        "ai_prediction",
        "exercise",
        "valid_reps",
        "invalid_reps",
        "form_accuracy_pct",
        "frames",
        "pose_frames",
        "dominant_feedback",
    ]

    with open(
        output_path,
        "w",
        newline="",
        encoding="utf-8",
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=fieldnames,
        )

        writer.writeheader()

        for result in results:

            writer.writerow(
                result
            )

    print()
    print(
        f"Results saved to:"
    )

    print(
        output_path
    )


# ============================================================
# SUMMARY
# ============================================================

def print_summary(
    results,
):

    print()
    print()
    print(
        "=========================================================="
    )

    print(
        "             FORM EVALUATION SUMMARY"
    )

    print(
        "=========================================================="
    )

    if not results:

        print(
            "No results available."
        )

        return

    total = len(results)

    correct = sum(
        1
        for result in results
        if (
            result["dataset_label"]
            == result["ai_prediction"]
        )
    )

    accuracy = (
        correct / total
    ) * 100.0

    print(
        f"Videos evaluated : {total}"
    )

    print(
        f"Correct labels   : {correct}"
    )

    print(
        f"Label agreement  : "
        f"{accuracy:.2f}%"
    )

    # --------------------------------------------------------
    # Good videos
    # --------------------------------------------------------

    good_results = [
        result
        for result in results
        if result["dataset_label"] == "good"
    ]

    bad_results = [
        result
        for result in results
        if result["dataset_label"] == "bad"
    ]

    print()

    print(
        "GOOD videos:"
    )

    if good_results:

        good_correct = sum(
            1
            for result in good_results
            if result["ai_prediction"]
            == "good"
        )

        print(
            f"  Videos      : "
            f"{len(good_results)}"
        )

        print(
            f"  Correct     : "
            f"{good_correct}"
        )

        print(
            f"  Recognition : "
            f"{good_correct / len(good_results) * 100:.2f}%"
        )

    else:

        print(
            "  No good videos."
        )

    print()

    print(
        "BAD videos:"
    )

    if bad_results:

        bad_correct = sum(
            1
            for result in bad_results
            if result["ai_prediction"]
            == "bad"
        )

        print(
            f"  Videos      : "
            f"{len(bad_results)}"
        )

        print(
            f"  Correct     : "
            f"{bad_correct}"
        )

        print(
            f"  Recognition : "
            f"{bad_correct / len(bad_results) * 100:.2f}%"
        )

    else:

        print(
            "  No bad videos."
        )

    print()
    print(
        "=========================================================="
    )


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print(
        "=========================================================="
    )

    print(
        "          AI FITNESS TRAINER"
    )

    print(
        "              FORM EVALUATION"
    )

    print(
        "=========================================================="
    )

    # --------------------------------------------------------
    # Ask for video
    # --------------------------------------------------------

    video_path = input(
        "\nEnter complete video path: "
    ).strip()

    if not video_path:

        print(
            "No video path provided."
        )

        return

    # --------------------------------------------------------
    # Ask exercise
    # --------------------------------------------------------

    exercise = input(
        "Enter exercise "
        "(bicep_curl/squat/push_up): "
    ).strip().lower()

    if exercise not in SUPPORTED_EXERCISES:

        print(
            "Unsupported exercise."
        )

        return

    # --------------------------------------------------------
    # Dataset label
    # --------------------------------------------------------

    quality = get_quality_from_path(
        video_path
    )

    print()
    print(
        f"Detected dataset label: "
        f"{quality}"
    )

    # --------------------------------------------------------
    # Process
    # --------------------------------------------------------

    print()
    print(
        "Processing complete video..."
    )

    result = process_video(
        video_path,
        exercise,
    )

    prediction = classify_ai_form(
        result
    )

    # --------------------------------------------------------
    # Result
    # --------------------------------------------------------

    print_video_result(
        1,
        video_path,
        quality,
        result,
        prediction,
    )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    output_path = (
        Path(__file__).resolve().parent
        / "form_evaluation_results.csv"
    )

    row = {
        "video_path": video_path,
        "dataset_label": quality,
        "ai_prediction": prediction,
        "exercise": exercise,
        "valid_reps": result["reps"],
        "invalid_reps": result["invalid_reps"],
        "form_accuracy_pct": (
            result["form_accuracy_pct"]
        ),
        "frames": result["frames"],
        "pose_frames": result["pose_frames"],
        "dominant_feedback": (
            result["dominant_feedback"]
        ),
    }

    save_results(
        [row],
        output_path,
    )

    print()
    print(
        "Evaluation finished."
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()