import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Camera, Activity, Clock, Send, LogOut, Eye, BookOpen, Shield, Video, VideoOff } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

export default function ExamPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [warnings, setWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: string;
  }>({});
  const [cameraOn, setCameraOn] = useState(false);
  const [studentExamId, setStudentExamId] = useState<string>("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(true);

  const totalQuestions = 6;

  // Questions with correct answers
  const questions: Question[] = [
    {
      id: 1,
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correctAnswer: "O(log n)",
    },
    {
      id: 2,
      question: "Which data structure uses LIFO principle?",
      options: ["Queue", "Stack", "Array", "Linked List"],
      correctAnswer: "Stack",
    },
    {
      id: 3,
      question: "What is the worst-case time complexity of quicksort?",
      options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
      correctAnswer: "O(n²)",
    },
    {
      id: 4,
      question: "In a hash table, what is a collision?",
      options: [
        "When two keys hash to the same value",
        "When hash table is full",
        "When memory is corrupted",
        "When function is undefined",
      ],
      correctAnswer: "When two keys hash to the same value",
    },
    {
      id: 5,
      question: "Which sorting algorithm has the best average-case performance?",
      options: ["Bubble Sort", "Merge Sort", "Selection Sort", "Insertion Sort"],
      correctAnswer: "Merge Sort",
    },
    {
      id: 6,
      question: "What is the space complexity of merge sort?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      correctAnswer: "O(n)",
    },
  ];

  // Initialize exam and camera in parallel
  useEffect(() => {
    let mounted = true;

    const initExamAndCamera = async () => {
      // Start camera immediately (non-blocking)
      const startCamera = async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          if (mounted) {
            setStream(mediaStream);
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
            }
            setCameraOn(true);

            // Save recording to database when camera starts
            const storedStudentId = localStorage.getItem("studentId");
            const storedStudentExamId = localStorage.getItem("studentExamId");
            if (storedStudentExamId && storedStudentId) {
              try {
                await fetch("/api/recording", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    studentExamId: storedStudentExamId,
                    examinerId: null,
                    status: "recording",
                  }),
                });
              } catch (err) {
                console.error("Error saving recording start:", err);
              }
            }
          }
        } catch (error) {
          console.error("Error accessing camera:", error);
          if (mounted) setCameraOn(false);
        }
      };

      // Get or create exam session
      const initExamSession = async () => {
        const storedStudentId = localStorage.getItem("studentId");
        const storedStudentExamId = localStorage.getItem("studentExamId");

        if (storedStudentExamId) {
          if (mounted) {
            setStudentExamId(storedStudentExamId);
            setLoading(false);
          }
          return;
        }

        if (!storedStudentId) {
          if (mounted) setLoading(false);
          return;
        }

        try {
          // Try to get existing exams first
          let examId = null;
          const examResponse = await fetch("/api/exams");
          
          if (examResponse.ok) {
            const exams = await examResponse.json();
            if (exams.length > 0) {
              examId = exams[0]._id;
            }
          }

          // If no exam exists, create one
          if (!examId) {
            const createExamResponse = await fetch("/api/exam", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                examinerId: "000000000000000000000001",
                title: "Data Structures & Algorithms",
                description: "A comprehensive exam on DSA",
              }),
            });
            
            if (createExamResponse.ok) {
              const examData = await createExamResponse.json();
              examId = examData.exam._id;
            }
          }

          if (!examId) {
            console.error("Could not get or create exam");
            if (mounted) setLoading(false);
            return;
          }

          // Start student exam session
          const sessionResponse = await fetch("/api/student-exam/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              examId: examId,
              studentId: storedStudentId,
              webcamStatus: "on",
            }),
          });

          if (sessionResponse.ok && mounted) {
            const data = await sessionResponse.json();
            setStudentExamId(data.studentExam._id);
            localStorage.setItem("studentExamId", data.studentExam._id);

            // Save recording to database when exam session starts
            try {
              await fetch("/api/recording", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  studentExamId: data.studentExam._id,
                  examinerId: null,
                  status: "recording",
                }),
              });
            } catch (err) {
              console.error("Error saving recording:", err);
            }
          }
        } catch (error) {
          console.error("Error starting exam:", error);
        } finally {
          if (mounted) setLoading(false);
        }
      };

      // Run both in parallel
      await Promise.all([startCamera(), initExamSession()]);
    };

    initExamAndCamera();

    return () => {
      mounted = false;
    };
  }, []);

  // Save answer to database
  const saveAnswer = async (questionId: number, answer: string) => {
    if (!studentExamId) return;

    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    // Check if answer is correct
    const isCorrect = answer === question.correctAnswer;
    const marks = isCorrect ? 1 : 0;

    try {
      await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentExamId: studentExamId,
          questionId: questionId.toString(),
          questionText: question.question,
          answerText: answer,
          isCorrect: isCorrect,
          marks: marks,
        }),
      });
    } catch (error) {
      console.error("Error saving answer:", error);
    }
  };

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate random malpractice detection
  useEffect(() => {
    const malpracticeCheck = setInterval(() => {
      if (Math.random() < 0.05 && warnings < 3) {
        triggerWarning();
      }
    }, 15000);

    return () => clearInterval(malpracticeCheck);
  }, [warnings]);

  const triggerWarning = async () => {
    const newWarnings = warnings + 1;
    setWarnings(newWarnings);
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 5000);

    if (studentExamId) {
      try {
        await fetch("/api/warning", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentExamId: studentExamId,
            type: "Suspicious Activity",
            description: "Tab switch detected",
          }),
        });

        await fetch(`/api/student-exam/${studentExamId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ warnings: newWarnings }),
        });
      } catch (error) {
        console.error("Error saving warning:", error);
      }
    }

    if (newWarnings >= 3) {
      setTimeout(() => handleSubmitExam(), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answer,
    }));
    saveAnswer(currentQuestion, answer);
  };

  const handleSubmitExam = async () => {
    // Stop recording in database
    if (studentExamId) {
      try {
        await fetch("/api/recording", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentExamId: studentExamId,
            examinerId: null,
            status: "stopped",
          }),
        });
      } catch (err) {
        console.error("Error stopping recording:", err);
      }
    }

    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    // Update exam status
    if (studentExamId) {
      try {
        await fetch(`/api/student-exam/${studentExamId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "finished",
            webcamStatus: "off",
          }),
        });
      } catch (error) {
        console.error("Error updating exam status:", error);
      }
    }
    navigate("/exam-completed");
  };

  const currentQ = questions[currentQuestion - 1];

  // Show loading while initializing (camera + exam)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Starting exam...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-50 relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 -z-10" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 -z-10" />

      {/* Floating Icons */}
      <div className="absolute top-40 left-20 text-purple-500 opacity-30">
        <BookOpen className="w-16 h-16 animate-float" />
      </div>
      <div className="absolute bottom-40 right-20 text-pink-500 opacity-30">
        <Shield className="w-20 h-20 animate-float" style={{ animationDelay: "1s" }} />
      </div>
      
      {/* Top Bar */}
      <div className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Data Structures & Algorithms</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestion} of {totalQuestions}
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Timer */}
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-mono font-bold text-blue-600 text-lg">{formatTime(timeLeft)}</span>
            </div>

            {/* End Exam Button */}
            <button
              onClick={handleSubmitExam}
              className="flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              End Exam
            </button>
          </div>
        </div>
      </div>

      {/* Warning Popup */}
      {showWarning && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-bold">Warning {warnings}: Suspicious activity detected</p>
              <p className="text-sm text-red-100">
                {warnings === 3
                  ? "Final warning - exam will be submitted"
                  : `${3 - warnings} warning${3 - warnings !== 1 ? "s" : ""} remaining`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Side - Questions Panel */}
          <div className="lg:col-span-3">
            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentQ.question}</h2>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {currentQ.options.map((option, idx) => (
                  <label
                    key={idx}
                    className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={option}
                      checked={selectedAnswers[currentQuestion] === option}
                      onChange={() => handleAnswerChange(option)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="ml-4 text-gray-900 font-medium">{option}</span>
                  </label>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentQuestion(Math.max(1, currentQuestion - 1))}
                  disabled={currentQuestion === 1}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalQuestions }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestion(idx + 1)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                        currentQuestion === idx + 1
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                          : selectedAnswers[idx + 1]
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                {currentQuestion === totalQuestions ? (
                  <button
                    onClick={handleSubmitExam}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
                  >
                    <Send className="w-4 h-4" />
                    Submit
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestion(Math.min(totalQuestions, currentQuestion + 1))}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Monitoring Panel */}
          <div className="space-y-6">
            {/* Webcam Preview */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              {/* Camera Feed - Actual Webcam */}
              <div className="bg-black aspect-video flex items-center justify-center relative">
                {cameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white text-center">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Camera Off</p>
                  </div>
                )}
              </div>

              {/* Camera Status */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Camera Status</span>
                  {cameraOn ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                      <span className="text-xs font-semibold">ON</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <VideoOff className="w-4 h-4" />
                      <span className="text-xs font-semibold">OFF</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-600">
                  {cameraOn ? "Your camera is streaming" : "Camera is disconnected"}
                </div>
              </div>
            </div>

            {/* AI Monitoring Badge */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5" />
                <h3 className="font-semibold">AI Monitoring Active</h3>
              </div>
              <p className="text-sm text-purple-100 mb-4">
                Your exam is being monitored by AI for suspicious activity.
              </p>
              <div className="text-xs text-purple-200">
                Status: <span className="font-semibold text-green-300">Active</span>
              </div>
            </div>

            {/* Warning Counter */}
            <div
              className={`rounded-2xl p-6 shadow-lg border-2 ${
                warnings === 0
                  ? "bg-green-50 border-green-200"
                  : warnings === 1 || warnings === 2
                  ? "bg-amber-50 border-amber-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <h3
                className={`font-semibold mb-2 ${
                  warnings === 0
                    ? "text-green-900"
                    : warnings === 1 || warnings === 2
                    ? "text-amber-900"
                    : "text-red-900"
                }`}
              >
                Warnings
              </h3>
              <div
                className={`text-4xl font-bold ${
                  warnings === 0
                    ? "text-green-600"
                    : warnings === 1 || warnings === 2
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {warnings}/3
              </div>
              <p
                className={`text-sm mt-2 ${
                  warnings === 0
                    ? "text-green-700"
                    : warnings === 1 || warnings === 2
                    ? "text-amber-700"
                    : "text-red-700"
                }`}
              >
                {warnings === 0
                  ? "No warnings yet"
                  : warnings === 3
                  ? "Exam will auto-submit"
                  : `${3 - warnings} warning${3 - warnings !== 1 ? "s" : ""} left`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
