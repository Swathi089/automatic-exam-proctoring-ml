import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Clock, CheckCircle, AlertCircle, Play, BookOpen, Eye, Shield } from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [warnings, setWarnings] = useState(0);

  useEffect(() => {
    // Get student info from localStorage
    const storedName = localStorage.getItem("studentName");
    const storedId = localStorage.getItem("studentId");
    
    if (storedName) {
      setStudentName(storedName);
    }
    if (storedId) {
      setStudentId(storedId);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("studentName");
    localStorage.removeItem("studentId");
    navigate("/");
  };

  const handleStartExam = () => {
    navigate("/pre-exam-verification");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-50 relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 -z-10 animate-pulse" />

      {/* Floating Icons */}
      <div className="absolute top-40 right-20 text-purple-600 opacity-40">
        <BookOpen className="w-20 h-20 animate-float" style={{ animationDelay: '0s' }} />
      </div>
      <div className="absolute bottom-40 left-20 text-pink-600 opacity-40">
        <Shield className="w-24 h-24 animate-float" style={{ animationDelay: '1s' }} />
      </div>
      <div className="absolute top-1/2 right-1/4 text-purple-500 opacity-40">
        <Eye className="w-16 h-16 animate-float" style={{ animationDelay: '2s' }} />
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
            <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-2">
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
            Welcome back, {studentName || "Student"}!
          </h2>
          <p className="text-gray-600">
            You have 1 exam available. Click start to begin.
          </p>
        </div>

        {/* Exam Status Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Data Structures & Algorithms
              </h3>
              <p className="text-gray-600">Computer Science 101</p>
            </div>
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold">
              <CheckCircle className="w-5 h-5" />
              Ready to Start
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm font-medium mb-1">Duration</p>
              <p className="text-2xl font-bold text-blue-600">2 Hours</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm font-medium mb-1">Questions</p>
              <p className="text-2xl font-bold text-purple-600">50</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm font-medium mb-1">
                Passing Score
              </p>
              <p className="text-2xl font-bold text-amber-600">60%</p>
            </div>
          </div>

          <button
            onClick={handleStartExam}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 rounded-lg hover:shadow-lg transition-shadow flex items-center justify-center gap-2 text-lg"
          >
            <Play className="w-6 h-6" />
            Start Exam
          </button>
        </div>

        {/* Previous Exams Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Previous Exams</h3>

          <div className="space-y-4">
            {/* Exam Record 1 */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Introduction to Python
                  </h4>
                  <p className="text-sm text-gray-600">
                    Completed on Jan 15, 2024
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">85%</p>
                  <p className="text-sm text-gray-600">Passed</p>
                </div>
              </div>
            </div>

            {/* Exam Record 2 */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Web Development Basics
                  </h4>
                  <p className="text-sm text-gray-600">
                    Completed on Jan 10, 2024
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">92%</p>
                  <p className="text-sm text-gray-600">Passed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Count (if any) */}
        {warnings > 0 && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">
                  {warnings} Warning{warnings !== 1 ? "s" : ""} on Record
                </p>
                <p className="text-red-700 text-sm">
                  You have been flagged for suspicious activity. Be careful during
                  your next exam.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
