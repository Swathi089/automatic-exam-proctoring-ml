import { AlertTriangle, Video, VideoOff, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StudentVideoCardProps {
  id: string;
  name: string;
  warningCount: number;
  isLive: boolean;
}

const StudentVideoCard = ({ id, name, warningCount, isLive }: StudentVideoCardProps) => {
  const getWarningBadge = () => {
    if (warningCount === 0) return null;
    if (warningCount === 1) {
      return (
        <Badge variant="outline" className="border-warning text-warning bg-warning/10">
          <AlertTriangle className="h-3 w-3 mr-1" />
          1 Warning
        </Badge>
      );
    }
    if (warningCount === 2) {
      return (
        <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10">
          <AlertTriangle className="h-3 w-3 mr-1" />
          2 Warnings
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="animate-pulse">
        <AlertTriangle className="h-3 w-3 mr-1" />
        TERMINATED
      </Badge>
    );
  };

  return (
    <Card className="overflow-hidden shadow-card hover:shadow-elevated transition-shadow duration-300">
      <div className="webcam-frame aspect-video relative">
        {isLive ? (
          <>
            {/* Simulated webcam feed - gradient placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-slate-700 mx-auto mb-2 flex items-center justify-center">
                  <User className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-400 text-sm">Live Feed</p>
              </div>
            </div>
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <div className="status-indicator status-live" />
              <span className="text-xs text-success font-medium bg-success/20 px-2 py-0.5 rounded-full">
                LIVE
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <VideoOff className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Disconnected</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className={`h-4 w-4 ${isLive ? 'text-success' : 'text-muted-foreground'}`} />
          <span className="font-medium text-sm">{name}</span>
        </div>
        {getWarningBadge()}
      </div>
    </Card>
  );
};

export default StudentVideoCard;
