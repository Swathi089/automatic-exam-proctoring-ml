import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Logo from '@/components/Logo';
import ChecklistItem from '@/components/ChecklistItem';
import { 
  LogOut, 
  Maximize, 
  MonitorOff, 
  AppWindow, 
  Camera,
  Play,
  GraduationCap,
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react';

type CheckStatus = 'pending' | 'checking' | 'passed' | 'failed';

interface CheckItem {
  id: string;
  label: string;
  description: string;
  status: CheckStatus;
  icon: React.ReactNode;
}

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [checks, setChecks] = useState<CheckItem[]>([
    {
      id: 'fullscreen',
      label: 'Fullscreen Mode',
      description: 'Browser must be in fullscreen mode during the exam',
      status: 'pending',
      icon: <Maximize className="h-6 w-6 text-primary" />,
    },
    {
      id: 'tabs',
      label: 'No Tab Switching',
      description: 'Only exam tab should be open, no other tabs allowed',
      status: 'pending',
      icon: <MonitorOff className="h-6 w-6 text-primary" />,
    },
    {
      id: 'apps',
      label: 'Close Other Applications',
      description: 'All other applications should be closed',
      status: 'pending',
      icon: <AppWindow className="h-6 w-6 text-primary" />,
    },
    {
      id: 'camera',
      label: 'Webcam Access',
      description: 'Camera permission is required for proctoring',
      status: 'pending',
      icon: <Camera className="h-6 w-6 text-primary" />,
    },
  ]);
  const [isRunningChecks, setIsRunningChecks] = useState(false);
  const [allChecksPassed, setAllChecksPassed] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
    }
  }, [user, navigate]);

  const runChecks = async () => {
    setIsRunningChecks(true);
    
    // Simulate running each check
    for (let i = 0; i < checks.length; i++) {
      setChecks(prev => prev.map((check, idx) => 
        idx === i ? { ...check, status: 'checking' } : check
      ));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate all checks passing (in real app, these would be actual checks)
      const passed = true;
      setChecks(prev => prev.map((check, idx) => 
        idx === i ? { ...check, status: passed ? 'passed' : 'failed' } : check
      ));
    }
    
    setIsRunningChecks(false);
    setAllChecksPassed(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const startExam = () => {
    navigate('/exam');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-medium">{user?.name}</span>
              <Badge variant="outline">Student</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Exam Info Card */}
        <Card className="shadow-elevated mb-8 overflow-hidden">
          <div className="gradient-primary p-6 text-primary-foreground">
            <h1 className="text-2xl font-bold mb-2">Computer Science Final Exam</h1>
            <p className="opacity-90">Data Structures & Algorithms - Spring 2024</p>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">90 Minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="font-semibold">25 MCQs</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Max Warnings</p>
                  <p className="font-semibold">3 Allowed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pre-Exam Checklist */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <Maximize className="h-4 w-4 text-primary-foreground" />
              </div>
              Pre-Exam System Check
            </CardTitle>
            <CardDescription>
              Complete all checks before starting your exam. These ensure a fair testing environment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {checks.map(check => (
              <ChecklistItem
                key={check.id}
                label={check.label}
                description={check.description}
                status={check.status}
                icon={check.icon}
              />
            ))}

            <div className="pt-6 flex flex-col gap-4">
              {!allChecksPassed ? (
                <Button 
                  variant="hero" 
                  size="xl" 
                  onClick={runChecks}
                  disabled={isRunningChecks}
                  className="w-full"
                >
                  {isRunningChecks ? 'Running Checks...' : 'Run System Check'}
                </Button>
              ) : (
                <Button 
                  variant="success" 
                  size="xl" 
                  onClick={startExam}
                  className="w-full bg-success hover:bg-success/90"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Exam
                </Button>
              )}
              
              <p className="text-center text-sm text-muted-foreground">
                By starting the exam, you agree to the proctoring terms and conditions.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StudentDashboard;
