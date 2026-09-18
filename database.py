from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone

from config import DATABASE_PATH


# ============================================================
# DATABASE CONNECTION
# ============================================================

@contextmanager
def get_connection():
    conn = sqlite3.connect(DATABASE_PATH)

    conn.row_factory = sqlite3.Row

    try:
        yield conn
        conn.commit()

    except Exception:
        conn.rollback()
        raise

    finally:
        conn.close()


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

def init_db():
    """
    Create all required database tables.
    """

    with get_connection() as conn:

        # ----------------------------------------------------
        # USERS
        # ----------------------------------------------------

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                created_at TEXT NOT NULL
            )
            """
        )

        # Non-destructive schema migration for auth fields
        existing_cols = {
            col_info[1]
            for col_info in conn.execute("PRAGMA table_info(users)").fetchall()
        }

        if "email" not in existing_cols:
            conn.execute("ALTER TABLE users ADD COLUMN email TEXT")

        if "password_hash" not in existing_cols:
            conn.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")

        if "full_name" not in existing_cols:
            conn.execute("ALTER TABLE users ADD COLUMN full_name TEXT")

        # ----------------------------------------------------
        # WORKOUT SESSIONS
        # ----------------------------------------------------

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS workout_sessions (
                session_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                exercise_type TEXT NOT NULL,
                total_reps INTEGER NOT NULL DEFAULT 0,
                invalid_reps INTEGER NOT NULL DEFAULT 0,
                form_accuracy_pct REAL,
                duration_seconds REAL,
                timestamp TEXT NOT NULL,

                FOREIGN KEY (user_id)
                    REFERENCES users(user_id)
            )
            """
        )


# ============================================================
# USER OPERATIONS
# ============================================================

def create_user(username: str) -> int:
    """
    Create a new user and return the generated user ID.
    """

    username = username.strip()

    if not username:
        raise ValueError(
            "Username cannot be empty."
        )

    with get_connection() as conn:

        cur = conn.execute(
            """
            INSERT INTO users (
                username,
                created_at
            )
            VALUES (?, ?)
            """,
            (
                username,
                datetime.now(
                    timezone.utc
                ).isoformat(),
            ),
        )

        return int(cur.lastrowid)


def create_auth_user(
    username: str,
    email: str,
    password_hash: str,
    full_name: str,
) -> int:
    """
    Create a new authenticated user with email, password_hash, and full_name.
    """
    username = username.strip()
    email = email.strip().lower()
    full_name = full_name.strip()

    if not username:
        raise ValueError("Username cannot be empty.")

    if not email:
        raise ValueError("Email cannot be empty.")

    with get_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO users (
                username,
                email,
                password_hash,
                full_name,
                created_at
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                username,
                email,
                password_hash,
                full_name,
                datetime.now(timezone.utc).isoformat(),
            ),
        )

        return int(cur.lastrowid)


def get_user(user_id: int):
    """
    Get one user by ID (excludes password_hash for safety).
    """

    with get_connection() as conn:

        row = conn.execute(
            """
            SELECT
                user_id,
                username,
                email,
                full_name,
                created_at
            FROM users
            WHERE user_id = ?
            """,
            (user_id,),
        ).fetchone()

        if row is None:
            return None

        return dict(row)


def get_user_by_username(username: str):
    """
    Find a user by username.
    """

    with get_connection() as conn:

        row = conn.execute(
            """
            SELECT
                user_id,
                username,
                email,
                full_name,
                created_at
            FROM users
            WHERE LOWER(username) = ?
            """,
            (username.strip().lower(),),
        ).fetchone()

        if row is None:
            return None

        return dict(row)


def get_user_by_email(email: str):
    """
    Find a user by email address.
    """

    with get_connection() as conn:

        row = conn.execute(
            """
            SELECT
                user_id,
                username,
                email,
                full_name,
                created_at
            FROM users
            WHERE LOWER(email) = ?
            """,
            (email.strip().lower(),),
        ).fetchone()

        if row is None:
            return None

        return dict(row)


