from __future__ import annotations

import csv
import sys
from pathlib import Path

import cv2

# Allow importing project modules from the parent directory
PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from exercise_engine import ExerciseFactory
from pose_detector import PoseDetector


# ============================================================
# CONFIGURATION
# ============================================================

VIDEO_COLUMN = "video_path"
EXERCISE_COLUMN = "exercise"
ACTUAL_REPS_COLUMN = "actual_reps"

VALID_EXERCISES = {
    "bicep_curl",
    "squat",
    "push_up",
}


# ============================================================
# PROCESS ONE VIDEO
# ============================================================

def process_video(
    video_path: str,
    exercise: str,
):
    """
    Run the AI Fitness Trainer on one evaluation video.

    Returns:
        predicted repetitions,
        invalid repetitions,
        processed frame count
    """

    print()
    print("--------------------------------------------------")
    print(f"Video    : {video_path}")
    print(f"Exercise : {exercise}")
    print("--------------------------------------------------")

    if not Path(video_path).exists():

        raise FileNotFoundError(
            f"Video not found: {video_path}"
        )

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():

        raise RuntimeError(
            f"Unable to open video: {video_path}"
        )

    detector = None

    try:

        detector = PoseDetector()

        tracker = ExerciseFactory.create(
            exercise
        )

        frame_count = 0

        while True:

            ret, frame = cap.read()

            if not ret:
                break

            frame_count += 1

            landmarks = detector.process(
                frame
            )

            if landmarks is not None:

                tracker.update(
                    landmarks
                )

        predicted_reps = getattr(
            tracker,
            "reps",
            0,
        )

        invalid_reps = getattr(
            tracker,
            "invalid_reps",
            0,
        )

        print(
            f"Predicted reps : {predicted_reps}"
        )

        print(
            f"Invalid reps   : {invalid_reps}"
        )

        print(
            f"Frames         : {frame_count}"
        )

        return (
            predicted_reps,
            invalid_reps,
            frame_count,
        )

    finally:

        if detector is not None:

            try:
                detector.close()
            except Exception:
                pass

        cap.release()


# ============================================================
# REP DETECTION METRICS
# ============================================================

def calculate_rep_detection_rate(
    actual_reps: int,
    predicted_reps: int,
) -> float:
    """
    Calculate repetition detection rate.

    For this project we use:

        predicted repetitions / actual repetitions × 100

    A value above 100% indicates over-counting.
    """

    if actual_reps <= 0:
        return 0.0

    return (
        predicted_reps / actual_reps
    ) * 100.0


def calculate_rep_error(
    actual_reps: int,
    predicted_reps: int,
) -> int:

    return abs(
        actual_reps - predicted_reps
    )


# ============================================================
# PROCESS CSV
# ============================================================

def evaluate_dataset(
    csv_path: str,
):

    csv_file = Path(csv_path)

    if not csv_file.exists():

        raise FileNotFoundError(
            f"Ground truth file not found: {csv_file}"
        )

    results = []

    with open(
        csv_file,
        "r",
        newline="",
        encoding="utf-8",
    ) as file:

        reader = csv.DictReader(file)

        required_columns = {
            VIDEO_COLUMN,
            EXERCISE_COLUMN,
            ACTUAL_REPS_COLUMN,
        }

        missing = (
            required_columns
            - set(reader.fieldnames or [])
        )

        if missing:

            raise ValueError(
                "Missing CSV columns: "
                + ", ".join(sorted(missing))
            )

        for row_number, row in enumerate(
            reader,
            start=2,
        ):

            video_path = row[
                VIDEO_COLUMN
            ].strip()

            exercise = row[
                EXERCISE_COLUMN
            ].strip().lower()

            actual_reps = int(
                row[
                    ACTUAL_REPS_COLUMN
                ]
            )

            if exercise not in VALID_EXERCISES:

                print(
                    f"\nSkipping row {row_number}: "
                    f"unsupported exercise "
                    f"'{exercise}'"
                )

                continue

            try:

                (
                    predicted_reps,
                    invalid_reps,
                    frame_count,
                ) = process_video(
                    video_path,
                    exercise,
                )

                rep_error = calculate_rep_error(
                    actual_reps,
                    predicted_reps,
                )

                detection_rate = (
                    calculate_rep_detection_rate(
                        actual_reps,
                        predicted_reps,
                    )
                )

                result = {
                    "video_path": video_path,
                    "exercise": exercise,
                    "actual_reps": actual_reps,
                    "predicted_reps": predicted_reps,
                    "invalid_reps": invalid_reps,
                    "rep_error": rep_error,
                    "detection_rate_pct": detection_rate,
                    "frames": frame_count,
                }

                results.append(result)

            except Exception as exc:

                print()
                print(
                    f"ERROR processing row "
                    f"{row_number}"
                )

                print(
                    f"{type(exc).__name__}: {exc}"
                )

    return results


