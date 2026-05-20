import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Users, Eye, AlertCircle, CheckCircle, Eye as EyeIcon, BookOpen, Shield, ClipboardList, Camera, Video, VideoOff, CircleDot, XCircle, Check, Plus, X, Trash2, Save } from "lucide-react";

interface StudentExam {
  _id: string;
  studentId: {
    _id: string;
    fullName: string;
    email: string;
  };
  status: "active" | "finished";
  webcamStatus: "on" | "off";
  warnings: number;
  startTime: string;
}

interface Answer {
  _id: string;
  questionId: string;
  questionText: string;
  answerText: string;
  isCorrect: boolean;
  marks: number;
}

interface Warning {
  _id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

export default function ExaminerDashboard() {
  const navigate = useNavigate();

  // Get examiner name from localStorage or use default
  const [examinerName, setExaminerName] = useState<string>(() => {
    const stored = localStorage.getItem("examinerName");
    return stored || "Dr. Jane Smith";
  });

  const [examinerId] = useState<string>(() => {
    return localStorage.getItem("examinerId") || "";
  });

  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "finished" | "warnings">("all");
  const [recordingStudents, setRecordingStudents] = useState<Set<number>>(new Set());
  const [showFinishedWarning, setShowFinishedWarning] = useState(false);
  const [pendingStudentId, setPendingStudentId] = useState<string | null>(null);
  const [studentExams, setStudentExams] = useState<StudentExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedExamDetails, setSelectedExamDetails] = useState<any | null>(null);

  // Answers and warnings for selected student
  const [studentAnswers, setStudentAnswers] = useState<Answer[]>([]);
  const [studentWarnings, setStudentWarnings] = useState<Warning[]>([]);
  const [studentFrame, setStudentFrame] = useState<string>("");
  const [studentFrameUpdatedAt, setStudentFrameUpdatedAt] = useState<string>("");

