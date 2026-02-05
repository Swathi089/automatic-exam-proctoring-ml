import { Check, X, Loader2 } from 'lucide-react';

interface ChecklistItemProps {
  label: string;
  description: string;
  status: 'pending' | 'checking' | 'passed' | 'failed';
  icon: React.ReactNode;
}

const ChecklistItem = ({ label, description, status, icon }: ChecklistItemProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case 'passed':
        return <Check className="h-5 w-5 text-success" />;
      case 'failed':
        return <X className="h-5 w-5 text-destructive" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted" />;
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'passed':
        return 'border-success/30 bg-success/5';
      case 'failed':
        return 'border-destructive/30 bg-destructive/5';
      case 'checking':
        return 'border-primary/30 bg-primary/5';
      default:
        return 'border-border';
    }
  };

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${getBorderColor()}`}>
      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{label}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">
        {getStatusIcon()}
      </div>
    </div>
  );
};

export default ChecklistItem;
