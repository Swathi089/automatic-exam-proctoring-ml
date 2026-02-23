import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Users, Eye, AlertCircle, CheckCircle, Eye as EyeIcon, BookOpen, Shield, ClipboardList, Camera, Video, VideoOff, CircleDot, XCircle, Check } from "lucide-react";

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

  // Answers and warnings for selected student
  const [studentAnswers, setStudentAnswers] = useState<Answer[]>([]);
  const [studentWarnings, setStudentWarnings] = useState<Warning[]>([]);

  // Fetch exams first
  useEffect(() => {
    const fetchExams = async () => {
      try {
        // Try to get all exams
        const response = await fetch("/api/exams");
        if (response.ok) {
          const data = await response.json();
          setExams(data);
          
          if (data.length > 0) {
            // Fetch student exams for the first exam
            const studentExamsResponse = await fetch(`/api/student-exams/${data[0]._id}`);
            if (studentExamsResponse.ok) {
              const studentData = await studentExamsResponse.json();
              setStudentExams(studentData);
            }
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {examinerName}!
          </h2>
          <p className="text-gray-600">
            Monitor your exam sessions and track student progress in real-time.
          </p>
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
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-white">
            <h3 className="text-3xl font-bold mb-2">Live Students</h3>
            <p className="text-blue-100">
              Currently taking the Data Structures & Algorithms exam
            </p>
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
                    </div>
                  </div>
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
                  <Camera className="w-12 h-12 text-gray-600" />
                </div>
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
    </div>
  );
}
