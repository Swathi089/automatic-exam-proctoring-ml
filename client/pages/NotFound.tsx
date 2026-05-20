import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, BookOpen, Eye, Shield } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 -z-10 animate-pulse" />

      {/* Floating Icons */}
      <div className="absolute top-20 left-10 text-purple-600 opacity-40">
        <BookOpen className="w-16 h-16 animate-float" />
      </div>
      <div className="absolute bottom-32 right-10 text-pink-600 opacity-40">
        <Shield className="w-20 h-20 animate-float" style={{ animationDelay: '1s' }} />
      </div>
      <div className="absolute top-1/3 right-20 text-purple-500 opacity-40">
        <Eye className="w-12 h-12 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(5deg); }
          66% { transform: translateY(20px) rotate(-5deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="inline-block bg-gray-100 p-6 rounded-2xl">
            <p className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              404
            </p>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Home Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:shadow-lg transition-shadow"
        >
          <Home className="w-5 h-5" />
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
