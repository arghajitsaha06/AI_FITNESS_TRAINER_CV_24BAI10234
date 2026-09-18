# AI Fitness Trainer

## A Computer Vision Based Real-Time Exercise Monitoring System

---

## 1. Project Description

AI Fitness Trainer is a computer-vision-based application that monitors exercise movements using a webcam.

The system detects human body landmarks using **MediaPipe Pose Landmarker**, calculates joint angles, and uses exercise-specific movement logic to count repetitions and provide real-time feedback.

The current system supports:

* Bicep Curl
* Squat
* Push-Up

The application also provides:

* User authentication
* Workout-session storage
* Workout history
* Athlete profile
* Real-time workout monitoring
* REST APIs
* WebSocket communication
* SQLite database integration

---

## 2. Main Technologies

* **Programming Language:** Python
* **Backend:** FastAPI
* **Frontend:** React.js
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **Computer Vision:** OpenCV
* **Pose Estimation:** MediaPipe Pose Landmarker
* **Real-Time Communication:** WebSocket
* **Database:** SQLite
* **Testing:** Pytest
* **API Documentation:** Swagger / OpenAPI
* **Version Control:** Git / GitHub

---

## 3. Main Components

### Backend

The backend is responsible for:

* API handling
* Authentication
* Webcam frame processing
* Pose detection
* Joint-angle calculation
* Exercise analysis
* Repetition counting
* Real-time WebSocket communication
* Workout-session storage

### Frontend

The frontend provides:

* Login
* Signup
* Dashboard
* Exercise selection
* Live workout monitoring
* Workout summary
* Workout history
* Athlete profile
* Settings

### Database

SQLite is used to store:

* User information
* Workout sessions
* Exercise type
* Repetition count
* Invalid repetitions
* Session duration
* Workout timestamps

---

## 4. Computer Vision Pipeline

The main processing pipeline is:

```text
Webcam
   ↓
Frame Capture
   ↓
React Web Application
   ↓
WebSocket
   ↓
FastAPI Backend
   ↓
MediaPipe Pose Landmarker
   ↓
33 Body Landmarks
   ↓
Joint-Angle Calculation
   ↓
Exercise Engine
   ↓
Finite State Machine
   ↓
Repetition Count + Feedback
   ↓
Workout Session Storage
   ↓
SQLite Database
```

---

## 5. Pose Detection

MediaPipe Pose Landmarker is used for human pose estimation.

The model provides **33 body landmarks**.

Each detected landmark contains positional information that can be used for movement analysis.

The application selects the required landmarks for each exercise and uses them for joint-angle calculations.

The required model is located at:

```text
models/pose_landmarker_full.task
```

---

## 6. Joint-Angle Calculation

The system calculates joint angles using three body landmarks.

For three points A, B, and C, the angle at point B is calculated using:

```text
BA = A - B
BC = C - B
```

The angle is calculated using the dot-product formula:

```text
θ = arccos((BA · BC) / (|BA| |BC|)) × 180/π
```

The calculated angle is then passed to the exercise-specific logic.

This allows the system to represent body movement using measurable geometric values.

---

## 7. Exercise Detection

The current system supports three exercises.

### Bicep Curl

Landmarks:

```text
Shoulder → Elbow → Wrist
```

Main thresholds:

```text
Extended   ≥ 160°
Contracted ≤ 45°
```

The system monitors the elbow angle and also checks elbow movement relative to the shoulder.

A repetition is counted after the required movement cycle is completed.

---

### Squat

Landmarks:

```text
Hip → Knee → Ankle
```

Main thresholds:

```text
Standing position ≈ ≥ 165°
Squat depth      ≈ ≤ 90°
```

The system detects the downward movement and counts the repetition when the user returns to the required standing position after reaching the required depth.

---

### Push-Up

Landmarks:

```text
Shoulder → Elbow → Wrist
```

Main thresholds:

```text
Up position   ≈ ≥ 155°
Down position ≈ ≤ 105°
```

The system tracks the visible arm and detects the movement cycle.

---

## 8. Finite State Machine

The repetition-counting logic uses a **Finite State Machine (FSM)**.

The general movement flow is:

