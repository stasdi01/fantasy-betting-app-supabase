import { useState, useEffect } from 'react';
import { useToast } from '../components/Toast/ToastProvider';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { error: showError, info } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      info("Connection restored!", "Back Online");
    };

    const handleOffline = () => {
      setIsOnline(false);
      showError("No internet connection. Please check your network.", "Offline");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showError, info]);

  return isOnline;
};