def get_user_auth_by_identifier(identifier: str):
    """
    Find a user by username OR email, including password_hash for credential validation.
    """

    identifier_clean = identifier.strip().lower()

    with get_connection() as conn:

        row = conn.execute(
            """
            SELECT
                user_id,
                username,
                email,
                full_name,
                password_hash,
                created_at
            FROM users
            WHERE LOWER(username) = ? OR LOWER(email) = ?
            """,
            (identifier_clean, identifier_clean),
        ).fetchone()

        if row is None:
            return None

        return dict(row)


def list_users():
    """
    Return all users.
    """

    with get_connection() as conn:

        rows = conn.execute(
            """
            SELECT
                user_id,
                username,
                email,
                full_name,
                created_at
            FROM users
            ORDER BY user_id ASC
            """
        ).fetchall()

        return [
            dict(row)
            for row in rows
        ]


# ============================================================
# SESSION OPERATIONS
# ============================================================

def create_session(
    exercise_type: str,
    total_reps: int,
    invalid_reps: int,
    form_accuracy_pct: float,
    duration_seconds: float,
    user_id: int | None = None,
) -> int:
    """
    Save a completed workout session.
    """

    if user_id is not None:

        user = get_user(user_id)

        if user is None:

            raise ValueError(
                f"User with ID {user_id} does not exist."
            )

    with get_connection() as conn:

        cur = conn.execute(
            """
            INSERT INTO workout_sessions (
                user_id,
                exercise_type,
                total_reps,
                invalid_reps,
                form_accuracy_pct,
                duration_seconds,
                timestamp
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                exercise_type,
                int(total_reps),
                int(invalid_reps),
                float(form_accuracy_pct),
                float(duration_seconds),
                datetime.now(
                    timezone.utc
                ).isoformat(),
            ),
        )

        return int(cur.lastrowid)


def get_session(session_id: int):
    """
    Get one workout session.
    """

    with get_connection() as conn:

        row = conn.execute(
            """
            SELECT
                ws.session_id,
                ws.user_id,
                u.username,
                ws.exercise_type,
                ws.total_reps,
                ws.invalid_reps,
                ws.form_accuracy_pct,
                ws.duration_seconds,
                ws.timestamp
            FROM workout_sessions ws
            LEFT JOIN users u
                ON ws.user_id = u.user_id
            WHERE ws.session_id = ?
            """,
            (session_id,),
        ).fetchone()

        if row is None:
            return None

        return dict(row)


def list_sessions(
    limit: int = 50,
):
    """
    Return recent workout sessions.
    """

    limit = max(
        1,
        min(int(limit), 500),
    )

    with get_connection() as conn:

        rows = conn.execute(
            """
            SELECT
                ws.session_id,
                ws.user_id,
                u.username,
                ws.exercise_type,
                ws.total_reps,
                ws.invalid_reps,
                ws.form_accuracy_pct,
                ws.duration_seconds,
                ws.timestamp
            FROM workout_sessions ws
            LEFT JOIN users u
                ON ws.user_id = u.user_id
            ORDER BY ws.session_id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()

        return [
            dict(row)
            for row in rows
        ]


def list_user_sessions(
    user_id: int,
    limit: int = 50,
):
    """
    Return workout history for one user.
    """

    user = get_user(user_id)

    if user is None:

        raise ValueError(
            f"User with ID {user_id} does not exist."
        )

    limit = max(
        1,
        min(int(limit), 500),
    )

    with get_connection() as conn:

        rows = conn.execute(
            """
            SELECT
                ws.session_id,
                ws.user_id,
                u.username,
                ws.exercise_type,
                ws.total_reps,
                ws.invalid_reps,
                ws.form_accuracy_pct,
                ws.duration_seconds,
                ws.timestamp
            FROM workout_sessions ws
            LEFT JOIN users u
                ON ws.user_id = u.user_id
            WHERE ws.user_id = ?
            ORDER BY ws.session_id DESC
            LIMIT ?
            """,
            (
                user_id,
                limit,
            ),
        ).fetchall()

        return [
            dict(row)
            for row in rows
        ]