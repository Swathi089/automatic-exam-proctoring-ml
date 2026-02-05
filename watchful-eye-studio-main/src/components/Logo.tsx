import { Shield, Eye } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo = ({ size = 'md', showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 gradient-primary rounded-xl rotate-3" />
        <div className="absolute inset-0 bg-background rounded-xl flex items-center justify-center">
          <Shield className="h-1/2 w-1/2 text-primary" />
          <Eye className="absolute h-1/4 w-1/4 text-secondary" />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizes[size]} font-bold tracking-tight text-gradient`}>
            ProctorAI
          </span>
          <span className="text-xs text-muted-foreground -mt-0.5">
            Secure Exam Platform
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
