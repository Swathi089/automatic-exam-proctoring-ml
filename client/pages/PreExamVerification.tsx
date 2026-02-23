import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Camera, RefreshCw, AlertCircle, BookOpen, Eye, Shield } from "lucide-react";

export default function PreExamVerification() {
  const navigate = useNavigate();
  const [verificationStep, setVerificationStep] = useState<
    "instructions" | "verifying" | "success"
  >("instructions");
  const [verificationProgress, setVerificationProgress] = useState(0);

  useEffect(() => {
    if (verificationStep === "verifying") {
      const interval = setInterval(() => {
        setVerificationProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setVerificationStep("success"), 500);
            return 100;
          }
          return prev + 20;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [verificationStep]);

  const handleVerifyAndStart = () => {
    setVerificationStep("verifying");
  };

  const handleStartExam = () => {
    navigate("/exam");
  };

  const handleBack = () => {
    navigate("/student-dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 -z-10 animate-pulse" />

      {/* Floating Icons */}
      <div className="absolute top-20 left-10 text-purple-600 opacity-40">
        <Shield className="w-20 h-20 animate-float" />
      </div>
      <div className="absolute bottom-32 right-10 text-pink-600 opacity-40">
        <Camera className="w-24 h-24 animate-float" style={{ animationDelay: '1s' }} />
      </div>
      <div className="absolute top-1/2 left-1/3 text-purple-500 opacity-40">
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
      <div className="max-w-2xl w-full">
        {/* Back Button */}
        <button
          onClick={handleBack}
          disabled={verificationStep === "verifying"}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors disabled:opacity-50"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {/* Instructions Section */}
        {verificationStep === "instructions" && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Pre-Exam Verification
              </h1>
              <p className="text-gray-600 mb-8">
                Please follow these instructions before starting the exam
              </p>

              {/* Instructions List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">
                      Close All Other Tabs
                    </p>
                    <p className="text-blue-800 text-sm">
                      You must close all other browser tabs before proceeding. Only
                      this exam window should be open.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-purple-900 mb-1">
                      Enable Full Screen Mode
                    </p>
                    <p className="text-purple-800 text-sm">
                      You must enter full screen mode. Your exam will be locked in
                      full screen to prevent switching windows.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-green-900 mb-1">
                      Allow Camera Access
                    </p>
                    <p className="text-green-800 text-sm">
                      You will be asked to grant camera permissions for proctoring.
                      Your video stream is required for monitoring.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-amber-900 mb-1">
                      Do Not Switch Tabs
                    </p>
                    <p className="text-amber-800 text-sm">
                      Switching to other tabs will be flagged as suspicious activity
                      and counted as a warning.
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning System */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <p className="font-semibold text-red-900 mb-2">Warning System</p>
                <p className="text-red-700 text-sm">
                  You are allowed{" "}
                  <span className="font-bold">3 warnings</span> before your exam is
                  automatically submitted. Warnings are given for:
                </p>
                <ul className="text-red-700 text-sm mt-2 ml-4 list-disc">
                  <li>Switching to another tab</li>
                  <li>Leaving full screen mode</li>
                  <li>Camera going offline</li>
                </ul>
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerifyAndStart}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 rounded-lg hover:shadow-lg transition-shadow text-lg"
              >
                Verify & Start Exam
              </button>
            </div>
          </div>
        )}

        {/* Verification Animation */}
        {verificationStep === "verifying" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100 animate-fade-in">
            <div className="mb-8">
              <RefreshCw className="w-16 h-16 text-blue-500 mx-auto animate-spin" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Verifying Your Setup
            </h2>

            {/* Verification Steps */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-left">
                {verificationProgress >= 20 ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                )}
                <span className="text-gray-700">
                  {verificationProgress >= 20 ? "✓ " : ""}Checking tabs...
                </span>
              </div>

              <div className="flex items-center gap-3 text-left">
                {verificationProgress >= 60 ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : verificationProgress >= 40 ? (
                  <RefreshCw className="w-5 h-5 text-blue-500 flex-shrink-0 animate-spin" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                )}
                <span className="text-gray-700">
                  {verificationProgress >= 60 ? "✓ " : ""}Checking camera...
                </span>
              </div>

              <div className="flex items-center gap-3 text-left">
                {verificationProgress >= 100 ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : verificationProgress >= 80 ? (
                  <RefreshCw className="w-5 h-5 text-blue-500 flex-shrink-0 animate-spin" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                )}
                <span className="text-gray-700">
                  {verificationProgress >= 100 ? "✓ " : ""}Verification complete
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                style={{ width: `${verificationProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Success State */}
        {verificationStep === "success" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100 animate-fade-in">
            <div className="mb-8">
              <div className="flex justify-center">
                <CheckCircle className="w-20 h-20 text-green-500" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Verification Successful!
            </h2>
            <p className="text-gray-600 mb-8">
              Your setup has been verified. You are ready to start the exam.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <ul className="text-left space-y-2 text-green-800">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  All tabs verified
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Camera enabled
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Full screen ready
                </li>
              </ul>
            </div>

            <button
              onClick={handleStartExam}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 rounded-lg hover:shadow-lg transition-shadow text-lg"
            >
              Start Exam Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
