import { useNavigate } from "react-router-dom";
import { CheckCircle, Award, BookOpen, Eye, Shield } from "lucide-react";

export default function ExamCompleted() {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate("/student-dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 -z-10 animate-pulse" />
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 -z-10 animate-pulse" />

      {/* Floating Icons */}
      <div className="absolute top-40 left-10 text-purple-600 opacity-40">
        <BookOpen className="w-20 h-20 animate-float" />
      </div>
      <div className="absolute bottom-32 right-10 text-pink-600 opacity-40">
        <Shield className="w-24 h-24 animate-float" style={{ animationDelay: '1s' }} />
      </div>
      <div className="absolute top-1/3 right-1/4 text-purple-500 opacity-40">
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
      <div className="max-w-2xl w-full text-center animate-fade-in">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Award className="w-32 h-32 text-amber-400" />
            <div className="absolute inset-0 bg-amber-400 rounded-full opacity-20 animate-pulse" />
          </div>
        </div>

        {/* Header */}
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Exam Submitted!
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Your exam has been successfully submitted. Thank you for taking the test.
        </p>

        {/* Success Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-12 mb-8 border border-gray-100">
          {/* Status Badge */}
          <div className="flex items-center justify-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-8 inline-block mx-auto">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Submission Successful</span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Exam Name</p>
              <p className="text-2xl font-bold text-gray-900">
                Data Structures & Algorithms
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">
                Submission Time
              </p>
              <p className="text-2xl font-bold text-gray-900">2:00 PM</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Status</p>
              <p className="text-2xl font-bold text-green-600">Completed</p>
            </div>
          </div>

          {/* Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              Your exam responses have been securely submitted. You will receive your
              results within 24 hours. Your score and detailed feedback will be
              available in your student dashboard.
            </p>
          </div>
        </div>

        {/* Next Steps Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 text-left">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What's Next?</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <span className="text-gray-700">
                Your exam has been submitted to the evaluation system
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <span className="text-gray-700">
                Results will be available within 24 hours
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <span className="text-gray-700">
                You will receive a notification email once results are published
              </span>
            </li>
          </ul>
        </div>

        {/* Back to Dashboard Button */}
        <button
          onClick={handleBackToDashboard}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 rounded-lg hover:shadow-lg transition-shadow text-lg"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
