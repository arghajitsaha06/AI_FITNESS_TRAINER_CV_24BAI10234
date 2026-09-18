from __future__ import annotations

import math
from abc import ABC, abstractmethod


# ============================================================
# BASE EXERCISE
# ============================================================

class BaseExercise(ABC):
    """
    Base interface for all exercise trackers.
    """

    def __init__(self):

        self.reps = 0
        self.invalid_reps = 0

        self.state = "START"

        self.feedback = "READY"

        self.form_valid = True

        self.last_angle = None

    @abstractmethod
    def update(self, landmarks):
        """
        Process pose landmarks.

        Every exercise tracker must implement this.
        """
        pass


# ============================================================
# BICEP CURL
# ============================================================

class BicepCurlTracker(BaseExercise):
    """
    Bicep curl repetition and form tracker.

    MediaPipe landmarks:

    Left:
        11 = shoulder
        13 = elbow
        15 = wrist

    Right:
        12 = shoulder
        14 = elbow
        16 = wrist
    """

    def __init__(self):

        super().__init__()

        # -------------------------------
        # REP THRESHOLDS
        # -------------------------------

        self.extended_threshold = 160
        self.contracted_threshold = 45

        # -------------------------------
        # FORM THRESHOLDS
        # -------------------------------

        self.max_elbow_drift = 0.15
        self.min_visibility = 0.50

        # -------------------------------
        # REP STATE
        # -------------------------------

        self.rep_in_progress = False
        self.current_rep_invalid = False

    # --------------------------------------------------------
    # ANGLE CALCULATION
    # --------------------------------------------------------

    def calculate_angle(self, a, b, c):

        ba = (
            a.x - b.x,
            a.y - b.y
        )

        bc = (
            c.x - b.x,
            c.y - b.y
        )

        dot = (
            ba[0] * bc[0]
            +
            ba[1] * bc[1]
        )

        mag_ba = math.sqrt(
            ba[0] ** 2 +
            ba[1] ** 2
        )

        mag_bc = math.sqrt(
            bc[0] ** 2 +
            bc[1] ** 2
        )

        if mag_ba == 0 or mag_bc == 0:
            return None

        cosine = dot / (
            mag_ba * mag_bc
        )

        cosine = max(
            -1.0,
            min(1.0, cosine)
        )

        return math.degrees(
            math.acos(cosine)
        )

    # --------------------------------------------------------
    # VISIBILITY
    # --------------------------------------------------------

    def check_visibility(self, landmarks):

        required = [
            landmarks[11],
            landmarks[13],
            landmarks[15],
            landmarks[12],
            landmarks[14],
            landmarks[16]
        ]

        return all(
            landmark.visibility >= self.min_visibility
            for landmark in required
        )

    # --------------------------------------------------------
    # ELBOW STABILITY
    # --------------------------------------------------------

    def check_elbow_stability(
        self,
        shoulder,
        elbow
    ):

        drift = abs(
            elbow.x -
            shoulder.x
        )

        return drift <= self.max_elbow_drift

    # --------------------------------------------------------
    # UPDATE
    # --------------------------------------------------------

    def update(self, landmarks):

        if landmarks is None or len(landmarks) < 17:

            self.feedback = "NO POSE"
            self.form_valid = False

            return None

        # -------------------------------
        # VISIBILITY
        # -------------------------------

        if not self.check_visibility(landmarks):

            self.feedback = "MOVE INTO CAMERA VIEW"
            self.form_valid = False

            return None

        # -------------------------------
        # LANDMARKS
        # -------------------------------

        left_shoulder = landmarks[11]
        left_elbow = landmarks[13]
        left_wrist = landmarks[15]

        right_shoulder = landmarks[12]
        right_elbow = landmarks[14]
        right_wrist = landmarks[16]

        # -------------------------------
        # ARM ANGLES
        # -------------------------------

        left_angle = self.calculate_angle(
            left_shoulder,
            left_elbow,
            left_wrist
        )

        right_angle = self.calculate_angle(
            right_shoulder,
            right_elbow,
            right_wrist
        )

        if (
            left_angle is None
            or right_angle is None
        ):

            self.feedback = "POSE ERROR"
            self.form_valid = False

            return None

        # Use more contracted arm
        if left_angle <= right_angle:

            angle = left_angle

            shoulder = left_shoulder
            elbow = left_elbow

        else:

            angle = right_angle

            shoulder = right_shoulder
            elbow = right_elbow

        self.last_angle = angle

        # -------------------------------
        # ELBOW FORM
        # -------------------------------

        elbow_stable = self.check_elbow_stability(
            shoulder,
            elbow
        )

        if not elbow_stable:

            self.form_valid = False

            if self.rep_in_progress:

                self.current_rep_invalid = True

            self.feedback = "KEEP ELBOW STABLE"

        else:

            self.form_valid = True

        # -------------------------------
        # EXTENDED
        # -------------------------------

        if angle >= self.extended_threshold:

            if self.state == "CONTRACTED":

                if not self.current_rep_invalid:

                    self.reps += 1

                else:

                    self.invalid_reps += 1

            self.state = "EXTENDED"

            self.rep_in_progress = False

            self.current_rep_invalid = False

            if self.form_valid:

                self.feedback = "GOOD FORM"

        # -------------------------------
        # CONTRACTED
        # -------------------------------

        elif angle <= self.contracted_threshold:

            if self.state == "EXTENDED":

                self.rep_in_progress = True

                self.current_rep_invalid = False

            self.state = "CONTRACTED"

            if self.form_valid:

                self.feedback = "GOOD - NOW EXTEND"

        # -------------------------------
        # BETWEEN
        # -------------------------------

        else:

            if self.state == "EXTENDED":

                self.feedback = "CURL FULLY"

            elif self.state == "CONTRACTED":

                self.feedback = "EXTEND FULLY"

        return {
            "angle": angle,
            "reps": self.reps,
            "invalid_reps": self.invalid_reps,
            "state": self.state,
            "form_valid": self.form_valid,
            "feedback": self.feedback
        }