```text
STATE 0
EXTENDED / UP
       ↓
Movement Down
       ↓
STATE 1
CONTRACTED / DOWN
       ↓
Movement Up
       ↓
STATE 2
RETURN / REP
       ↓
Repetition Count +1
       ↓
STATE 0
```

A repetition is counted only after the required movement cycle has been completed.

The state-based approach helps reduce accidental multiple counts caused by small frame-to-frame angle changes.

The detailed FSM diagram is available in:

```text
docs/repetition_fsm.png
```

---

## 9. Real-Time Processing

The application uses WebSocket communication for real-time workout processing.

The processing flow is:

```text
Browser Webcam
      ↓
Frame Capture
      ↓
JPEG Encoding
      ↓
WebSocket
      ↓
FastAPI Backend
      ↓
OpenCV Frame Decode
      ↓
MediaPipe Pose Detection
      ↓
Exercise Engine
      ↓
Telemetry
      ↓
WebSocket
      ↓
React Live Workout UI
```

The backend processes incoming frames and sends workout telemetry back to the frontend.

Telemetry can contain information such as:

* Pose detection status
* Exercise type
* Current movement state
* Joint angle
* Repetition count
* Feedback
* FPS/processing information

---

## 10. Authentication

The application provides user authentication.

Supported operations include:

```text
User Registration
User Login
Logout
Protected Routes
Persistent Session
User-Specific Workout History
```

Passwords are handled using password hashing rather than plaintext storage.

Workout sessions are associated with the authenticated user.

---

## 11. Database

The application uses SQLite for local persistent storage.

### USERS

Main fields include:

```text
user_id
username
created_at
```

### WORKOUT_SESSIONS

Main fields include:

```text
session_id
user_id
exercise_type
total_reps
invalid_reps
form_accuracy_pct
duration_seconds
timestamp
```

The `user_id` field connects workout sessions with the authenticated user.

---

## 12. Important Project Files

### `api.py`

FastAPI application and API routing.

### `app.py`

Backend application entry point and application setup.

### `auth.py`

Authentication-related functionality.

### `database.py`

SQLite database initialization and user/workout data operations.

### `exercise_engine.py`

Exercise-specific movement and repetition-counting logic.

### `kinematics.py`

Joint-angle and geometric calculations.

### `pose_detector.py`

MediaPipe Pose Landmarker integration.

### `realtime_workout.py`

Real-time WebSocket workout processing.

### `api_client.py`

API communication support.

### `ui_overlay.py`

Workout visualization and overlay functionality.

### `frontend/`

React/Vite frontend application.

### `models/`

MediaPipe model files.

### `tests/`

Automated Python tests.

### `validation_benchmark/`

Dataset and evaluation-related files.

---

## 13. Model

The project uses the following MediaPipe model:

```text
models/pose_landmarker_full.task
```

This model is required for pose detection.

Make sure the model file is present before running the application.

---

## 14. Installation

### Create Python Virtual Environment

From the project root:

```powershell

python -m venv .venv
```

Activate the environment on Windows:

```powershell

.venv\Scripts\activate
```

For Linux/macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

## 15. Install Backend Dependencies

After activating the Python virtual environment:

```powershell

pip install -r requirements.txt
```

The required Python dependencies are defined in:

```text

requirements.txt
```

---

## 16. Run Backend

From the project root:

```powershell

uvicorn api:app --reload
```
OR

python api.py

The backend should be available at:

```text

http://127.0.0.1:8000
```

FastAPI Swagger/OpenAPI documentation is available at:

```text
http://127.0.0.1:8000/docs
```

---

## 17. Run Frontend

Open a second terminal.

Move to the frontend directory:

```powershell

cd frontend
```

Install frontend dependencies:

```powershell

npm install
```

Start the development server:

```powershell

npm run dev
```

Vite will display the local frontend URL in the terminal.

The application normally runs at:

```text

http://localhost:3000/
```

Open the displayed URL in a modern web browser.

---

## 18. Running the Complete Application

The application normally uses two terminals.

### Terminal 1 — Backend

```powershell
.venv\Scripts\activate
uvicorn api:app --reload
```

### Terminal 2 — Frontend

```powershell
cd frontend
npm install
npm run dev
```

Then open the frontend URL provided by Vite.

For live workout monitoring, allow the browser to access the webcam.

---

## 19. Testing

The project uses **Pytest** for automated testing.

Run the tests from the project root:

