# 🎓 AI-Powered Online Exam Proctoring System

> A full-stack AI-based online examination monitoring platform designed to ensure secure, fair, and intelligent remote assessments using real-time webcam surveillance, AI cheating detection, and automated warning systems.

---

# 📌 Table of Contents

- Introduction
- Objectives
- Key Features
- System Architecture
- Technologies Used
- AI Models & Algorithms
- YOLOv8 Training & Optimization
- Workflow
- Database Design
- API Endpoints
- Installation Guide
- Running the Project
- Folder Structure
- Security Features
- Testing
- Future Enhancements
- Challenges Faced
- Conclusion
- Author
- License

---

# 📖 Introduction

The **AI-Powered Online Exam Proctoring System** is an intelligent examination platform developed to conduct secure online examinations while monitoring students using Artificial Intelligence.

The system continuously observes students through their webcam and detects suspicious activities such as:

- Multiple person presence
- Mobile phone usage
- Tab switching
- Unauthorized behavior
- Suspicious movement

When suspicious activity is detected:
- Warnings are generated
- Warning data is stored in MongoDB
- Students are notified instantly
- Exams auto-submit after repeated violations

This project combines:
- Artificial Intelligence
- Computer Vision
- Web Development
- Real-Time Monitoring
- Database Management

to create a secure and scalable online examination environment.

---

# 🎯 Objectives

The primary objectives of the project are:

- Conduct secure online examinations
- Prevent cheating using AI
- Monitor students in real time
- Generate automatic warnings
- Reduce manual invigilation
- Store monitoring logs
- Improve integrity in online assessments
- Automate suspicious activity tracking

---

# ✨ Key Features

# 👨‍🎓 Student Features

- Student Login
- Online Exam Interface
- Live Webcam Monitoring
- Timer-Based Examination
- Automatic Answer Saving
- Question Navigation
- Real-Time Warning Notifications
- Automatic Exam Submission

---

# 👨‍💼 Examiner/Admin Features

- Create and Manage Exams
- Add Questions and Options
- Monitor Student Sessions
- Track Warnings
- View AI Detection Logs
- Manage Exam Sessions

---

# 🤖 AI Monitoring Features

- Human Detection
- Multiple Human Detection
- Mobile Phone Detection
- Suspicious Activity Detection
- Real-Time AI Monitoring
- AI Status Tracking
- Automated Warning Generation
- Auto Exam Submission

---

# 🏗 System Architecture

```text id="u7ux8e"
+----------------------+
|      Frontend        |
|  React + TypeScript  |
+----------+-----------+
           |
           v
+----------------------+
|      Backend         |
| Node.js + Express.js |
+----------+-----------+
           |
           v
+----------------------+
|      MongoDB         |
|   Database Storage   |
+----------------------+

           ^
           |
+----------------------+
|   Flask AI Server    |
| OpenCV + YOLOv8 AI   |
+----------------------+
```

---

# 🛠 Technologies Used

# Frontend Technologies

| Technology | Purpose |
|---|---|
| React.js | UI Development |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| Vite | Frontend Build Tool |
| React Router DOM | Navigation |
| Lucide React | Icons |

---

# Backend Technologies

| Technology | Purpose |
|---|---|
| Node.js | Runtime Environment |
| Express.js | Backend Framework |
| MongoDB | Database |
| Mongoose | MongoDB ODM |

---

# AI & Machine Learning Technologies

| Technology | Purpose |
|---|---|
| Python | AI Backend |
| Flask | AI API Server |
| OpenCV | Image Processing |
| YOLOv8 | Object Detection |
| CNN | Feature Extraction |
| Torch | Deep Learning Backend |

---
# Dataset
Online Proctoring System Model 
https://universe.roboflow.com/project-2morrow-software-limited/online-proctoring-system-x27ou

# 🤖 AI Models and Algorithms Used

# 1️⃣ YOLOv8 (You Only Look Once Version 8)

## Purpose

YOLOv8 is used for:
- Human Detection
- Mobile Phone Detection
- Object Detection
- Real-Time Monitoring

---

## Why YOLOv8?

