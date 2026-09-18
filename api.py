from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field

from auth import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from database import (
    create_auth_user,
    create_session,
    create_user,
    get_session,
    get_user,
    get_user_auth_by_identifier,
    get_user_by_email,
    get_user_by_username,
    init_db,
    list_sessions,
    list_user_sessions,
    list_users,
)
from realtime_workout import router as workout_ws_router



# ============================================================
# STARTUP / SHUTDOWN
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    init_db()

    yield


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="AI Fitness Trainer API",
    description=(
        "REST API for the AI Fitness Trainer. "
        "Provides authentication, user management, "
        "workout sessions, and workout history."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ------------------------------------------------------------
# CORS MIDDLEWARE
# ------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workout_ws_router)



# ============================================================
# AUTHENTICATION DEPENDENCY
# ============================================================

security = HTTPBearer(auto_error=False)


def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict | None:
    """
    Extract user from Bearer token if present, otherwise return None.
    """
    if credentials is None:
        return None

    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None or "sub" not in payload:
        return None

    try:
        user_id = int(payload["sub"])
        return get_user(user_id)
    except Exception:
        return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    """
    Require valid Bearer token and return current authenticated user.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token subject.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user(user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


# ============================================================
# REQUEST MODELS
# ============================================================

class CreateUserRequest(BaseModel):

    username: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Unique username",
        examples=["Argha"],
    )


class SignupRequest(BaseModel):

    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Athlete full name",
        examples=["Marcus Vance"],
    )

    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        description="Unique username",
        examples=["marcus"],
    )

    email: str = Field(
        ...,
        min_length=5,
        max_length=100,
        description="Athlete email address",
        examples=["marcus@example.com"],
    )

    password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        description="Account password",
        examples=["securepassword123"],
    )


class LoginRequest(BaseModel):

    username_or_email: str = Field(
        ...,
        min_length=1,
        description="Username or Email",
        examples=["marcus"],
    )

    password: str = Field(
        ...,
        min_length=1,
        description="Account password",
        examples=["securepassword123"],
    )


class CreateSessionRequest(BaseModel):

    exercise_type: str = Field(
        ...,
        description="Exercise type",
        examples=["bicep_curl"],
    )

    total_reps: int = Field(
        ...,
        ge=0,
        description="Number of valid repetitions",
    )

    invalid_reps: int = Field(
        0,
        ge=0,
        description="Number of invalid repetitions",
    )

    form_accuracy_pct: float = Field(
        ...,
        ge=0,
        le=100,
        description="Session form accuracy percentage",
    )

    duration_seconds: float = Field(
        ...,
        ge=0,
        description="Workout duration in seconds",
    )

    user_id: int | None = Field(
        default=None,
        ge=1,
        description="User associated with this workout",
    )


# ============================================================
# ROOT
# ============================================================

@app.get(
    "/",
    tags=["System"],
)
def root():

    return {
        "name": "AI Fitness Trainer API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


# ============================================================
# HEALTH
# ============================================================

@app.get(
    "/health",
    tags=["System"],
)
def health():

    try:

        init_db()

        return {
            "status": "healthy",
            "database": "connected",
        }

    except Exception as exc:

        return {
            "status": "unhealthy",
            "database": str(exc),
        }


# ============================================================
# AUTHENTICATION
# ============================================================

@app.post(
    "/auth/signup",
    tags=["Authentication"],
    status_code=status.HTTP_201_CREATED,
)
def auth_signup(request: SignupRequest):
    """
    Register a new athlete with username, email, full_name, and password.
    """
    username_clean = request.username.strip()
    email_clean = request.email.strip().lower()
    full_name_clean = request.full_name.strip()

    # 1. Validation: check existing username
    existing_user = get_user_by_username(username_clean)
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists.",
        )

    # 2. Validation: check existing email
    existing_email = get_user_by_email(email_clean)
    if existing_email is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered.",
        )

    # 3. Hash password securely with bcrypt
    pw_hash = hash_password(request.password)

    # 4. Create user in database
    user_id = create_auth_user(
        username=username_clean,
        email=email_clean,
        password_hash=pw_hash,
        full_name=full_name_clean,
    )

    user = get_user(user_id)

    # 5. Generate JWT access token
    access_token = create_access_token(
        data={"sub": str(user_id), "username": username_clean}
    )

    return {
        "message": "Athlete registered successfully.",
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@app.post(
    "/auth/login",
    tags=["Authentication"],
)
def auth_login(request: LoginRequest):
    """
    Authenticate an athlete by username or email and password.
    """
    user_auth = get_user_auth_by_identifier(request.username_or_email)

    if user_auth is None or not user_auth.get("password_hash"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password hash
    if not verify_password(request.password, user_auth["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = user_auth["user_id"]
    access_token = create_access_token(
        data={"sub": str(user_id), "username": user_auth["username"]}
    )

    user = get_user(user_id)

    return {
        "message": "Login successful.",
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@app.get(
    "/auth/me",
    tags=["Authentication"],
)
def auth_me(
    current_user: dict = Depends(get_current_user),
):
    """
    Get profile of the currently authenticated athlete.
    """
    return {
        "user": current_user,
    }


@app.post(
    "/auth/logout",
    tags=["Authentication"],
)
def auth_logout():
    """
    Logout athlete and acknowledge session invalidation.
    """
    return {
        "message": "Logged out successfully.",
    }


# ============================================================
# USERS
# ============================================================

@app.post(
    "/users",
    tags=["Users"],
)
def create_new_user(
    request: CreateUserRequest,
):

    try:

        existing = get_user_by_username(
            request.username
        )

        if existing is not None:

            raise HTTPException(
                status_code=409,
                detail=(
                    "Username already exists."
                ),
            )

        user_id = create_user(
            request.username
        )

        return {
            "message": "User created successfully.",
            "user_id": user_id,
            "username": request.username.strip(),
        }

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


@app.get(
    "/users",
    tags=["Users"],
)
def get_all_users():

    try:

        return {
            "users": list_users()
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


@app.get(
    "/users/{user_id}",
    tags=["Users"],
)
def get_single_user(
    user_id: int,
):

    user = get_user(
        user_id
    )

    if user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    return user


# ============================================================
# CREATE SESSION
# ============================================================

@app.post(
    "/sessions",
    tags=["Workout Sessions"],
)
def create_new_session(
    request: CreateSessionRequest,
    current_user: dict | None = Depends(get_current_user_optional),
):

    try:

        # -----------------------------------------------
        # Determine and validate user
        # -----------------------------------------------

        user_id = request.user_id
        if user_id is None and current_user is not None:
            user_id = current_user.get("user_id")

        if user_id is not None:

            user = get_user(
                user_id
            )

            if user is None:

                raise HTTPException(
                    status_code=404,
                    detail=(
                        f"User {user_id} "
                        "does not exist."
                    ),
                )

        # -----------------------------------------------
        # Save session
        # -----------------------------------------------

        session_id = create_session(
            exercise_type=request.exercise_type,
            total_reps=request.total_reps,
            invalid_reps=request.invalid_reps,
            form_accuracy_pct=request.form_accuracy_pct,
            duration_seconds=request.duration_seconds,
            user_id=user_id,
        )

        return {
            "message": "Workout session saved successfully.",
            "session_id": session_id,
            "user_id": user_id,
        }

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# ============================================================
# GET ALL SESSIONS
# ============================================================

@app.get(
    "/sessions",
    tags=["Workout Sessions"],
)
def get_all_sessions(
    limit: int = Query(
        50,
        ge=1,
        le=500,
    ),
):

    try:

        return {
            "sessions": list_sessions(
                limit
            )
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# ============================================================
# GET SINGLE SESSION
# ============================================================

@app.get(
    "/sessions/{session_id}",
    tags=["Workout Sessions"],
)
def get_single_session(
    session_id: int,
):

    session = get_session(
        session_id
    )

    if session is None:

        raise HTTPException(
            status_code=404,
            detail="Workout session not found.",
        )

    return session


# ============================================================
# GET USER WORKOUT HISTORY
# ============================================================

@app.get(
    "/users/{user_id}/sessions",
    tags=["Workout Sessions"],
)
def get_user_workout_history(
    user_id: int,
    limit: int = Query(
        50,
        ge=1,
        le=500,
    ),
    current_user: dict | None = Depends(get_current_user_optional),
):

    # Privacy isolation: If request is authenticated, ensure caller only accesses their own sessions
    if current_user is not None and current_user.get("user_id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You can only view your own workout history.",
        )

    try:

        return {
            "user_id": user_id,
            "sessions": list_user_sessions(
                user_id,
                limit,
            ),
        }

    except ValueError as exc:

        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "api:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
    )