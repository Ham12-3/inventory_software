import { useState, useCallback } from 'react';

interface SessionManager {
  showSessionExpiredDialog: boolean;
  handleSessionExpired: () => void;
  handleRefresh: () => void;
  handleLoginRedirect: () => void;
  clearSession: () => void;
}

// Global state to ensure only one dialog shows at a time
let globalSessionExpired = false;
const globalCallbacks: (() => void)[] = [];

export const useSessionManager = (): SessionManager => {
  const [showSessionExpiredDialog, setShowSessionExpiredDialog] = useState(false);

  const clearSession = useCallback(() => {
    // Clear all session data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
    
    globalSessionExpired = false;
    setShowSessionExpiredDialog(false);
  }, []);

  const handleSessionExpired = useCallback(() => {
    // Prevent multiple dialogs from showing
    if (globalSessionExpired) return;
    
    globalSessionExpired = true;
    setShowSessionExpiredDialog(true);
    
    // Notify all instances to show the dialog
    globalCallbacks.forEach(callback => callback());
  }, []);

  const handleRefresh = useCallback(() => {
    // Hide dialog and try to refresh the page
    globalSessionExpired = false;
    setShowSessionExpiredDialog(false);
    
    // Try to refresh the current operation
    window.location.reload();
  }, []);

  const handleLoginRedirect = useCallback(() => {
    // Clear session and redirect to login
    clearSession();
    window.location.href = '/login';
  }, [clearSession]);

  return {
    showSessionExpiredDialog,
    handleSessionExpired,
    handleRefresh,
    handleLoginRedirect,
    clearSession,
  };
};

// Global function to trigger session expired from anywhere
export const triggerSessionExpired = () => {
  if (globalSessionExpired) return;
  
  globalSessionExpired = true;
  globalCallbacks.forEach(callback => callback());
}; 