# ============================================================
# SQUAT
# ============================================================

class SquatTracker(BaseExercise):
    """
    Squat repetition and form tracker.

    Left:
        11 = shoulder
        23 = hip
        25 = knee
        27 = ankle

    Right:
        12 = shoulder
        24 = hip
        26 = knee
        28 = ankle
    """

    def __init__(self):

        super().__init__()

        # -------------------------------
        # REP THRESHOLDS
        # -------------------------------

        self.standing_threshold = 165
        self.depth_threshold = 90
        self.movement_threshold = 140

        # -------------------------------
        # FORM
        # -------------------------------

        self.max_torso_angle = 45
        self.min_visibility = 0.50

        # -------------------------------
        # REP STATE
        # -------------------------------

        self.rep_in_progress = False
        self.depth_reached = False
        self.current_rep_invalid = False

    # --------------------------------------------------------
    # ANGLE
    # --------------------------------------------------------

    def calculate_angle(self, a, b, c):

        ba = (
            a.x - b.x,
            a.y - b.y
        )

        bc = (
            c.x - b.x,
            c.y - b.y
        )

        dot = (
            ba[0] * bc[0]
            +
            ba[1] * bc[1]
        )

        mag_ba = math.sqrt(
            ba[0] ** 2 +
            ba[1] ** 2
        )

        mag_bc = math.sqrt(
            bc[0] ** 2 +
            bc[1] ** 2
        )

        if mag_ba == 0 or mag_bc == 0:
            return None

        cosine = dot / (
            mag_ba * mag_bc
        )

        cosine = max(
            -1.0,
            min(1.0, cosine)
        )

        return math.degrees(
            math.acos(cosine)
        )

    # --------------------------------------------------------
    # VISIBILITY
    # --------------------------------------------------------

    def check_visibility(self, landmarks):

        required = [
            landmarks[11],
            landmarks[12],
            landmarks[23],
            landmarks[24],
            landmarks[25],
            landmarks[26],
            landmarks[27],
            landmarks[28]
        ]

        return all(
            landmark.visibility >= self.min_visibility
            for landmark in required
        )

    # --------------------------------------------------------
    # TORSO ANGLE
    # --------------------------------------------------------

    def calculate_torso_angle(
        self,
        shoulder,
        hip
    ):

        dx = shoulder.x - hip.x
        dy = shoulder.y - hip.y

        return math.degrees(
            math.atan2(
                abs(dx),
                abs(dy)
            )
        )

    # --------------------------------------------------------
    # UPDATE
    # --------------------------------------------------------

    def update(self, landmarks):

        if landmarks is None or len(landmarks) < 29:

            self.feedback = "NO POSE"
            self.form_valid = True

            return None

        # -------------------------------
        # VISIBILITY
        # -------------------------------

        if not self.check_visibility(landmarks):

            self.feedback = "MOVE INTO CAMERA VIEW"
            self.form_valid = True

            return None

        # -------------------------------
        # LANDMARKS
        # -------------------------------

        left_shoulder = landmarks[11]
        left_hip = landmarks[23]
        left_knee = landmarks[25]
        left_ankle = landmarks[27]

        right_shoulder = landmarks[12]
        right_hip = landmarks[24]
        right_knee = landmarks[26]
        right_ankle = landmarks[28]

        # -------------------------------
        # KNEE ANGLES
        # -------------------------------

        left_knee_angle = self.calculate_angle(
            left_hip,
            left_knee,
            left_ankle
        )

        right_knee_angle = self.calculate_angle(
            right_hip,
            right_knee,
            right_ankle
        )

        if (
            left_knee_angle is None
            or right_knee_angle is None
        ):

            self.feedback = "POSE ERROR"
            self.form_valid = True

            return None

        knee_angle = min(
            left_knee_angle,
            right_knee_angle
        )

        self.last_angle = knee_angle

        # -------------------------------
        # TORSO
        # -------------------------------

        left_torso = self.calculate_torso_angle(
            left_shoulder,
            left_hip
        )

        right_torso = self.calculate_torso_angle(
            right_shoulder,
            right_hip
        )

        torso_angle = max(
            left_torso,
            right_torso
        )

        # -------------------------------
        # FORM CHECK
        # -------------------------------
        # Torso angle is still calculated, but it does not
        # invalidate the repetition in this simple version.

        self.form_valid = True

        # -------------------------------
        # START DOWNWARD MOVEMENT
        # -------------------------------

        if knee_angle < self.movement_threshold:

            if not self.rep_in_progress:

                self.rep_in_progress = True

                self.depth_reached = False

                self.current_rep_invalid = False

            self.state = "DOWN"

        # -------------------------------
        # DEPTH
        # -------------------------------

        if self.rep_in_progress:

            if knee_angle <= self.depth_threshold:

                self.depth_reached = True

                self.feedback = "GOOD DEPTH"

            elif knee_angle < self.movement_threshold:

                if not self.depth_reached:

                    self.feedback = "GO LOWER"

        # -------------------------------
        # RETURN UP
        # -------------------------------

        if knee_angle >= self.standing_threshold:

            if self.rep_in_progress:

                if self.depth_reached:

                    self.reps += 1

                    self.feedback = "GOOD FORM"

                else:

                    self.feedback = "GO LOWER"

                self.rep_in_progress = False

                self.depth_reached = False

                self.current_rep_invalid = False

            self.state = "UP"

            self.feedback = "GOOD FORM"

        # -------------------------------
        # BETWEEN
        # -------------------------------

        elif knee_angle > self.movement_threshold:

            if self.state == "DOWN":

                if self.depth_reached:

                    self.feedback = "NOW STAND UP"

                else:

                    self.feedback = "GO LOWER"

        return {
            "angle": knee_angle,
            "torso_angle": torso_angle,
            "reps": self.reps,
            "invalid_reps": self.invalid_reps,
            "state": self.state,
            "form_valid": self.form_valid,
            "feedback": self.feedback
        }



