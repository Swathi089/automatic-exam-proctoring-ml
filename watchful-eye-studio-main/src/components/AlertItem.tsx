import { AlertTriangle, MonitorOff, Eye, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AlertItemProps {
  type: 'tab_switch' | 'fullscreen_exit' | 'motion_detected';
  studentName: string;
  timestamp: Date;
  message: string;
}

const AlertItem = ({ type, studentName, timestamp, message }: AlertItemProps) => {
  const getIcon = () => {
    switch (type) {
      case 'tab_switch':
        return <MonitorOff className="h-4 w-4" />;
      case 'fullscreen_exit':
        return <MonitorOff className="h-4 w-4" />;
      case 'motion_detected':
        return <Eye className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'tab_switch':
        return 'Tab Switch';
      case 'fullscreen_exit':
        return 'Fullscreen Exit';
      case 'motion_detected':
        return 'Suspicious Motion';
      default:
        return 'Alert';
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg animate-slide-up">
      <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground">{studentName}</span>
          <span className="alert-badge bg-destructive/10 text-destructive text-xs">
            {getTypeLabel()}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{message}</p>
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </div>
      </div>
    </div>
  );
};

export default AlertItem;
