import { XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TerminationModalProps {
  isOpen: boolean;
  onGoHome: () => void;
}

const TerminationModal = ({ isOpen, onGoHome }: TerminationModalProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <XCircle className="h-10 w-10 text-destructive" />
          </div>
          <DialogTitle className="text-center text-2xl text-destructive">
            Exam Terminated
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Your exam has been automatically terminated due to multiple proctoring violations.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground">
            You have exceeded the maximum number of allowed warnings (3). This session has been recorded and flagged for review by the examiner.
          </p>
        </div>

        <div className="bg-muted rounded-xl p-4 space-y-2">
          <p className="text-sm font-medium">What happens next?</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Your exam progress has been saved</li>
            <li>• The examiner will review your session</li>
            <li>• You will be contacted regarding next steps</li>
          </ul>
        </div>

        <div className="flex justify-center mt-4">
          <Button onClick={onGoHome} variant="destructive" size="lg">
            Return to Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TerminationModal;
