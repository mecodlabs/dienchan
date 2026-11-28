import React from 'react';

const DISMISSED_STORAGE_KEY = 'dienchan.pwaPromptDismissed.v1';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface PwaInstallState {
  isStandalone: boolean;
  isIos: boolean;
  isInAppBrowser: boolean;
  canNativeInstall: boolean;
  showAutoBanner: boolean;
  showGuideModal: boolean;
  triggerInstall: () => Promise<void>;
  openGuideModal: () => void;
  closeGuideModal: () => void;
  dismissAutoBanner: () => void;
}

function detectEnvironment(): {
  isStandalone: boolean;
  isIos: boolean;
  isInAppBrowser: boolean;
  isMobileViewport: boolean;
} {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isStandalone: false,
      isIos: false,
      isInAppBrowser: false,
      isMobileViewport: false,
    };
  }

  const ua = navigator.userAgent || '';
  const navWithStandalone = navigator as Navigator & { standalone?: boolean };
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    navWithStandalone.standalone === true;

  const isIos =
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const isInAppBrowser =
    /Zalo|FBAN|FBAV|FB_IAB|Messenger|Instagram|Line\/|musical_ly|TikTok/i.test(ua);

  const isMobileViewport = window.innerWidth < 1024;

  return { isStandalone, isIos, isInAppBrowser, isMobileViewport };
}

function loadDismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISSED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function saveDismissed(): void {
  try {
    window.localStorage.setItem(DISMISSED_STORAGE_KEY, '1');
  } catch {
    // Ignore storage errors
  }
}

export function usePwaInstall(): PwaInstallState {
  const [env, setEnv] = React.useState(detectEnvironment);
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [dismissed, setDismissed] = React.useState<boolean>(() => loadDismissed());
  const [showGuideModal, setShowGuideModal] = React.useState(false);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowGuideModal(false);
      setEnv((prev) => ({ ...prev, isStandalone: true }));
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => {
      setEnv(detectEnvironment());
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    mediaQuery.addEventListener?.('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener?.('change', handleDisplayModeChange);
    };
  }, []);

  const dismissAutoBanner = React.useCallback(() => {
    setDismissed(true);
    saveDismissed();
  }, []);

  const triggerInstall = React.useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (choice.outcome === 'accepted') {
        setEnv((prev) => ({ ...prev, isStandalone: true }));
      }
      return;
    }
    setShowGuideModal(true);
  }, [deferredPrompt]);

  const canNativeInstall = Boolean(deferredPrompt);

  // Show subtle auto banner only on mobile when not installed and not dismissed
  const showAutoBanner =
    !env.isStandalone &&
    !dismissed &&
    env.isMobileViewport &&
    (canNativeInstall || env.isIos);

  return {
    isStandalone: env.isStandalone,
    isIos: env.isIos,
    isInAppBrowser: env.isInAppBrowser,
    canNativeInstall,
    showAutoBanner,
    showGuideModal,
    triggerInstall,
    openGuideModal: () => setShowGuideModal(true),
    closeGuideModal: () => setShowGuideModal(false),
    dismissAutoBanner,
  };
}
