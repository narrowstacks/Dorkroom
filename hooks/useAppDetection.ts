import { useState, useEffect } from 'react';
import { 
  isRunningOnMobileWeb, 
  checkNativeAppAvailability, 
  openInNativeApp,
  createAppDetectionMessage 
} from '@/utils/appDetection';

interface UseAppDetectionResult {
  isOnMobileWeb: boolean;
  isAppAvailable: boolean | null;
  showAppBanner: boolean;
  openInApp: (uri: string) => Promise<boolean>;
  dismissBanner: () => void;
  appMessage: string;
}

interface UseAppDetectionOptions {
  hasSharedContent?: boolean;
  autoCheck?: boolean;
}

export const useAppDetection = (options: UseAppDetectionOptions = {}): UseAppDetectionResult => {
  const { hasSharedContent = false, autoCheck = true } = options;
  
  const [isAppAvailable, setIsAppAvailable] = useState<boolean | null>(null);
  const [showAppBanner, setShowAppBanner] = useState(false);
  
  const isOnMobileWeb = isRunningOnMobileWeb();

  useEffect(() => {
    if (!isOnMobileWeb || !autoCheck) return;

    const checkApp = async () => {
      try {
        const available = await checkNativeAppAvailability();
        setIsAppAvailable(available);
        
        // Show banner if app is available and we have shared content or it's mobile web
        if (available && (hasSharedContent || isOnMobileWeb)) {
          setShowAppBanner(true);
        }
      } catch (error) {
        console.warn('App detection failed:', error);
        setIsAppAvailable(false);
      }
    };

    checkApp();
  }, [isOnMobileWeb, hasSharedContent, autoCheck]);

  const openInApp = async (uri: string): Promise<boolean> => {
    const success = await openInNativeApp(uri);
    if (success) {
      setShowAppBanner(false);
    }
    return success;
  };

  const dismissBanner = () => {
    setShowAppBanner(false);
    // Store dismissal in localStorage to remember user preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('dorkroom-app-banner-dismissed', 'true');
    }
  };

  const appMessage = createAppDetectionMessage(hasSharedContent);

  return {
    isOnMobileWeb,
    isAppAvailable,
    showAppBanner: showAppBanner && isOnMobileWeb && isAppAvailable === true,
    openInApp,
    dismissBanner,
    appMessage,
  };
};