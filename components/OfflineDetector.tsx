import React, { useState, useEffect } from 'react';

/**
 * Offline detection component that shows a warning banner when internet connection is lost
 * Helps users understand why saves might fail
 */
const OfflineDetector: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Back online');
      setIsOffline(false);
      // Keep banner visible for 3 seconds to show "reconnected" message
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      console.log('📵 Offline detected');
      setIsOffline(true);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    if (!navigator.onLine) {
      setIsOffline(true);
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[200] p-4 text-center font-medium transition-all ${
        isOffline
          ? 'bg-red-600 text-white'
          : 'bg-green-600 text-white'
      }`}
      role="alert"
    >
      <div className="flex items-center justify-center gap-3 max-w-4xl mx-auto">
        {isOffline ? (
          <>
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <strong>No Internet Connection</strong>
              <p className="text-sm">Your changes are being saved locally and will sync when you reconnect.</p>
            </div>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <strong>Back Online</strong> - Connection restored
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineDetector;
