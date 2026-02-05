import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, User } from 'lucide-react';

interface WebcamPreviewProps {
  className?: string;
}

const WebcamPreview = ({ className = '' }: WebcamPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 320, height: 240 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        console.log('Webcam access denied or unavailable');
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    };

    startWebcam();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className={`webcam-frame ${className}`}>
      {isLoading ? (
        <div className="aspect-video flex items-center justify-center bg-slate-900">
          <div className="animate-pulse text-slate-500">
            <Camera className="h-8 w-8" />
          </div>
        </div>
      ) : hasPermission ? (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full aspect-video object-cover"
          />
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-success/90 text-success-foreground px-2 py-1 rounded-full text-xs font-medium">
            <div className="h-2 w-2 rounded-full bg-success-foreground animate-pulse" />
            Recording
          </div>
        </div>
      ) : (
        <div className="aspect-video flex flex-col items-center justify-center bg-slate-900 text-slate-400">
          <CameraOff className="h-8 w-8 mb-2" />
          <p className="text-sm">Camera unavailable</p>
        </div>
      )}
    </div>
  );
};

export default WebcamPreview;
