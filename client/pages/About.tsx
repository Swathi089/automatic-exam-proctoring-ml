import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Eye, CheckCircle, Lock, UserCheck, BarChart, AlertTriangle } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-4">
            About Exam Proctor
          </h1>
          <p className="text-xl text-gray-300">
            AI-Based Online Exam Proctoring System
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What is Exam Proctor?
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            Exam Proctor is an advanced AI-based online exam proctoring system designed to ensure the integrity and fairness of online examinations. Our platform combines cutting-edge artificial intelligence with real-time monitoring capabilities to create a secure testing environment that Detects and prevents academic dishonesty.
          </p>
        </section>

        {/* Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="flex gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Real-time Monitoring</h3>
                <p className="text-gray-600 text-sm">
                  Live webcam monitoring allows examiners to observe students during their exams in real-time.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Warning System</h3>
                <p className="text-gray-600 text-sm">
                  Automatic detection and alerts for suspicious activities like tab switching or leaving the exam window.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Secure Environment</h3>
                <p className="text-gray-600 text-sm">
                  AI-powered detection ensures students cannot access unauthorized resources during the exam.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600 text-sm">
                  Comprehensive analytics and reporting tools for examiners to track student performance and behavior.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Identity Verification</h3>
                <p className="text-gray-600 text-sm">
                  Pre-exam verification ensures the identity of each student before they begin their examination.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="flex gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Video Recording</h3>
                <p className="text-gray-600 text-sm">
                  Optional recording feature allows examiners to record student webcam feeds for later review.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Benefits
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-gray-900">For Educational Institutions</h3>
                <p className="text-gray-600">
                  Maintain academic integrity and credibility by ensuring fair examination practices.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-gray-900">For Examiners</h3>
                <p className="text-gray-600">
                  Efficiently monitor multiple students simultaneously with real-time alerts and detailed reports.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-gray-900">For Students</h3>
                <p className="text-gray-600">
                  Take exams with confidence knowing that the process is fair and secure for all participants.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gray-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Get Started Today
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Experience the future of online examination proctoring. Join thousands of educational institutions trust Exam Proctor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/student-login"
              className="inline-flex items-center justify-center bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Continue as Student
            </Link>
            <Link
              to="/examiner-login"
              className="inline-flex items-center justify-center bg-gray-900 text-white font-semibold py-3 px-8 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Continue as Examiner
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-600">
          <p className="font-medium">Secure • Monitored • Fair</p>
          <p className="text-sm mt-2">© 2024 Exam Proctor. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
