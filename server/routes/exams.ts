import { RequestHandler } from "express";
import { z } from "zod";
import {
  connectDB,
  Exam,
  StudentExam,
  Answer,
  Warning,
  Recording,
} from "../db";

// Use explicit model types to avoid TS inference issues with mongoose unions
type ExamDoc = any;
type StudentExamDoc = any;
type AnswerDoc = any;
type WarningDoc = any;

type ExamModel = typeof Exam & {
  find: (...args: any[]) => Promise<any[]>;
  findById: (...args: any[]) => Promise<any>;
  create: (...args: any[]) => Promise<any>;
};

type StudentExamModel = typeof StudentExam & {
  find: (...args: any[]) => any;
  findById: (...args: any[]) => Promise<any>;
  deleteOne: (...args: any[]) => Promise<any>;
};

type AnswerModel = typeof Answer & {
  deleteMany: (...args: any[]) => Promise<any>;
};

type WarningModel = typeof Warning & {
  deleteMany: (...args: any[]) => Promise<any>;
};

const ExamM = Exam as unknown as ExamModel;
const StudentExamM = StudentExam as unknown as StudentExamModel;
const AnswerM = Answer as unknown as AnswerModel;
const WarningM = Warning as unknown as WarningModel;

// Ensure DB is connected (safe to call multiple times)
let dbConnected = false;
async function ensureDbConnected() {
  if (dbConnected) return;
  await connectDB();
  dbConnected = true;
}

const objectId = z.string().min(1);

export const getExams: RequestHandler = async (_req, res) => {
  try {
    await ensureDbConnected();
    const exams = await Exam.find({}).sort({ createdAt: -1 }).lean();
    res.status(200).json(exams);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch exams" });
  }
};

export const createExam: RequestHandler = async (req, res) => {
  const bodySchema = z.object({
    examinerId: objectId.optional(),
    title: z.string().min(1),
    description: z.string().optional(),
    questions: z
      .array(
        z.object({
          question: z.string().min(1),
          options: z.array(z.string().min(1)).min(2),
          correctAnswer: z.string().min(1),
        }),
      )
      .min(1),
  });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.message });
  }

  try {
    await ensureDbConnected();

    const { examinerId, title, description, questions } = parsed.data;

    const exam = await Exam.create({
      examinerId: examinerId ? examinerId : undefined,
      title,
      description,
      questions,
    });

    res.status(201).json(exam);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to create exam" });
  }
};

export const getStudentExamsByExam: RequestHandler = async (req, res) => {
  const parsed = z.object({ examId: z.string().min(1) }).safeParse(req.params);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid examId" });

  try {
    await ensureDbConnected();
    const { examId } = parsed.data;

    // Populate studentId to show fullName/email (as required by frontend)
    const sessions = await StudentExam.find({ examId })
      .populate("studentId")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(sessions);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch student exam sessions" });
  }
};

export const getStudentExamDetails: RequestHandler = async (req, res) => {
  const parsed = z
    .object({ studentExamId: z.string().min(1) })
    .safeParse(req.params);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid studentExam id" });

  try {
    await ensureDbConnected();
    const { studentExamId } = parsed.data;

    const session = await StudentExam.findById(studentExamId).lean();
    if (!session)
      return res.status(404).json({ message: "Student exam not found" });

    res.status(200).json(session);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch student exam details" });
  }
};

export const getAnswers: RequestHandler = async (req, res) => {
  const parsed = z
    .object({ studentExamId: z.string().min(1) })
    .safeParse(req.params);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid studentExam id" });

  try {
    await ensureDbConnected();
    const { studentExamId } = parsed.data;

    if (!/^[0-9a-fA-F]{24}$/.test(studentExamId)) {
      return res.status(200).json([]);
    }

    // frontend expects: { _id, questionId, questionText, answerText, isCorrect, marks }
    const answers = await Answer.find({ studentExamId }).lean();
    res.status(200).json(answers);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch answers" });
  }
};

