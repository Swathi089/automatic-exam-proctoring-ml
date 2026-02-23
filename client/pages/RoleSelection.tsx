import { useNavigate, Link } from "react-router-dom";
import { BookOpen, ClipboardList, Info } from "lucide-react";

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Header with Welcome Letter */}
        <div className="text-center mb-16">
          <div className="inline-block bg-gray-900 rounded-lg p-3 mb-6">
            <div className="text-white font-bold text-2xl">EP</div>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            Welcome to Exam Proctor
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            AI-Based Online Exam Proctoring System
          </p>
          <p className="text-gray-500 max-w-xl mx-auto">
            Select your role to get started. Our advanced AI-powered proctoring ensures a secure, fair, and monitored testing environment for all students.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Student Card */}
          <button
            onClick={() => navigate("/student-login")}
            className="group relative bg-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-200"
          >
            <div className="absolute inset-0 bg-gray-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="inline-block bg-blue-100 p-5 rounded-2xl mb-6 group-hover:bg-blue-200 transition-colors">
                <BookOpen className="w-8 h-8 text-blue-700" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Student</h2>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                Take exams with AI-powered proctoring. Secure, fair, and monitored testing environment.
              </p>
              <div className="inline-flex items-center justify-center bg-gray-900 text-white font-semibold py-3 px-8 rounded-xl group-hover:shadow-lg transition-all">
                Continue as Student
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </button>

          {/* Examiner Card */}
          <button
            onClick={() => navigate("/examiner-login")}
            className="group relative bg-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-200"
          >
            <div className="absolute inset-0 bg-gray-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="inline-block bg-purple-100 p-5 rounded-2xl mb-6 group-hover:bg-purple-200 transition-colors">
                <ClipboardList className="w-8 h-8 text-purple-700" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Examiner</h2>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                Create and manage exams. Monitor students in real-time with AI analytics and insights.
              </p>
              <div className="inline-flex items-center justify-center bg-gray-900 text-white font-semibold py-3 px-8 rounded-xl group-hover:shadow-lg transition-all">
                Continue as Examiner
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* About Link */}
        <div className="text-center">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-lg font-medium"
          >
            <Info className="w-5 h-5" />
            Learn more about Exam Proctor
          </Link>
        </div>
      </div>
    </div>
  );
}
