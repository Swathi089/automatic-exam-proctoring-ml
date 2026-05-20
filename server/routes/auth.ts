import express from "express";
import { Student, Examiner, connectDB } from "../db";

const router = express.Router();

let dbConnected = false;
async function ensureDbConnected() {
  if (dbConnected) return;
  await connectDB();
  dbConnected = true;
}

// Student Signup
router.post("/student/signup", async (req, res) => {
  try {
    await ensureDbConnected();
    const { fullName, email, password } = req.body;
    
    // Check if student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const newStudent = new Student({ fullName, email, password });
    await newStudent.save();

    return res.json({ success: true, message: "Registration successful" });
  } catch (error) {
    console.error("Student signup error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Student Login
router.post("/student/login", async (req, res) => {
  try {
    await ensureDbConnected();
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student || student.password !== password) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    return res.json({
      success: true,
      message: "Login successful",
      student: {
        fullName: student.fullName,
        id: student._id
      }
    });
  } catch (error) {
    console.error("Student login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Examiner Signup
router.post("/examiner/signup", async (req, res) => {
  try {
    await ensureDbConnected();
    const { fullName, email, password } = req.body;
    
    // Check if examiner already exists
    const existingExaminer = await Examiner.findOne({ email });
    if (existingExaminer) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const newExaminer = new Examiner({ fullName, email, password });
    await newExaminer.save();

    return res.json({ success: true, message: "Registration successful" });
  } catch (error) {
    console.error("Examiner signup error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Examiner Login
router.post("/examiner/login", async (req, res) => {
  try {
    await ensureDbConnected();
    const { email, password } = req.body;

    const examiner = await Examiner.findOne({ email });
    if (!examiner || examiner.password !== password) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    return res.json({
      success: true,
      message: "Login successful",
      examiner: {
        fullName: examiner.fullName,
        id: examiner._id
      }
    });
  } catch (error) {
    console.error("Examiner login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;