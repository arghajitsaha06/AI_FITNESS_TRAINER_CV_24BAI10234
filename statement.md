# Project Statement — AI Fitness Trainer

## Problem Statement

People performing exercises without continuous supervision may find it difficult to count repetitions consistently and maintain a controlled movement range. Manual counting also provides no automatic record of completed sessions. This project addresses the problem with a webcam-based computer-vision system that detects body pose, calculates joint angles, tracks exercise movement states, counts repetitions, and stores workout sessions.

## Scope

The current implementation focuses on local webcam/video input and three supported exercises:

- Bicep Curl
- Squat
- Push-Up

The system includes pose estimation, kinematic analysis, finite-state-machine repetition tracking, real-time feedback, authentication, user-specific workout history, and SQLite persistence.

## Target Users

- Students and individual fitness learners
- People exercising at home or without continuous trainer supervision
- Developers/learners exploring practical computer vision and real-time web applications

## High-Level Features

1. Webcam-based real-time exercise monitoring
2. MediaPipe Pose Landmarker with 33 body landmarks
3. Joint-angle based movement analysis
4. Exercise-specific finite-state-machine repetition counting
5. Real-time WebSocket telemetry
6. User registration and login with password hashing and JWT authentication
7. Workout session persistence in SQLite
8. User-specific workout history
9. Browser dashboard, workout selection, live workout, history, and profile views
10. FastAPI Swagger/OpenAPI documentation
11. Automated tests for core database import and kinematic angle calculations
12. Offline validation benchmark support using a public multi-view fitness video dataset

## Technology Stack

- Python, FastAPI, Uvicorn
- OpenCV, MediaPipe, NumPy
- SQLite
- React, Vite, Tailwind CSS
- WebSocket
- Pytest
