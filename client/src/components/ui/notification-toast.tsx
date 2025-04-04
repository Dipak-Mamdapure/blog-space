import { ReactNode, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Card, CardContent } from "./card";

interface NotificationToastProps {
  show: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  duration?: number;
}

export function NotificationToast({
  show,
  onClose,
  title,
  children,
  duration = 5000,
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(show);
  
  useEffect(() => {
    setIsVisible(show);
    
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-0 right-0 m-4 w-full max-w-sm z-50">
      <Card className="bg-white shadow-lg rounded-lg pointer-events-auto">
        <CardContent className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-amber-100 p-1 rounded-full">
              <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">{title}</p>
              <div className="mt-1 text-sm text-gray-500">{children}</div>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button 
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => {
                  setIsVisible(false);
                  onClose();
                }}
              >
                <span className="sr-only">Close</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
