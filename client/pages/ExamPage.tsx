import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertCircle, Camera, Activity, Clock, Send, LogOut, BookOpen, Shield, Video, VideoOff } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface ExamData {
  _id: string;
  title: string;
  description: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
  }>;
}

const AI_DETECT_URL =
  import.meta.env.VITE_AI_DETECT_URL?.trim() || "http://localhost:5000/detect";
const AI_RETRY_DELAY_MS = 30000;
const AI_FETCH_TIMEOUT_MS = 5000;

export default function ExamPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const warningsRef = useRef(0);
  const lastWarningAtRef = useRef(0);
  const aiRetryAtRef = useRef(0);
  const aiErrorLoggedRef = useRef(false);
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [warnings, setWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: string;
  }>({});
  const [cameraOn, setCameraOn] = useState(false);
  const [studentExamId, setStudentExamId] = useState<string>("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // AI Detection state
  const [detectionStatus, setDetectionStatus] = useState<string>("");
  const [humansDetected, setHumansDetected] = useState<number>(0);
  const [deviceDetected, setDeviceDetected] = useState<boolean>(false);

  // Get questions from exam data
  const totalQuestions = examData?.questions?.length || 0;
  
  // Convert exam questions to display format
  const questions: Question[] = examData?.questions?.map((q, index) => ({
    id: index + 1,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
  })) || [];

  // Initialize exam and camera in parallel
  useEffect(() => {
    let mounted = true;

    const initExamAndCamera = async () => {
      // Start camera immediately (non-blocking)
      const startCamera = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
          if (mounted) {
            setCameraOn(false);
            setCameraError("Camera Access Denied");
          }
          return;
        }

        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          if (mounted) {
            streamRef.current = mediaStream;
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
              await videoRef.current.play().catch(() => {
                // Ignore autoplay interruptions; stream is already attached.
              });
            }
            setCameraOn(true);
            setCameraError(null);

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
          if (mounted) {
            setCameraOn(false);
            setCameraError("Camera Access Denied");
          }
        }
      };

      // Get or create exam session
      const initExamSession = async () => {
        const storedStudentId = localStorage.getItem("studentId");
        const storedStudentExamId = localStorage.getItem("studentExamId");
        const selectedExamId = localStorage.getItem("selectedExamId");
        const stateExamId = (location.state as { selectedExamId?: string })?.selectedExamId;

        if (!storedStudentId) {
          if (mounted) setLoading(false);
          return;
        }

        if (storedStudentExamId && mounted) {
          setStudentExamId(storedStudentExamId);
        }

        try {
          let examId = stateExamId || selectedExamId;

          if (stateExamId) {
            localStorage.setItem("selectedExamId", stateExamId);
          }

          if (!examId) {
            const examResponse = await fetch("/api/exams");
            if (examResponse.ok) {
              const exams = await examResponse.json();
              if (exams.length > 0) {
                examId = exams[0]._id;
                localStorage.setItem("selectedExamId", examId);
              }
            }
          }

          if (!examId) {
            console.error("No exams available");
            if (mounted) {
              setError("Unable to load the selected exam. Please return to the dashboard and try again.");
              setLoading(false);
            }
            return;
          }

          const examDataResponse = await fetch(`/api/exam/${examId}`);
          if (!examDataResponse.ok) {
            console.error("Failed to fetch exam data", examDataResponse.status);
            if (mounted) {
              setError("The selected exam could not be loaded. Please try again later.");
              setLoading(false);
            }
            return;
          }

          if (mounted) {
            const examDataResult = await examDataResponse.json();
            setExamData(examDataResult);
            const questionCount = examDataResult.questions?.length || 0;
            setTimeLeft(Math.max(questionCount * 120, 1800));

            if (questionCount === 0) {
              setError("The selected exam does not contain any questions.");
            }
          }

          const sessionResponse = await fetch("/api/student-exam/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              examId,
              studentId: storedStudentId,
              webcamStatus: "on",
            }),
          });

          if (sessionResponse.ok && mounted) {
            const data = await sessionResponse.json();
            setStudentExamId(data.studentExam._id);
            localStorage.setItem("studentExamId", data.studentExam._id);

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
          if (mounted) {
            setError("There was a problem starting the exam. Please try again.");
          }
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // AI Detection: Capture frame and send to Flask API
  const detectCheating = async () => {
    if (!videoRef.current || !cameraOn) return;
    if (Date.now() < aiRetryAtRef.current) return;

    try {
      // Capture frame from video element
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      ctx.drawImage(videoRef.current, 0, 0);
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        // Create FormData and send to AI service
        const formData = new FormData();
        formData.append("image", blob, "frame.jpg");

        // Send latest snapshot for examiner preview (best effort).
        if (studentExamId) {
          try {
            const frameData = canvas.toDataURL("image/jpeg", 0.7);
            await fetch("/api/proctor/frame", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                studentExamId,
                imageData: frameData,
              }),
            });
          } catch (err) {
            console.error("Frame upload error:", err);
          }
        }

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), AI_FETCH_TIMEOUT_MS);

          const response = await fetch(AI_DETECT_URL, {
            method: "POST",
            body: formData,
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (response.ok) {
            aiRetryAtRef.current = 0;
            aiErrorLoggedRef.current = false;
            const data = await response.json();
            const statusText = String(data.status ?? "");
            const humanCount = Number(data.humans_detected ?? 0);
            const deviceFlag = Boolean(data.device_detected);
            const cheatingFromStatus = statusText.toUpperCase().includes("CHEATING");

            setDetectionStatus(statusText);
            setHumansDetected(humanCount);
            setDeviceDetected(deviceFlag);

            // Trigger warning with specific reason.
            if (deviceFlag) {
              triggerWarning("Suspicious Activity", "Mobile/device detected");
            } else if (humanCount > 1 || cheatingFromStatus) {
              triggerWarning("Suspicious Activity", "Multiple humans detected");
            }
          } else {
            aiRetryAtRef.current = Date.now() + AI_RETRY_DELAY_MS;
            if (!aiErrorLoggedRef.current) {
              console.error("AI detection HTTP error:", response.status);
              aiErrorLoggedRef.current = true;
            }
          }
        } catch (err) {
          aiRetryAtRef.current = Date.now() + AI_RETRY_DELAY_MS;
          if (!aiErrorLoggedRef.current) {
            console.error("AI detection error:", err);
            aiErrorLoggedRef.current = true;
          }
        }
      }, "image/jpeg");
    } catch (err) {
      console.error("Frame capture error:", err);
    }
  };

  // Ensure stream is attached after the video element mounts.
  useEffect(() => {
    const video = videoRef.current;
    const mediaStream = streamRef.current;

    if (!video || !mediaStream || !cameraOn) return;

    if (video.srcObject !== mediaStream) {
      video.srcObject = mediaStream;
    }

    void video.play().catch(() => {
      // Ignore play interruptions caused by browser autoplay policies.
    });
  }, [cameraOn]);

  // Run AI detection periodically when camera is on
  useEffect(() => {
    if (!cameraOn) return;

    const interval = setInterval(() => {
      detectCheating();
    }, 5000); // Run every 5 seconds

    return () => clearInterval(interval);
  }, [cameraOn]);

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

  // Real tab-switch warning (no random warnings).
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerWarning("Suspicious Activity", "Tab switch detected");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const triggerWarning = async (
    type: string = "Suspicious Activity",
    description: string = "Tab switch detected",
  ) => {
    // Avoid warning spam from repeated detection cycles.
    const now = Date.now();
    if (now - lastWarningAtRef.current < 4000) return;
    lastWarningAtRef.current = now;

    const newWarnings = warningsRef.current + 1;
    warningsRef.current = newWarnings;
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
            type,
            description,
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

  useEffect(() => {
    warningsRef.current = warnings;
  }, [warnings]);

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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
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

  const currentQ = questions.length > 0 ? questions[currentQuestion - 1] : undefined;

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

  if (!examData || !currentQ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-gray-200 p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Unable to load exam</h2>
          <p className="text-gray-600 mb-6">
            {error || "There was a problem loading the exam. Please return to the dashboard and try again."}
          </p>
          <button
            onClick={() => navigate("/student-dashboard")}
            className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
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
            <h1 className="text-xl font-bold text-gray-900">{examData?.title || "Exam"}</h1>
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
                    <p className="text-sm">{cameraError ?? "Camera Off"}</p>
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
                  {cameraOn ? "Your camera is streaming" : cameraError ?? "Camera is disconnected"}
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
