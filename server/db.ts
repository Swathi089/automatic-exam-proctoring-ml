import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/exam-proctor";

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

// Examiner Schema
const examinerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Student Schema
const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Exam Schema
const examSchema = new mongoose.Schema({
  examinerId: { type: mongoose.Schema.Types.ObjectId, ref: "Examiner" },
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ["active", "finished"], default: "active" },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  createdAt: { type: Date, default: Date.now },
});

// Student Exam Session Schema
const studentExamSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  status: { type: String, enum: ["active", "finished"], default: "active" },
  webcamStatus: { type: String, enum: ["on", "off"], default: "off" },
  warnings: { type: Number, default: 0 },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  createdAt: { type: Date, default: Date.now },
});

// Answer Schema
const answerSchema = new mongoose.Schema({
  studentExamId: { type: mongoose.Schema.Types.ObjectId, ref: "StudentExam" },
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  answerText: { type: String },
  isCorrect: { type: Boolean, default: false },
  marks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Warning Schema
const warningSchema = new mongoose.Schema({
  studentExamId: { type: mongoose.Schema.Types.ObjectId, ref: "StudentExam" },
  type: { type: String, required: true },
  description: String,
  timestamp: { type: Date, default: Date.now },
});

// Recording Schema
const recordingSchema = new mongoose.Schema({
  studentExamId: { type: mongoose.Schema.Types.ObjectId, ref: "StudentExam" },
  examinerId: { type: mongoose.Schema.Types.ObjectId, ref: "Examiner" },
  status: { type: String, enum: ["recording", "stopped"], default: "stopped" },
  startTime: Date,
  endTime: Date,
  createdAt: { type: Date, default: Date.now },
});

// Export models
export const Examiner = mongoose.models.Examiner || mongoose.model("Examiner", examinerSchema);
export const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);
export const Exam = mongoose.models.Exam || mongoose.model("Exam", examSchema);
export const StudentExam = mongoose.models.StudentExam || mongoose.model("StudentExam", studentExamSchema);
export const Answer = mongoose.models.Answer || mongoose.model("Answer", answerSchema);
export const Warning = mongoose.models.Warning || mongoose.model("Warning", warningSchema);
export const Recording = mongoose.models.Recording || mongoose.model("Recording", recordingSchema);
