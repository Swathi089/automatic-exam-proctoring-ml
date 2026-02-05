import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import WebcamPreview from '@/components/WebcamPreview';
import WarningModal from '@/components/WarningModal';
import TerminationModal from '@/components/TerminationModal';
import Logo from '@/components/Logo';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  AlertTriangle,
  StickyNote,
  HelpCircle
} from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

const questions: Question[] = [
  {
    id: 1,
    text: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correctAnswer: 1,
  },
  {
    id: 2,
    text: "Which data structure uses LIFO principle?",
    options: ["Queue", "Stack", "Linked List", "Tree"],
    correctAnswer: 1,
  },
  {
    id: 3,
    text: "What is the worst-case time complexity of QuickSort?",
    options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"],
    correctAnswer: 2,
  },
  {
    id: 4,
    text: "Which traversal visits the root node last?",
    options: ["Preorder", "Inorder", "Postorder", "Level order"],
    correctAnswer: 2,
  },
  {
    id: 5,
    text: "What is the space complexity of merge sort?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correctAnswer: 2,
  },
];

const MAX_WARNINGS = 3;

const ExamPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [notes, setNotes] = useState('');
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes in seconds
  const [warningCount, setWarningCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showTerminationModal, setShowTerminationModal] = useState(false);
  const [lastWarningType, setLastWarningType] = useState<'tab_switch' | 'fullscreen_exit' | 'motion_detected'>('tab_switch');

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
    }
  }, [user, navigate]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Detect tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && warningCount < MAX_WARNINGS) {
        triggerWarning('tab_switch');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [warningCount]);

  // Detect fullscreen exit (simulated with keydown)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && warningCount < MAX_WARNINGS) {
        triggerWarning('fullscreen_exit');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [warningCount]);

  const triggerWarning = useCallback((type: 'tab_switch' | 'fullscreen_exit' | 'motion_detected') => {
    const newCount = warningCount + 1;
    setWarningCount(newCount);
    setLastWarningType(type);
    
    if (newCount >= MAX_WARNINGS) {
      setShowTerminationModal(true);
    } else {
      setShowWarningModal(true);
    }
  }, [warningCount]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: parseInt(value),
    }));
  };

  const handleSubmit = () => {
    // In a real app, this would submit to a backend
    navigate('/student-dashboard');
  };

  const goHome = () => {
    navigate('/student-dashboard');
  };

  const question = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card shadow-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size="sm" showText={false} />
          
          <div className="flex items-center gap-6">
            {/* Warning Badge */}
            {warningCount > 0 && (
              <Badge 
                variant={warningCount >= 2 ? "destructive" : "outline"} 
                className={`${warningCount >= 2 ? 'animate-pulse' : 'border-warning text-warning'}`}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                {warningCount}/{MAX_WARNINGS} Warnings
              </Badge>
            )}
            
            {/* Timer */}
            <div className={`flex items-center gap-2 font-mono text-lg font-bold ${
              timeLeft < 300 ? 'text-destructive animate-pulse' : 'text-foreground'
            }`}>
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
            </div>
            
            {/* Progress */}
            <Badge variant="secondary">
              {answeredCount}/{questions.length} Answered
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Area */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="shadow-card">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-base px-4 py-1">
                    Question {currentQuestion + 1} of {questions.length}
                  </Badge>
                  <Badge variant="secondary">
                    <HelpCircle className="h-3 w-3 mr-1" />
                    4 marks
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h2 className="text-xl font-semibold mb-6">{question.text}</h2>
                
                <RadioGroup
                  value={answers[question.id]?.toString()}
                  onValueChange={handleAnswerChange}
                  className="space-y-3"
                >
                  {question.options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        answers[question.id] === idx
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                      <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer font-medium">
                        {String.fromCharCode(65 + idx)}. {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`h-10 w-10 rounded-lg font-medium transition-all ${
                      idx === currentQuestion
                        ? 'gradient-primary text-primary-foreground shadow-md'
                        : answers[questions[idx].id] !== undefined
                        ? 'bg-success/20 text-success border border-success/30'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {currentQuestion < questions.length - 1 ? (
                <Button
                  variant="hero"
                  onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="success"
                  onClick={handleSubmit}
                  className="bg-success hover:bg-success/90"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Exam
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Webcam */}
            <Card className="shadow-card overflow-hidden">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className="status-indicator status-live" />
                  Your Camera
                </CardTitle>
              </CardHeader>
              <WebcamPreview />
            </Card>

            {/* Notepad */}
            <Card className="shadow-card">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-warning" />
                  Scratch Pad
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Textarea
                  placeholder="Use this area for rough work..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[200px] resize-none font-mono text-sm"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Warning Modal */}
      <WarningModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        warningCount={warningCount}
        type={lastWarningType}
        maxWarnings={MAX_WARNINGS}
      />

      {/* Termination Modal */}
      <TerminationModal
        isOpen={showTerminationModal}
        onGoHome={goHome}
      />
    </div>
  );
};

export default ExamPage;