YOLOv8 is selected because it provides:

- Real-time detection
- High accuracy
- Fast inference speed
- Lightweight architecture
- Efficient webcam processing

This makes it highly suitable for:
- Online exam monitoring
- AI-based proctoring
- Real-time cheating detection

---

# 2️⃣ CNN (Convolutional Neural Network)

YOLOv8 internally uses a Deep Convolutional Neural Network (CNN).

## Purpose

CNN is responsible for:
- Feature extraction
- Pattern recognition
- Image understanding
- Object classification

---

# 3️⃣ OpenCV Algorithms

## Purpose

OpenCV is used for:
- Capturing webcam frames
- Image preprocessing
- Frame conversion
- Real-time image handling

---

# 4️⃣ Browser Visibility API

## Purpose

Used to detect:
- Tab switching
- Browser minimize
- Window switching

## Logic

```javascript id="cszj8r"
document.hidden
```

---

# 5️⃣ Rule-Based Warning Algorithm

## Purpose

Generate warnings for suspicious activities.

## Conditions

```python id="bjlwmz"
if humans_detected > 1:
    cheating = True

if mobile_detected:
    cheating = True
```

---

# 6️⃣ Threshold-Based Auto Submission

## Logic

```python id="z9u4gv"
if warnings >= 3:
    submit_exam()
```

---

# 🧠 YOLOv8 Training and Optimization

# YOLOv8 Deep Learning Architecture

The AI detection system uses **YOLOv8**, a state-of-the-art deep learning model for real-time object detection.

YOLOv8 processes webcam frames and detects:
- Humans
- Mobile phones
- Suspicious objects

in real time.

---

# ⚙️ Training Mechanism

YOLOv8 learns using a process called **Backpropagation**.

During training:

1. The input image is passed through the neural network
2. The model predicts objects
3. Prediction error (loss) is calculated
4. Backpropagation computes gradients
5. Optimizer updates model weights
6. The process repeats until high accuracy is achieved

---

# 🔄 Backpropagation

Backpropagation is a supervised learning algorithm used in deep neural networks to reduce prediction error.

It works by:
- Calculating prediction loss
- Propagating errors backward
- Updating network weights

---

# 📉 Optimization Algorithms Used

YOLOv8 uses gradient-based optimization algorithms such as:

## 1️⃣ SGD (Stochastic Gradient Descent)

### Advantages
- Simple
- Efficient
- Good generalization

---

## 2️⃣ Adam Optimizer

### Advantages
- Faster convergence
- Better stability
- Adaptive learning rate

---

# 📌 Final Technical Statement

> YOLOv8 uses backpropagation with gradient-based optimization algorithms such as SGD (Stochastic Gradient Descent) and Adam Optimizer to train its deep convolutional neural network. These optimization techniques help the model minimize prediction error and improve object detection accuracy for real-time human and device detection during online examinations.

---

# 📷 AI Detection Pipeline

```text id="gsyc11"
Webcam Feed
      ↓
Capture Frame
      ↓
Convert to Image
      ↓
Send to Flask API
      ↓
YOLOv8 Detection
      ↓
Analyze Results
      ↓
Generate Warning
      ↓
Store in MongoDB
```

---

# ⚙️ System Workflow

# Step 1 — Student Login

Student logs into the system.

---

# Step 2 — Exam Selection

Student selects an available exam.

---

# Step 3 — Camera Initialization

Browser requests webcam permission.

If denied:
- Exam access is blocked

---

# Step 4 — Exam Session Start

Backend creates:
- Student session
- Monitoring session
- Recording session

---

# Step 5 — AI Monitoring

Every 0.8 seconds:
- Webcam frame captured
- Sent to AI server
- AI checks suspicious activity

---

# Step 6 — Warning Generation

Warnings generated for:
- Multiple humans
- Device detection
- Tab switching

---

# Step 7 — Auto Submission

If warnings reach 3:
- Exam auto-submits automatically

---

# 🗄 Database Design

# Collections Used

## 1️⃣ Exams

Stores:
- Exam title
- Questions
- Correct answers

---