# ============================================================
# PRINT RESULTS
# ============================================================

def print_results(
    results,
):

    print()
    print()
    print(
        "=========================================================="
    )
    print(
        "              DATASET EVALUATION RESULTS"
    )
    print(
        "=========================================================="
    )

    if not results:

        print(
            "No videos were successfully evaluated."
        )

        return

    total_actual = sum(
        result["actual_reps"]
        for result in results
    )

    total_predicted = sum(
        result["predicted_reps"]
        for result in results
    )

    total_error = sum(
        result["rep_error"]
        for result in results
    )

    # --------------------------------------------------------
    # Overall detection rate
    # --------------------------------------------------------

    if total_actual > 0:

        overall_detection_rate = (
            total_predicted
            / total_actual
        ) * 100.0

    else:

        overall_detection_rate = 0.0

    print(
        f"Videos evaluated       : "
        f"{len(results)}"
    )

    print(
        f"Actual repetitions     : "
        f"{total_actual}"
    )

    print(
        f"Predicted repetitions  : "
        f"{total_predicted}"
    )

    print(
        f"Absolute rep error     : "
        f"{total_error}"
    )

    print(
        f"Detection rate         : "
        f"{overall_detection_rate:.2f}%"
    )

    # --------------------------------------------------------
    # Exercise-wise results
    # --------------------------------------------------------

    print()
    print(
        "Exercise-wise results:"
    )

    exercises = sorted(
        {
            result["exercise"]
            for result in results
        }
    )

    for exercise in exercises:

        exercise_results = [
            result
            for result in results
            if result["exercise"] == exercise
        ]

        actual = sum(
            result["actual_reps"]
            for result in exercise_results
        )

        predicted = sum(
            result["predicted_reps"]
            for result in exercise_results
        )

        if actual > 0:

            rate = (
                predicted
                / actual
            ) * 100.0

        else:

            rate = 0.0

        print(
            f"  {exercise:<15}"
            f"videos={len(exercise_results):<4}"
            f"actual={actual:<5}"
            f"predicted={predicted:<5}"
            f"rate={rate:.2f}%"
        )

    # --------------------------------------------------------
    # Video-wise results
    # --------------------------------------------------------

    print()
    print(
        "Video-wise results:"
    )

    for index, result in enumerate(
        results,
        start=1,
    ):

        print()
        print(
            f"[{index}] "
            f"{Path(result['video_path']).name}"
        )

        print(
            f"    Exercise       : "
            f"{result['exercise']}"
        )

        print(
            f"    Actual reps    : "
            f"{result['actual_reps']}"
        )

        print(
            f"    Predicted reps : "
            f"{result['predicted_reps']}"
        )

        print(
            f"    Rep error      : "
            f"{result['rep_error']}"
        )

        print(
            f"    Detection rate : "
            f"{result['detection_rate_pct']:.2f}%"
        )

    print()
    print(
        "=========================================================="
    )


# ============================================================
# SAVE RESULTS
# ============================================================

def save_results(
    results,
    output_path: str,
):

    if not results:
        return

    with open(
        output_path,
        "w",
        newline="",
        encoding="utf-8",
    ) as file:

        fieldnames = [
            "video_path",
            "exercise",
            "actual_reps",
            "predicted_reps",
            "invalid_reps",
            "rep_error",
            "detection_rate_pct",
            "frames",
        ]

        writer = csv.DictWriter(
            file,
            fieldnames=fieldnames,
        )

        writer.writeheader()

        writer.writerows(
            results
        )

    print()
    print(
        f"Detailed results saved to:"
    )

    print(
        output_path
    )


# ============================================================
# MAIN
# ============================================================

def main():

    current_directory = (
        Path(__file__).resolve().parent
    )

    csv_path = (
        current_directory
        / "ground_truth.csv"
    )

    output_path = (
        current_directory
        / "evaluation_results.csv"
    )

    print()
    print(
        "AI FITNESS TRAINER"
    )

    print(
        "Dataset Evaluation"
    )

    print()
    print(
        f"Ground truth: {csv_path}"
    )

    results = evaluate_dataset(
        str(csv_path)
    )

    print_results(
        results
    )

    save_results(
        results,
        str(output_path),
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()