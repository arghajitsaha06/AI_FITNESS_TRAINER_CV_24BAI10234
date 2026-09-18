from __future__ import annotations

import requests


class FitnessAPIClient:
    """
    Python client for the AI Fitness Trainer FastAPI backend.
    """

    def __init__(
        self,
        base_url: str = "http://127.0.0.1:8000",
        timeout: float = 10.0,
    ):

        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    # ========================================================
    # HEALTH
    # ========================================================

    def health_check(self):

        response = requests.get(
            f"{self.base_url}/health",
            timeout=self.timeout,
        )

        response.raise_for_status()

        return response.json()

    # ========================================================
    # USERS
    # ========================================================

    def get_users(self):

        response = requests.get(
            f"{self.base_url}/users",
            timeout=self.timeout,
        )

        response.raise_for_status()

        data = response.json()

        return data.get(
            "users",
            [],
        )

    def get_user(
        self,
        user_id: int,
    ):

        response = requests.get(
            f"{self.base_url}/users/{user_id}",
            timeout=self.timeout,
        )

        response.raise_for_status()

        return response.json()

    def create_user(
        self,
        username: str,
    ):

        response = requests.post(
            f"{self.base_url}/users",
            json={
                "username": username,
            },
            timeout=self.timeout,
        )

        response.raise_for_status()

        return response.json()

    # ========================================================
    # SESSIONS
    # ========================================================

    def create_session(
        self,
        exercise_type: str,
        total_reps: int,
        invalid_reps: int,
        form_accuracy_pct: float,
        duration_seconds: float,
        user_id: int | None = None,
    ):

        payload = {
            "exercise_type": exercise_type,
            "total_reps": total_reps,
            "invalid_reps": invalid_reps,
            "form_accuracy_pct": form_accuracy_pct,
            "duration_seconds": duration_seconds,
            "user_id": user_id,
        }

        response = requests.post(
            f"{self.base_url}/sessions",
            json=payload,
            timeout=self.timeout,
        )

        response.raise_for_status()

        return response.json()

    def get_sessions(
        self,
        limit: int = 50,
    ):

        response = requests.get(
            f"{self.base_url}/sessions",
            params={
                "limit": limit,
            },
            timeout=self.timeout,
        )

        response.raise_for_status()

        data = response.json()

        return data.get(
            "sessions",
            [],
        )

    def get_session(
        self,
        session_id: int,
    ):

        response = requests.get(
            f"{self.base_url}/sessions/{session_id}",
            timeout=self.timeout,
        )

        response.raise_for_status()

        return response.json()

    def get_user_sessions(
        self,
        user_id: int,
        limit: int = 50,
    ):

        response = requests.get(
            f"{self.base_url}/users/{user_id}/sessions",
            params={
                "limit": limit,
            },
            timeout=self.timeout,
        )

        response.raise_for_status()

        data = response.json()

        return data.get(
            "sessions",
            [],
        )