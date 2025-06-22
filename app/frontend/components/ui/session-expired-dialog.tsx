import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, LogOut, RefreshCw } from 'lucide-react';

interface SessionExpiredDialogProps {
  isOpen: boolean;
  onLogin: () => void;
  onRefresh: () => void;
}

const SessionExpiredDialog: React.FC<SessionExpiredDialogProps> = ({
  isOpen,
  onLogin,
  onRefresh
}) => {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onLogin(); // Auto-redirect to login when countdown reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onLogin]);

  useEffect(() => {
    if (isOpen) {
      setCountdown(30); // Reset countdown when dialog opens
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full bg-white shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Session Expired
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-gray-600">
              Your session has expired for security reasons. Please log in again to continue.
            </p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">
                Auto-redirecting to login in{' '}
                <span className="font-bold text-yellow-600">{countdown}</span> seconds
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onRefresh}
              className="flex-1 text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={onLogin}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Go to Login
            </Button>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              For your security, sessions expire after a period of inactivity
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionExpiredDialog; 