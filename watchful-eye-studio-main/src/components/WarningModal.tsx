import { AlertTriangle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  warningCount: number;
  type: 'tab_switch' | 'fullscreen_exit' | 'motion_detected';
  maxWarnings: number;
}

const WarningModal = ({ isOpen, onClose, warningCount, type, maxWarnings }: WarningModalProps) => {
  const getWarningMessage = () => {
    switch (type) {
      case 'tab_switch':
        return 'You switched to another browser tab. Please stay on the exam page.';
      case 'fullscreen_exit':
        return 'You exited fullscreen mode. Please return to fullscreen to continue.';
      case 'motion_detected':
        return 'Suspicious movement detected. Please look at the screen.';
      default:
        return 'A violation has been detected.';
    }
  };

  const remainingWarnings = maxWarnings - warningCount;
  const isLastWarning = remainingWarnings === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <DialogTitle className="text-center text-xl">
            Warning #{warningCount}
          </DialogTitle>
          <DialogDescription className="text-center">
            {getWarningMessage()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted rounded-xl p-4 text-center">
          {isLastWarning ? (
            <p className="text-destructive font-semibold">
              This is your final warning! One more violation will terminate your exam.
            </p>
          ) : (
            <p className="text-muted-foreground">
              You have <span className="font-bold text-foreground">{remainingWarnings}</span> warning{remainingWarnings !== 1 ? 's' : ''} remaining before exam termination.
            </p>
          )}
        </div>

        <div className="flex justify-center gap-3 mt-4">
          <Button onClick={onClose} variant="hero" size="lg">
            I Understand, Continue Exam
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WarningModal;
