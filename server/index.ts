import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import authRoutes from "./routes/auth";
import {
  getExams,
  createExam,
  getStudentExamsByExam,
  getStudentExamDetails,
  getAnswers,
  getWarnings,
  deleteStudentExam,
  getExamDetails,
  startStudentExam,
  updateStudentExam,
  saveRecording,
  saveAnswer,
  saveWarning,
  saveProctorFrame,
  getProctorFrame,
} from "./routes/exams";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true, limit: "5mb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.use("/api", authRoutes);

  // Exam routes
  app.get("/api/exams", getExams);
  app.post("/api/exam", createExam);
  app.get("/api/exam/:id", getExamDetails);
  
  // Student exam session routes
  app.post("/api/student-exam/start", startStudentExam);
  app.put("/api/student-exam/:studentExamId", updateStudentExam);
  app.post("/api/recording", saveRecording);
  app.post("/api/answer", saveAnswer);
  app.post("/api/warning", saveWarning);
  app.post("/api/proctor/frame", saveProctorFrame);
  app.get("/api/proctor/frame/:studentExamId", getProctorFrame);

  // Examiner dashboard routes
  app.get("/api/student-exams/:examId", getStudentExamsByExam);
  app.get("/api/student-exam/:studentExamId", getStudentExamDetails);
  app.get("/api/answers/:studentExamId", getAnswers);
  app.get("/api/warnings/:studentExamId", getWarnings);

  app.delete("/api/student-exam/:studentExamId", deleteStudentExam);

  return app;
}
