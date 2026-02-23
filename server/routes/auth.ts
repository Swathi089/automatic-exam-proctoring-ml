import express from "express";
import mongoose from "mongoose";
import { connectDB, Examiner, Student, Exam, StudentExam, Answer, Warning, Recording } from "../db";

const router = express.Router();

// Initialize database connection
connectDB();

// Examiner Signup
router.post("/examiner/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    
    const existingExaminer = await Examiner.findOne({ email });
    if (existingExaminer) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const examiner = new Examiner({ fullName, email, password });
    await examiner.save();

    res.status(201).json({ 
      message: "Examiner registered successfully", 
      examiner: { id: examiner._id, fullName: examiner.fullName, email: examiner.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering examiner", error });
  }
});

// Examiner Login
router.post("/examiner/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const examiner = await Examiner.findOne({ email, password });
    if (!examiner) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ 
      message: "Login successful", 
      examiner: { id: examiner._id, fullName: examiner.fullName, email: examiner.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

// Student Signup
router.post("/student/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const student = new Student({ fullName, email, password });
    await student.save();

    res.status(201).json({ 
      message: "Student registered successfully", 
      student: { id: student._id, fullName: student.fullName, email: student.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering student", error });
  }
});

// Student Login
router.post("/student/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const student = await Student.findOne({ email, password });
    if (!student) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ 
      message: "Login successful", 
      student: { id: student._id, fullName: student.fullName, email: student.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

// Create Exam (Examiner)
router.post("/exam", async (req, res) => {
  try {
    const { examinerId, title, description } = req.body;
    
    const exam = new Exam({ 
      examinerId: examinerId ? new mongoose.Types.ObjectId(examinerId) : undefined, 
      title, 
      description 
    });
    await exam.save();

    res.status(201).json({ message: "Exam created successfully", exam });
  } catch (error) {
    res.status(500).json({ message: "Error creating exam", error });
  }
});

// Get all exams
router.get("/exams", async (req, res) => {
  try {
    const exams = await Exam.find({}).sort({ createdAt: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching exams", error });
  }
});

// Get all exams for examiner
router.get("/exams/:examinerId", async (req, res) => {
  try {
    const exams = await Exam.find({ examinerId: new mongoose.Types.ObjectId(req.params.examinerId) }).sort({ createdAt: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching exams", error });
  }
});

// Start Student Exam Session
router.post("/student-exam/start", async (req, res) => {
  try {
    const { examId, studentId, webcamStatus } = req.body;
    
    const studentExam = new StudentExam({ 
      examId: new mongoose.Types.ObjectId(examId), 
      studentId: new mongoose.Types.ObjectId(studentId), 
      status: "active",
      webcamStatus: webcamStatus || "on"
    });
    await studentExam.save();

    res.status(201).json({ message: "Exam session started", studentExam });
  } catch (error) {
    res.status(500).json({ message: "Error starting exam session", error });
  }
});

// Update Student Exam Status
router.put("/student-exam/:id", async (req, res) => {
  try {
    const { status, webcamStatus, warnings } = req.body;
    const studentExam = await StudentExam.findByIdAndUpdate(
      req.params.id,
      { status, webcamStatus, warnings },
      { new: true }
    );
    res.json(studentExam);
  } catch (error) {
    res.status(500).json({ message: "Error updating exam session", error });
  }
});

// Submit Answer
router.post("/answer", async (req, res) => {
  try {
    const { studentExamId, questionId, questionText, answerText, isCorrect, marks } = req.body;
    
    const answer = new Answer({ 
      studentExamId: new mongoose.Types.ObjectId(studentExamId), 
      questionId, 
      questionText, 
      answerText,
      isCorrect: isCorrect || false,
      marks: marks || 0
    });
    await answer.save();

    res.status(201).json({ message: "Answer submitted", answer });
  } catch (error) {
    res.status(500).json({ message: "Error submitting answer", error });
  }
});

// Get Answers for Student Exam
router.get("/answers/:studentExamId", async (req, res) => {
  try {
    const answers = await Answer.find({ studentExamId: new mongoose.Types.ObjectId(req.params.studentExamId) });
    res.json(answers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching answers", error });
  }
});

// Add Warning
router.post("/warning", async (req, res) => {
  try {
    const { studentExamId, type, description } = req.body;
    
    const warning = new Warning({ 
      studentExamId: new mongoose.Types.ObjectId(studentExamId), 
      type, 
      description 
    });
    await warning.save();

    // Update warning count
    await StudentExam.findByIdAndUpdate(studentExamId, { $inc: { warnings: 1 } });

    res.status(201).json({ message: "Warning added", warning });
  } catch (error) {
    res.status(500).json({ message: "Error adding warning", error });
  }
});

// Get Warnings for Student Exam
router.get("/warnings/:studentExamId", async (req, res) => {
  try {
    const warnings = await Warning.find({ studentExamId: new mongoose.Types.ObjectId(req.params.studentExamId) }).sort({ timestamp: -1 });
    res.json(warnings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching warnings", error });
  }
});

// Start/Stop Recording
router.post("/recording", async (req, res) => {
  try {
    const { studentExamId, examinerId, status } = req.body;
    
    const recording = new Recording({ 
      studentExamId: new mongoose.Types.ObjectId(studentExamId), 
      examinerId: examinerId ? new mongoose.Types.ObjectId(examinerId) : undefined, 
      status,
      startTime: status === "recording" ? new Date() : undefined,
      endTime: status === "stopped" ? new Date() : undefined
    });
    await recording.save();

    res.status(201).json({ message: "Recording updated", recording });
  } catch (error) {
    res.status(500).json({ message: "Error updating recording", error });
  }
});

// Get All Student Exams for Dashboard
router.get("/student-exams/:examId", async (req, res) => {
  try {
    const studentExams = await StudentExam.find({ examId: new mongoose.Types.ObjectId(req.params.examId) })
      .populate("studentId", "fullName email")
      .sort({ createdAt: -1 });
    res.json(studentExams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student exams", error });
  }
});

export default router;