  // Fetch exams first
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch("/api/exams");
        if (response.ok) {
          const data = await response.json();
          setExams(data);
          
          if (data.length > 0) {
            setSelectedExamId(data[0]._id);
          }
        }
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  // Fetch student exams when selected exam changes
  useEffect(() => {
    if (!selectedExamId) return;
    let mounted = true;
    
    const fetchStudentExams = async () => {
      try {
        const studentExamsResponse = await fetch(`/api/student-exams/${selectedExamId}`);
        if (studentExamsResponse.ok && mounted) {
          const studentData = await studentExamsResponse.json();
          setStudentExams(studentData);
        }
      } catch (error) {
        console.error("Error fetching student exams:", error);
      }
    };
    
    fetchStudentExams();
    const intervalId = setInterval(fetchStudentExams, 10000);
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [selectedExamId]);

  // Exam Creation Modal State
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [examTitle, setExamTitle] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", options: ["", "", "", ""], correctAnswer: "" }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Handle adding a new question
  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: "" }]);
  };

  // Handle removing a question
  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    }
  };

  // Handle updating a question
  const updateQuestion = (index: number, field: keyof Question, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  // Handle updating an option
  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  // Handle creating the exam
  const handleCreateExam = async () => {
    if (!examTitle.trim()) {
      setSubmitMessage({ type: "error", text: "Please enter an exam title" });
      return;
    }

    // Validate questions
    const validQuestions = questions.filter(q => 
      q.question.trim() && 
      q.options.filter(o => o.trim()).length >= 2 && 
      q.correctAnswer.trim()
    );

    if (validQuestions.length === 0) {
      setSubmitMessage({ type: "error", text: "Please add at least one complete question with at least 2 options and a correct answer" });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch("/api/exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examinerId: examinerId || undefined,
          title: examTitle,
          description: examDescription,
          questions: validQuestions,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmitMessage({ type: "success", text: "Exam created successfully!" });
        // Reset form
        setExamTitle("");
        setExamDescription("");
        setQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: "" }]);
        // Refresh exams list
        const examsResponse = await fetch("/api/exams");
        if (examsResponse.ok) {
          const examsData = await examsResponse.json();
          setExams(examsData);
        }
        // Close modal after short delay
        setTimeout(() => {
          setShowCreateExamModal(false);
          setSubmitMessage(null);
        }, 1500);
      } else {
        const errorData = await response.json();
        setSubmitMessage({ type: "error", text: errorData.message || "Failed to create exam" });
      }
    } catch (error) {
      console.error("Error creating exam:", error);
      setSubmitMessage({ type: "error", text: "An error occurred while creating the exam" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch answers and warnings when student is selected
  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!selectedStudent) return;

      try {
        // Fetch answers
        const answersResponse = await fetch(`/api/answers/${selectedStudent}`);
        if (answersResponse.ok) {
          const answers = await answersResponse.json();
          setStudentAnswers(answers);
        }

        // Fetch warnings
        const warningsResponse = await fetch(`/api/warnings/${selectedStudent}`);
        if (warningsResponse.ok) {
          const warnings = await warningsResponse.json();
          setStudentWarnings(warnings);
        }

      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };

    fetchStudentDetails();
  }, [selectedStudent]);

  // Poll latest camera frame for selected student.
  useEffect(() => {
    if (!selectedStudent) return;

    let mounted = true;
    const fetchFrame = async () => {
      try {
        const response = await fetch(`/api/proctor/frame/${selectedStudent}`);
        if (!mounted) return;

        if (response.ok) {
          const data = await response.json();
          setStudentFrame(String(data.imageData ?? ""));
          setStudentFrameUpdatedAt(String(data.updatedAt ?? ""));
        } else if (response.status === 404) {
          setStudentFrame("");
          setStudentFrameUpdatedAt("");
        }
      } catch (error) {
        console.error("Error fetching student frame:", error);
      }
    };

    void fetchFrame();
    const interval = setInterval(fetchFrame, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [selectedStudent]);

  // Convert API data to display format
  const students = studentExams.length > 0 ? studentExams.map((se, index) => ({
    id: index + 1,
    mongoId: se._id,
    name: se.studentId?.fullName || "Unknown Student",
    webcamStatus: se.webcamStatus === "on" ? "On" : "Off",
    warnings: se.warnings || 0,
    status: se.status === "active" ? "Active" : "Finished",
  })) : [
    {
      id: 1,
      mongoId: "demo1",
      name: "John Doe",
      webcamStatus: "On",
      warnings: 0,
      status: "Active",
    },
    {
      id: 2,
      mongoId: "demo2",
      name: "Alice Johnson",
      webcamStatus: "On",
      warnings: 1,
      status: "Active",
    },
    {
      id: 3,
      mongoId: "demo3",
      name: "Bob Williams",
      webcamStatus: "Off",
      warnings: 2,
      status: "Active",
    },
    {
      id: 4,
      mongoId: "demo4",
      name: "Sarah Brown",
      webcamStatus: "On",
      warnings: 0,
      status: "Finished",
    },
    {
      id: 5,
      mongoId: "demo5",
      name: "Mike Davis",
      webcamStatus: "On",
      warnings: 0,
      status: "Finished",
    },
  ];

  // Calculate stats
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === "Active").length;
  const finishedStudents = students.filter((s) => s.status === "Finished").length;
  const warningStudents = students.filter((s) => s.warnings > 0).length;

  // Calculate correct and wrong answers
  const correctAnswers = studentAnswers.filter((a) => a.isCorrect).length;
  const wrongAnswers = studentAnswers.filter((a) => !a.isCorrect).length;

  const handleLogout = () => {
    localStorage.removeItem("examinerName");
    localStorage.removeItem("examinerId");
    navigate("/");
  };

  const toggleRecording = async (studentId: number) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const newRecordingState = !recordingStudents.has(studentId);

    setRecordingStudents((prev) => {
      const newSet = new Set(prev);
      if (newRecordingState) {
        newSet.add(studentId);
      } else {
        newSet.delete(studentId);
      }
      return newSet;
    });

    try {
      await fetch("/api/recording", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentExamId: student.mongoId,
          examinerId: examinerId,
          status: newRecordingState ? "recording" : "stopped",
        }),
      });
    } catch (error) {
      console.error("Error updating recording:", error);
    }
  };

  const handleViewStudent = (studentId: number, status: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    if (status === "Finished") {
      setPendingStudentId(student.mongoId);
      setShowFinishedWarning(true);
    } else {
      setSelectedStudent(student.mongoId);
    }
  };

  const confirmViewStudent = () => {
    if (pendingStudentId !== null) {
      setSelectedStudent(pendingStudentId);
    }
    setShowFinishedWarning(false);
    setPendingStudentId(null);
  };

  const cancelViewStudent = () => {
    setShowFinishedWarning(false);
    setPendingStudentId(null);
  };

  const handleDeleteStudent = async (studentExamId: string) => {
    if (!window.confirm("Are you sure you want to delete this student's exam record? This cannot be undone.")) return;
    
    try {
      const response = await fetch(`/api/student-exam/${studentExamId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setStudentExams((prev) => prev.filter((se) => se._id !== studentExamId));
      } else {
        alert("Failed to delete student record");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Error deleting student record");
    }
  };

  const getFilteredStudents = () => {
    switch (filterStatus) {
      case "active":
        return students.filter((s) => s.status === "Active");
      case "finished":
        return students.filter((s) => s.status === "Finished");
      case "warnings":
        return students.filter((s) => s.warnings > 0);
      case "all":
      default:
        return students;
    }
  };

  const stats = [
    {
      label: "Total Students",
      value: totalStudents.toString(),
      color: "blue",
      icon: Users,
    },
    {
      label: "Active Now",
      value: activeStudents.toString(),
      color: "green",
      icon: CheckCircle,
    },
    {
      label: "Finished",
      value: finishedStudents.toString(),
      color: "purple",
      icon: CheckCircle,
    },
    {
      label: "With Warnings",
      value: warningStudents.toString(),
      color: "red",
      icon: AlertCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-50 relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 -z-10 animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 -z-10 animate-pulse" />

      {/* Floating Icons */}
      <div className="absolute top-40 right-20 text-purple-600 opacity-40">
        <ClipboardList className="w-24 h-24 animate-float" style={{ animationDelay: '0s' }} />
      </div>
      <div className="absolute bottom-40 left-20 text-pink-600 opacity-40">
        <Eye className="w-28 h-28 animate-float" style={{ animationDelay: '1s' }} />
      </div>
      <div className="absolute top-1/2 right-1/3 text-purple-500 opacity-40">
        <BookOpen className="w-20 h-20 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(5deg); }
          66% { transform: translateY(20px) rotate(-5deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
      
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-2">
              <div className="text-white font-bold">EP</div>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Exam Proctor</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {examinerName}!
            </h2>
            <p className="text-gray-600">
              Monitor your exam sessions and track student progress in real-time.
            </p>
          </div>
          <button
            onClick={() => setShowCreateExamModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Create Subject/Exam
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const colorClasses: Record<string, string> = {
              blue: "bg-blue-50 border-blue-200",
              green: "bg-green-50 border-green-200",
              purple: "bg-purple-50 border-purple-200",
              red: "bg-red-50 border-red-200",
            };
            const textClasses: Record<string, string> = {
              blue: "text-blue-600",
              green: "text-green-600",
              purple: "text-purple-600",
              red: "text-red-600",
            };

            return (
              <div
                key={idx}
                className={`rounded-2xl p-6 border ${colorClasses[stat.color]}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                  <Icon className={`w-6 h-6 ${textClasses[stat.color]}`} />
                </div>
                <p className={`text-3xl font-bold ${textClasses[stat.color]}`}>
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Live Students Section */}
        <div className="rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-3xl font-bold mb-2">Live Students</h3>
              <p className="text-blue-100">
                {exams.length > 0 && selectedExamId
                  ? `Currently taking the ${exams.find((e) => e._id === selectedExamId)?.title || "exam"}`
                  : "No active exams"
                }
              </p>
            </div>
            {exams.length > 0 && (
              <select 
                value={selectedExamId || ""} 
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="bg-white text-blue-900 px-4 py-3 rounded-xl font-semibold border-none outline-none focus:ring-2 focus:ring-blue-300 shadow-md cursor-pointer appearance-none pr-10 relative"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231e3a8a%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto' }}
              >
                {exams.map((exam) => (
                  <option key={exam._id} value={exam._id}>{exam.title}</option>
                ))}
              </select>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6">
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  filterStatus === "all"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-blue-100"
                }`}
              >
                All Students
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                  filterStatus === "active"
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-green-100"
                }`}
              >
                <CircleDot className="w-4 h-4" />
                Active Now
              </button>
              <button
                onClick={() => setFilterStatus("finished")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  filterStatus === "finished"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-purple-100"
                }`}
              >
                Finished
              </button>
              <button
                onClick={() => setFilterStatus("warnings")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  filterStatus === "warnings"
                    ? "bg-red-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-red-100"
                }`}
              >
                With Warnings
              </button>
            </div>

            {/* Student Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getFilteredStudents().map((student) => (
                <div
                  key={student.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-blue-100"
                >
                  {/* Webcam Preview */}
                  <div className="bg-black aspect-video flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-black flex items-center justify-center">
                      <Camera className="w-10 h-10 text-gray-600 group-hover:text-gray-500 transition-colors" />
                    </div>
                    {/* Camera Status Indicator */}
                    <div
                      className={`absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        student.webcamStatus === "On"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        student.webcamStatus === "On" ? "bg-white animate-pulse" : "bg-white"
                      }`} />
                      {student.webcamStatus}
                    </div>
                    {/* Recording Indicator */}
                    {recordingStudents.has(student.id) && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-white" />
                        REC
                      </div>
                    )}
                  </div>

                  {/* Student Info */}
                  <div className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">
                        {student.name}
                      </h4>
                    </div>

                    {/* Status Badges */}
                    <div className="space-y-2">
                      {/* Warnings Badge */}
                      <div>
                        <p className="text-xs text-gray-600 font-medium mb-2">
                          Warnings
                        </p>
                        <div
                          className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-bold ${
                            student.warnings === 0
                              ? "bg-green-100 text-green-700"
                              : student.warnings < 3
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {student.warnings}/3
                        </div>
                      </div>

                      {/* Exam Status Badge */}
                      <div>
                        <p className="text-xs text-gray-600 font-medium mb-2">
                          Exam Status
                        </p>
                        <div
                          className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-bold ${
                            student.status === "Active"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {student.status}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {/* Record Button */}
                      <button
                        onClick={() => toggleRecording(student.id)}
                        className={`w-full flex items-center justify-center gap-2 font-semibold py-2 rounded-lg transition-all duration-200 ${
                          recordingStudents.has(student.id)
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {recordingStudents.has(student.id) ? (
                          <>
                            <VideoOff className="w-4 h-4" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Video className="w-4 h-4" />
                            Record
                          </>
                        )}
                      </button>

                      {/* View Button */}
                      <button
                        onClick={() => handleViewStudent(student.id, student.status)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-200"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View Details
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteStudent(student.mongoId)}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-semibold py-2 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Record
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Exams & Subjects Section */}
        <div className="mt-12 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
          <div className="bg-[#198754] px-8 py-8 text-white">
            <h3 className="text-3xl font-bold mb-2">Exams & Subjects</h3>
            <p className="text-green-100">
              You have created {exams.length} exams
            </p>
          </div>
          <div className="bg-gray-100 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <div key={exam._id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{exam.title}</h4>
                      {exam.description && <p className="text-sm text-gray-500 mt-1">{exam.description}</p>}
                    </div>
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="bg-gray-50 rounded-lg px-4 py-3 mb-6 border border-gray-100">
                    <p className="text-sm font-semibold text-gray-700">{exam.questions?.length || 0} questions</p>
                  </div>
                  <button
                    onClick={() => setSelectedExamDetails(exam)}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Finished Student Warning Dialog */}
        {showFinishedWarning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Student Has Finished Exam
                </h3>
                <p className="text-gray-600 mb-6">
                  This student has already completed their exam. Are you sure you want to view their details?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={cancelViewStudent}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmViewStudent}
                    className="flex-1 px-4 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    View Anyway
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Student Details
              </h2>
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setStudentAnswers([]);
                  setStudentWarnings([]);
                  setStudentFrame("");
                  setStudentFrameUpdatedAt("");
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Webcam Preview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Webcam Feed
                </h3>
                <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                  {studentFrame ? (
                    <img
                      src={studentFrame}
                      alt="Student webcam preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <Camera className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                      <p className="text-sm">No camera feed available</p>
                    </div>
                  )}
                </div>
                {studentFrameUpdatedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Last update: {new Date(studentFrameUpdatedAt).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Results Summary */}
              {studentAnswers.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Results</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-100 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Check className="w-6 h-6 text-green-600" />
                        <span className="text-green-700 font-semibold">Correct</span>
                      </div>
                      <p className="text-3xl font-bold text-green-600">{correctAnswers}</p>
                    </div>
                    <div className="bg-red-100 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <XCircle className="w-6 h-6 text-red-600" />
                        <span className="text-red-700 font-semibold">Wrong</span>
                      </div>
                      <p className="text-3xl font-bold text-red-600">{wrongAnswers}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-gray-600">
                      Total Questions Answered: <span className="font-bold">{studentAnswers.length}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Student Answers */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Student Answers
                </h3>
                {studentAnswers.length > 0 ? (
                  <div className="space-y-4">
                    {studentAnswers.map((answer, idx) => (
                      <div 
                        key={idx} 
                        className={`border rounded-lg p-4 ${
                          answer.isCorrect 
                            ? "bg-green-50 border-green-300" 
                            : "bg-red-50 border-red-300"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-gray-900">
                            Question {answer.questionId}: {answer.questionText}
                          </p>
                          {answer.isCorrect ? (
                            <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                              <Check className="w-4 h-4" /> Correct
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600 text-sm font-semibold">
                              <XCircle className="w-4 h-4" /> Wrong
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 ml-4">
                          <span className="font-semibold">Answer:</span> {answer.answerText}
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                          Marks: {answer.marks}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No answers submitted yet.</p>
                )}
              </div>

              {/* Warning History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Warning History
                </h3>
                {studentWarnings.length > 0 ? (
                  <div className="space-y-2">
                    {studentWarnings.map((warning, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div>
                          <p className="text-red-900 font-medium">{warning.type}: {warning.description}</p>
                          <p className="text-red-700 text-sm">{new Date(warning.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No warnings recorded.</p>
                )}
              </div>

              {/* Status Logs */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Status Logs
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="text-gray-600">
                    <span className="font-medium">02:30 PM</span> - Exam started
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">02:15 PM</span> - Suspicious activity detected
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">02:00 PM</span> - Camera enabled
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Exam Modal */}
      {showCreateExamModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Create New Subject/Exam
              </h2>
              <button
                onClick={() => {
                  setShowCreateExamModal(false);
                  setSubmitMessage(null);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Success/Error Message */}
              {submitMessage && (
                <div className={`p-4 rounded-lg ${
                  submitMessage.type === "success" 
                    ? "bg-green-100 text-green-700 border border-green-300" 
                    : "bg-red-100 text-red-700 border border-red-300"
                }`}>
                  {submitMessage.text}
                </div>
              )}

              {/* Exam Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Subject/Exam Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g., Data Structures & Algorithms"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Exam Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={examDescription}
                  onChange={(e) => setExamDescription(e.target.value)}
                  placeholder="Enter a brief description of this exam..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Questions Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-gray-900">
                    Questions <span className="text-red-500">*</span>
                  </label>
                  <button
                    onClick={addQuestion}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </button>
                </div>

                <div className="space-y-6">
                  {questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-sm font-semibold text-gray-700">
                          Question {qIndex + 1}
                        </span>
                        {questions.length > 1 && (
                          <button
                            onClick={() => removeQuestion(qIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Question Text */}
                      <div className="mb-4">
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                          placeholder="Enter your question..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      {/* Options */}
                      <div className="space-y-2 mb-4">
                        <p className="text-sm font-medium text-gray-700">Options:</p>
                        {q.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correctAnswer-${qIndex}`}
                              checked={q.correctAnswer === option}
                              onChange={() => updateQuestion(qIndex, "correctAnswer", option)}
                              className="w-4 h-4 text-purple-600"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              placeholder={`Option ${oIndex + 1}`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            />
                          </div>
                        ))}
                        <p className="text-xs text-gray-500">
                          Select the radio button next to the correct answer
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateExamModal(false);
                    setSubmitMessage(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateExam}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Create Exam
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Exam Details Modal */}
      {selectedExamDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 flex items-start justify-between text-white shrink-0">
              <div>
                <h2 className="text-3xl font-bold mb-2">{selectedExamDetails.title}</h2>
                {selectedExamDetails.description && (
                  <p className="text-purple-100">{selectedExamDetails.description}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedExamDetails(null)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Questions</h3>
              <div className="space-y-8">
                {selectedExamDetails.questions?.map((q: any, i: number) => (
                  <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <p className="text-sm font-bold text-purple-600 mb-2">Question {i + 1}</p>
                    <p className="text-lg font-bold text-gray-900 mb-4">{q.question}</p>
                    
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500 font-medium">Options:</p>
                      {q.options.map((opt: string, optIdx: number) => {
                        const isCorrect = opt === q.correctAnswer;
                        return (
                          <div 
                            key={optIdx} 
                            className={`p-4 rounded-lg border ${
                              isCorrect 
                                ? "bg-green-50 border-green-200 text-green-800" 
                                : "bg-gray-50 border-gray-200 text-gray-700"
                            } flex justify-between items-center`}
                          >
                            <span>{optIdx + 1}. {opt}</span>
                            {isCorrect && (
                              <span className="flex items-center gap-1 text-sm font-bold text-green-600">
                                <Check className="w-4 h-4" /> Correct Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