```powershell
pytest -v
```

The current automated test suite contains:

```text
3 tests collected
3 passed
```

The tests currently verify:

* Database/module imports
* Straight-angle calculation
* Right-angle calculation

These tests verify selected core functionality and mathematical calculations. They do not represent complete end-to-end coverage of the entire frontend and real-time application.

---

## 20. Dataset

The project uses the following public dataset for offline validation and benchmarking:

```text
A Multi-View Raw Video Dataset of Seven Fitness Exercises
```

The dataset contains multiple exercise categories, subjects, camera views, and exercise-quality folders.

The downloaded structure includes:

```text
abs
back
bicep_curl
push_up
shoulder
squat
tricep
```

The application currently evaluates the exercises supported by the system:

```text
bicep_curl
push_up
squat
```

The dataset is used for validation and verification.

It is **not used to train a custom neural network for this project**.

---

## 21. Evaluation Methodology

For repetition evaluation:

1. Select a reference exercise video.
2. Manually count the actual repetitions.
3. Run the video through the AI Fitness Trainer pipeline.
4. Record the repetitions detected by the system.
5. Compare the detected repetitions with the manually counted ground truth.

The repetition metric is:

```text
Repetition Detection Rate (RDR)

RDR = (Detected Repetitions / Actual Repetitions) × 100%
```

The metric is intended to describe repetition detection performance rather than claim an unsupported overall system accuracy.

---

## 22. Known Limitations

The current system can be affected by:

* Poor lighting
* Body occlusion
* Camera position
* Partial body visibility
* Loose clothing
* Very fast movement
* Incomplete exercise movement
* Extreme camera angles
* Multiple people appearing in the camera frame

If the required movement threshold is not reached, the repetition may not be counted.

Pose detection quality can also decrease when important body landmarks are not clearly visible.

---

## 23. Performance

The application is designed for real-time exercise monitoring with a target of approximately:

```text
30 FPS
```

Actual performance depends on:

* CPU/GPU hardware
* Camera resolution
* Camera frame rate
* Browser performance
* Backend processing load
* Lighting conditions
* Number of running processes

Performance values should be measured during actual experiments rather than assumed from the interface.

---

## 24. Screenshots and Documentation

Application screenshots are available in:

```text
screenshots/
```

The screenshots include:

```text
login.png
signup.png
dashboard.png
exercise_selection.png
live_workout.png
workout_history.png
profile.png
swagger.png
```

Project documentation and diagrams are available in:

```text
docs/
```

Main documentation files include:

```text
docs/AI_Fitness_Trainer_Final_Report.pdf
docs/system_architecture.png
docs/repetition_fsm.png
```

---

## 25. Project Status and Future Scope

### Current Implemented Features

```text
✓ User Authentication
✓ React Frontend
✓ FastAPI Backend
✓ SQLite Database
✓ MediaPipe Pose Detection
✓ Real-Time WebSocket Processing
✓ Bicep Curl Detection
✓ Squat Detection
✓ Push-Up Detection
✓ Joint-Angle Calculation
✓ FSM-Based Repetition Counting
✓ Real-Time Feedback
✓ Workout History
✓ Athlete Profile
✓ Swagger API Documentation
✓ Automated Core Tests
✓ Dataset-Based Validation Workflow
```

### Future Scope

Possible future enhancements include:

* Additional exercise support
* Advanced exercise-form classification
* Machine-learning-based movement quality assessment
* Multi-person tracking
* Voice-based coaching
* Mobile application support
* Cloud-based workout synchronization
* Improved occlusion handling
* Improved camera-angle robustness
* More extensive automated testing
* Personalized workout recommendations

These are future enhancements and are not represented as currently implemented features.

---

## Project Purpose

This project was developed as an academic Computer Vision and software engineering project to demonstrate the integration of:

```text
Computer Vision
       +
Human Pose Estimation
       +
Kinematics
       +
Finite State Machines
       +
Real-Time WebSocket Communication
       +
Web Development
       +
Authentication
       +
Database Management
       +
Software Testing
```

---

## Author

**Name:** ARGHAJIT SAHA

**Roll / Enrollment No.:** 24BAI10234

**Department:** CSE AIML

**Institution:** Vellore Institute of Technology, Bhopal

**Academic Year:** 2026

```
```