# ============================================================
# PUSH-UP
# ============================================================

class PushUpTracker(BaseExercise):
    """
    Push-up repetition and form tracker.

    Recommended camera:
        Side view.

    Left:
        11 = shoulder
        13 = elbow
        15 = wrist
        23 = hip
        27 = ankle

    Right:
        12 = shoulder
        14 = elbow
        16 = wrist
        24 = hip
        28 = ankle

    Rep counting is based primarily on:

        Shoulder -> Elbow -> Wrist

    Body alignment is optional and does not prevent
    repetition counting in the current simple version.
    """

    def __init__(self):

        super().__init__()

        # -------------------------------
        # REP THRESHOLDS
        # -------------------------------

        self.up_threshold = 155
        self.down_threshold = 105

        # -------------------------------
        # BODY FORM
        # -------------------------------

        self.min_body_angle = 160
        self.max_body_angle = 180

        self.min_visibility = 0.50

        # -------------------------------
        # REP STATE
        # -------------------------------

        self.rep_in_progress = False
        self.depth_reached = False
        self.current_rep_invalid = False

    # --------------------------------------------------------
    # ANGLE
    # --------------------------------------------------------

    def calculate_angle(self, a, b, c):

        ba = (
            a.x - b.x,
            a.y - b.y
        )

        bc = (
            c.x - b.x,
            c.y - b.y
        )

        dot = (
            ba[0] * bc[0]
            +
            ba[1] * bc[1]
        )

        mag_ba = math.sqrt(
            ba[0] ** 2 +
            ba[1] ** 2
        )

        mag_bc = math.sqrt(
            bc[0] ** 2 +
            bc[1] ** 2
        )

        if mag_ba == 0 or mag_bc == 0:

            return None

        cosine = dot / (
            mag_ba * mag_bc
        )

        cosine = max(
            -1.0,
            min(1.0, cosine)
        )

        return math.degrees(
            math.acos(cosine)
        )

    # --------------------------------------------------------
    # SELECT BEST ARM
    # --------------------------------------------------------

    def select_best_arm(self, landmarks):

        left_shoulder = landmarks[11]
        left_elbow = landmarks[13]
        left_wrist = landmarks[15]

        right_shoulder = landmarks[12]
        right_elbow = landmarks[14]
        right_wrist = landmarks[16]

        left_score = min(
            left_shoulder.visibility,
            left_elbow.visibility,
            left_wrist.visibility
        )

        right_score = min(
            right_shoulder.visibility,
            right_elbow.visibility,
            right_wrist.visibility
        )

        # -------------------------------
        # LEFT ARM
        # -------------------------------

        if left_score >= right_score:

            if left_score >= self.min_visibility:

                return (
                    left_shoulder,
                    left_elbow,
                    left_wrist,
                    "left"
                )

        # -------------------------------
        # RIGHT ARM
        # -------------------------------

        if right_score >= self.min_visibility:

            return (
                right_shoulder,
                right_elbow,
                right_wrist,
                "right"
            )

        # -------------------------------
        # NO SUFFICIENT ARM VISIBILITY
        # -------------------------------

        return None

    # --------------------------------------------------------
    # BODY ALIGNMENT
    # --------------------------------------------------------

    def calculate_body_angle(
        self,
        landmarks,
        side
    ):

        if side == "left":

            shoulder = landmarks[11]
            hip = landmarks[23]
            ankle = landmarks[27]

        else:

            shoulder = landmarks[12]
            hip = landmarks[24]
            ankle = landmarks[28]

        # Body alignment is optional.
        # If hip/ankle visibility is poor,
        # return None instead of stopping rep detection.

        if (
            shoulder.visibility < self.min_visibility
            or hip.visibility < self.min_visibility
            or ankle.visibility < self.min_visibility
        ):

            return None

        return self.calculate_angle(
            shoulder,
            hip,
            ankle
        )

    # --------------------------------------------------------
    # UPDATE
    # --------------------------------------------------------

    def update(self, landmarks):

        # -------------------------------
        # NO POSE
        # -------------------------------

        if landmarks is None or len(landmarks) < 29:

            self.feedback = "NO POSE"
            self.form_valid = False

            return None

        # -------------------------------
        # SELECT BEST ARM
        # -------------------------------

        arm_data = self.select_best_arm(
            landmarks
        )

        if arm_data is None:

            self.feedback = (
                "MOVE INTO CAMERA VIEW"
            )

            self.form_valid = False

            return None

        (
            shoulder,
            elbow,
            wrist,
            side
        ) = arm_data

        # -------------------------------
        # ELBOW ANGLE
        # -------------------------------

        elbow_angle = self.calculate_angle(
            shoulder,
            elbow,
            wrist
        )

        if elbow_angle is None:

            self.feedback = "POSE ERROR"
            self.form_valid = False

            return None

        self.last_angle = elbow_angle

        # -------------------------------
        # BODY ALIGNMENT
        # -------------------------------

        body_angle = self.calculate_body_angle(
            landmarks,
            side
        )

        # ------------------------------------------------
        # IMPORTANT:
        #
        # Body alignment is NOT required for
        # rep counting.
        #
        # It is only used for feedback.
        # ------------------------------------------------

        if body_angle is None:

            self.form_valid = True

        else:

            self.form_valid = (
                self.min_body_angle
                <= body_angle
                <= self.max_body_angle
            )

        # -------------------------------
        # DOWN
        # -------------------------------

        if elbow_angle <= self.down_threshold:

            if not self.rep_in_progress:

                self.rep_in_progress = True

                self.depth_reached = False

                self.current_rep_invalid = False

            self.depth_reached = True

            self.state = "DOWN"

            self.feedback = "GOOD DEPTH"

        # -------------------------------
        # UP
        # -------------------------------

        elif elbow_angle >= self.up_threshold:

            if self.rep_in_progress:

                if self.depth_reached:

                    # -----------------------------------
                    # COMPLETE REP
                    # -----------------------------------
                    #
                    # Current simple version:
                    # body form does not invalidate reps.
                    #

                    self.reps += 1

                self.rep_in_progress = False

                self.depth_reached = False

                self.current_rep_invalid = False

            self.state = "UP"

            self.feedback = "GOOD FORM"

        # -------------------------------
        # BETWEEN
        # -------------------------------

        else:

            if self.state == "UP":

                self.feedback = "GO LOWER"

            elif self.state == "DOWN":

                self.feedback = "PUSH UP"

        # -------------------------------
        # BODY FORM FEEDBACK
        # -------------------------------
        #
        # Only show warning when body angle
        # is available.
        #
        # It DOES NOT affect rep counting.
        # -------------------------------

        if (
            body_angle is not None
            and not self.form_valid
        ):

            self.feedback = (
                "KEEP BODY STRAIGHT"
            )

        # -------------------------------
        # RESULT
        # -------------------------------

        return {
            "angle": elbow_angle,
            "body_angle": body_angle,
            "reps": self.reps,
            "invalid_reps": self.invalid_reps,
            "state": self.state,
            "form_valid": self.form_valid,
            "feedback": self.feedback
        }

# ============================================================
# EXERCISE FACTORY
# ============================================================

class ExerciseFactory:
    """
    Creates the appropriate exercise tracker.
    """

    @staticmethod
    def create(exercise_name):

        exercise_name = (
            exercise_name
            .lower()
            .strip()
        )

        # -------------------------------
        # BICEP CURL
        # -------------------------------

        if exercise_name in {
            "bicep",
            "bicep_curl",
            "bicep curl"
        }:

            return BicepCurlTracker()

        # -------------------------------
        # SQUAT
        # -------------------------------

        if exercise_name in {
            "squat",
            "squats"
        }:

            return SquatTracker()

        # -------------------------------
        # PUSH-UP
        # -------------------------------

        if exercise_name in {
            "pushup",
            "push_up",
            "push-up",
            "push up"
        }:

            return PushUpTracker()

        # -------------------------------
        # UNKNOWN
        # -------------------------------

        raise ValueError(
            f"Unsupported exercise: {exercise_name}"
        )