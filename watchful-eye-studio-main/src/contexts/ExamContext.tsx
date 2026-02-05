import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface Warning {
  id: string;
  type: 'tab_switch' | 'fullscreen_exit' | 'motion_detected';
  message: string;
  timestamp: Date;
}

interface StudentFeed {
  id: string;
  name: string;
  warningCount: number;
  isLive: boolean;
  lastActivity: Date;
  warnings: Warning[];
}

interface ExamContextType {
  isExamStarted: boolean;
  isFullscreen: boolean;
  warnings: Warning[];
  warningCount: number;
  isTerminated: boolean;
  studentFeeds: StudentFeed[];
  startExam: () => void;
  endExam: () => void;
  addWarning: (type: Warning['type'], message: string) => void;
  setFullscreen: (value: boolean) => void;
  terminateExam: () => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

const mockStudentFeeds: StudentFeed[] = [
  { id: '1', name: 'Alice Johnson', warningCount: 0, isLive: true, lastActivity: new Date(), warnings: [] },
  { id: '2', name: 'Bob Smith', warningCount: 1, isLive: true, lastActivity: new Date(), warnings: [] },
  { id: '3', name: 'Carol Davis', warningCount: 0, isLive: true, lastActivity: new Date(), warnings: [] },
  { id: '4', name: 'David Wilson', warningCount: 2, isLive: true, lastActivity: new Date(), warnings: [] },
  { id: '5', name: 'Eva Martinez', warningCount: 0, isLive: false, lastActivity: new Date(Date.now() - 300000), warnings: [] },
  { id: '6', name: 'Frank Brown', warningCount: 1, isLive: true, lastActivity: new Date(), warnings: [] },
];

export const ExamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [isTerminated, setIsTerminated] = useState(false);
  const [studentFeeds, setStudentFeeds] = useState<StudentFeed[]>(mockStudentFeeds);

  const addWarning = useCallback((type: Warning['type'], message: string) => {
    const newWarning: Warning = {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: new Date(),
    };
    setWarnings(prev => [...prev, newWarning]);
  }, []);

  const startExam = useCallback(() => {
    setIsExamStarted(true);
    setWarnings([]);
    setIsTerminated(false);
  }, []);

  const endExam = useCallback(() => {
    setIsExamStarted(false);
  }, []);

  const terminateExam = useCallback(() => {
    setIsTerminated(true);
    setIsExamStarted(false);
  }, []);

  const setFullscreenState = useCallback((value: boolean) => {
    setIsFullscreen(value);
  }, []);

  return (
    <ExamContext.Provider
      value={{
        isExamStarted,
        isFullscreen,
        warnings,
        warningCount: warnings.length,
        isTerminated,
        studentFeeds,
        startExam,
        endExam,
        addWarning,
        setFullscreen: setFullscreenState,
        terminateExam,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};