export const getWarnings: RequestHandler = async (req, res) => {
  const parsed = z
    .object({ studentExamId: z.string().min(1) })
    .safeParse(req.params);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid studentExam id" });

  try {
    await ensureDbConnected();
    const { studentExamId } = parsed.data;

    if (!/^[0-9a-fA-F]{24}$/.test(studentExamId)) {
      return res.status(200).json([]);
    }

    // frontend expects: { _id, type, description, timestamp }
    const warnings = await Warning.find({ studentExamId }).lean();
    res.status(200).json(warnings);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch warnings" });
  }
};

export const deleteStudentExam: RequestHandler = async (req, res) => {
  const parsed = z
    .object({ studentExamId: z.string().min(1) })
    .safeParse(req.params);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid studentExam id" });

  try {
    await ensureDbConnected();
    const { studentExamId } = parsed.data;

    // Delete in a consistent order (answers/warnings/recordings first)
    await Promise.all([
      Answer.deleteMany({ studentExamId }),
      Warning.deleteMany({ studentExamId }),
      Recording.deleteMany({ studentExamId }),
      StudentExam.findByIdAndDelete(studentExamId),
    ]);

    res.status(200).json({ message: "Deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to delete student exam" });
  }
};

export const getExamDetails: RequestHandler = async (req, res) => {
  const parsed = z.object({ id: z.string().min(1) }).safeParse(req.params);
  if (!parsed.success) return res.status(400).json({ message: "Invalid exam id" });

  try {
    await ensureDbConnected();
    const exam = await Exam.findById(parsed.data.id).lean();
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.status(200).json(exam);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch exam details" });
  }
};

export const startStudentExam: RequestHandler = async (req, res) => {
  try {
    await ensureDbConnected();
    const { examId, studentId, webcamStatus } = req.body;
    
    let studentExam = await StudentExam.findOne({ examId, studentId });
    if (!studentExam) {
      studentExam = await StudentExam.create({
        examId,
        studentId,
        webcamStatus: webcamStatus || "on",
        status: "active"
      });
    } else {
      studentExam.status = "active";
      studentExam.webcamStatus = webcamStatus || "on";
      await studentExam.save();
    }
    
    res.status(200).json({ studentExam });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to start student exam" });
  }
};

export const updateStudentExam: RequestHandler = async (req, res) => {
  try {
    await ensureDbConnected();
    const { studentExamId } = req.params;
    const updateData = req.body;
    
    const updated = await StudentExam.findByIdAndUpdate(studentExamId, updateData, { new: true });
    res.status(200).json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to update student exam" });
  }
};

export const saveRecording: RequestHandler = async (req, res) => {
  try {
    await ensureDbConnected();
    const { studentExamId, examinerId, status } = req.body;
    const recording = await Recording.create({ studentExamId, examinerId, status });
    res.status(201).json(recording);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to save recording" });
  }
};

export const saveAnswer: RequestHandler = async (req, res) => {
  try {
    await ensureDbConnected();
    const { studentExamId, questionId, questionText, answerText, isCorrect, marks } = req.body;
    
    const existingAnswer = await Answer.findOne({ studentExamId, questionId });
    if (existingAnswer) {
      existingAnswer.answerText = answerText;
      existingAnswer.isCorrect = isCorrect;
      existingAnswer.marks = marks;
      await existingAnswer.save();
      return res.status(200).json(existingAnswer);
    }
    
    const answer = await Answer.create({ studentExamId, questionId, questionText, answerText, isCorrect, marks });
    res.status(201).json(answer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to save answer" });
  }
};

export const saveWarning: RequestHandler = async (req, res) => {
  try {
    await ensureDbConnected();
    const { studentExamId, type, description } = req.body;
    const warning = await Warning.create({ studentExamId, type, description });
    res.status(201).json(warning);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to save warning" });
  }
};

const latestFrames = new Map<string, { imageData: string, updatedAt: Date }>();

export const saveProctorFrame: RequestHandler = async (req, res) => {
  const { studentExamId, imageData } = req.body;
  if (studentExamId && imageData) {
    latestFrames.set(studentExamId, { imageData, updatedAt: new Date() });
  }
  res.status(200).json({ message: "Frame received" });
};

export const getProctorFrame: RequestHandler = async (req, res) => {
  const { studentExamId } = req.params;
  const frame = latestFrames.get(studentExamId);
  if (frame) {
    return res.status(200).json(frame);
  }
  return res.status(404).json({ message: "Frame not found" });
};
