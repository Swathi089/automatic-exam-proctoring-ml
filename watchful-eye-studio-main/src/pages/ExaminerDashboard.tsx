import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useExam } from '@/contexts/ExamContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Logo from '@/components/Logo';
import StudentVideoCard from '@/components/StudentVideoCard';
import AlertItem from '@/components/AlertItem';
import { 
  LogOut, 
  Users, 
  AlertTriangle, 
  Activity, 
  Bell, 
  Shield,
  RefreshCw 
} from 'lucide-react';

interface MockAlert {
  id: string;
  type: 'tab_switch' | 'fullscreen_exit' | 'motion_detected';
  studentName: string;
  message: string;
  timestamp: Date;
}

const ExaminerDashboard = () => {
  const { user, logout } = useAuth();
  const { studentFeeds } = useExam();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<MockAlert[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'examiner') {
      navigate('/login');
    }
  }, [user, navigate]);

  // Simulate incoming alerts
  useEffect(() => {
    const alertTypes: MockAlert['type'][] = ['tab_switch', 'fullscreen_exit', 'motion_detected'];
    const messages = {
      tab_switch: 'Student switched to another browser tab',
      fullscreen_exit: 'Student exited fullscreen mode',
      motion_detected: 'Unusual head movement detected',
    };
    const studentNames = studentFeeds.map(s => s.name);

    const interval = setInterval(() => {
      const shouldAddAlert = Math.random() > 0.7;
      if (shouldAddAlert && studentNames.length > 0) {
        const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const newAlert: MockAlert = {
          id: crypto.randomUUID(),
          type,
          studentName: studentNames[Math.floor(Math.random() * studentNames.length)],
          message: messages[type],
          timestamp: new Date(),
        };
        setAlerts(prev => [newAlert, ...prev].slice(0, 10));
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [studentFeeds]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeStudents = studentFeeds.filter(s => s.isLive).length;
  const totalWarnings = studentFeeds.reduce((acc, s) => acc + s.warningCount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-secondary" />
              <span className="font-medium">{user?.name}</span>
              <Badge variant="secondary">Examiner</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeStudents}</p>
                <p className="text-sm text-muted-foreground">Active Students</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{studentFeeds.length}</p>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalWarnings}</p>
                <p className="text-sm text-muted-foreground">Total Warnings</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Bell className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{alerts.length}</p>
                <p className="text-sm text-muted-foreground">Recent Alerts</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Feeds */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Live Student Feeds
              </h2>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentFeeds.map(student => (
                <StudentVideoCard
                  key={student.id}
                  id={student.id}
                  name={student.name}
                  warningCount={student.warningCount}
                  isLive={student.isLive}
                />
              ))}
            </div>
          </div>

          {/* Alerts Panel */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5 text-destructive" />
                Live Alerts
              </h2>
              {alerts.length > 0 && (
                <Badge variant="destructive">{alerts.length} new</Badge>
              )}
            </div>
            <Card className="shadow-card">
              <CardContent className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No alerts yet</p>
                    <p className="text-sm">Monitoring for suspicious activity...</p>
                  </div>
                ) : (
                  alerts.map(alert => (
                    <AlertItem
                      key={alert.id}
                      type={alert.type}
                      studentName={alert.studentName}
                      timestamp={alert.timestamp}
                      message={alert.message}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExaminerDashboard;