## 2️⃣ Student Exams

Stores:
- Student sessions
- Warnings
- Exam status
- Webcam status

---

## 3️⃣ Answers

Stores:
- Student answers
- Marks
- Correctness

---

## 4️⃣ Warnings

Stores:
- Warning details
- AI detection status
- Timestamp

---

# 📡 API Endpoints

# Exams

## Get All Exams

```http id="q1a5gh"
GET /api/exams
```

---

## Get Single Exam

```http id="u9jww0"
GET /api/exam/:id
```

---

# Student Exam

## Start Exam

```http id="y3m58i"
POST /api/student-exam/start
```

---

## Update Exam

```http id="blnxt4"
PUT /api/student-exam/:id
```

---

# Answers

## Save Answer

```http id="on2zqa"
POST /api/answer
```

---

# Warnings

## Save Warning

```http id="w87i0r"
POST /api/warnings
```

---

# AI Detection API

## Detect Suspicious Activity

```http id="8j16y2"
POST /detect
```

---

# 📂 Project Structure

```bash id="fjlwmg"
project-root/
│
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── routes/
│   ├── models/
│   ├── db.ts
│   ├── server.ts
│   └── package.json
│
├── ai-detection/
│   ├── app.py
│   ├── behavioral_proctoring.py
│   ├── requirements.txt
│   └── model/
│
└── README.md
```

---

# 💻 Installation Guide

# Step 1 — Clone Repository

```bash id="dvl0j8"
git clone <repository-url>
cd project-folder
```

---

# Step 2 — Install Frontend Dependencies

```bash id="bpj5nh"
cd client
npm install
```

---

# Step 3 — Install Backend Dependencies

```bash id="2eqp24"
cd ../server
npm install
```

---

# Step 4 — Install AI Dependencies

```bash id="6x8o8v"
cd ../ai-detection
pip install -r requirements.txt
```

---

# 🔑 Environment Variables

# Frontend `.env`

```env id="w4qqjt"
VITE_AI_DETECT_URL=http://localhost:5000/detect
```

---

# Backend `.env`

```env id="tlv36l"
PORT=8080
MONGO_URI=your_mongodb_connection_string
```

---

# ▶️ Running the Project

# Step 1 — Start MongoDB

Ensure MongoDB is running locally.

---

# Step 2 — Start Backend Server

```bash id="pqv6j7"
cd server
npm run dev
```

Backend runs on:

```bash id="03l5l2"
http://localhost:8080
```

---

# Step 3 — Start AI Flask Server

```bash id="5mvhnd"
cd ai-detection
python app.py
```

Flask runs on:

```bash id="spx1ya"
http://localhost:5000
```

---

# Step 4 — Start Frontend

```bash id="j77xaq"
cd client
npm run dev
```

Frontend runs on:

```bash id="r5a6hm"
http://localhost:5173
```

---

# 🔒 Security Features

- Webcam Monitoring
- AI-Based Detection
- Tab Switch Detection
- Automatic Warning System
- Auto Submission
- Session Tracking
- Real-Time Monitoring

---

# 🧪 Testing

# Test Cases

- Camera permission
- AI detection
- Mobile detection
- Multiple human detection
- Warning generation
- Auto submission
- Timer functionality
- Answer saving

---

# 🚀 Future Enhancements

- Face Recognition
- Eye Tracking
- Audio Monitoring
- Emotion Detection
- Live Examiner Streaming
- Screen Activity Monitoring
- Advanced Analytics Dashboard

---

# ⚠️ Challenges Faced

- Real-time AI integration
- Webcam synchronization
- React + Flask communication
- Managing detection latency
- MongoDB schema handling
- AI response optimization

---

# 📈 Conclusion

The AI-Powered Online Exam Proctoring System successfully integrates Artificial Intelligence with modern web technologies to create a secure and efficient online examination platform.

The project demonstrates:
- AI integration
- Computer Vision
- Full-stack development
- Real-time monitoring
- Database management

This system significantly improves the integrity, reliability, and fairness of online examinations.

# 📄 License

This project is developed for educational and academic purposes.