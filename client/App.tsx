import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import StudentLogin from "./pages/StudentLogin";
import StudentSignup from "./pages/StudentSignup";
import StudentDashboard from "./pages/StudentDashboard";
import PreExamVerification from "./pages/PreExamVerification";
import ExamPage from "./pages/ExamPage";
import ExamCompleted from "./pages/ExamCompleted";
import ExaminerLogin from "./pages/ExaminerLogin";
import ExaminerSignup from "./pages/ExaminerSignup";
import ExaminerDashboard from "./pages/ExaminerDashboard";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Home / Role Selection */}
          <Route path="/" element={<Index />} />

          {/* Student Routes */}
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/student-signup" element={<StudentSignup />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/pre-exam-verification" element={<PreExamVerification />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/exam-completed" element={<ExamCompleted />} />

          {/* Examiner Routes */}
          <Route path="/examiner-login" element={<ExaminerLogin />} />
          <Route path="/examiner-signup" element={<ExaminerSignup />} />
          <Route path="/examiner-dashboard" element={<ExaminerDashboard />} />

          {/* About Page */}
          <Route path="/about" element={<About />} />

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
