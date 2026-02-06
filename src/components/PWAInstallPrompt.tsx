'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, PlusSquare } from 'lucide-react';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';

interface PWAInstallPromptProps {
  isIOS?: boolean;
}

export const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(isStandalone);
    if (isStandalone) return;

    // Detect Platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // For iOS, show prompt after a delay if not already shown this session
      const hasSeenPrompt = localStorage.getItem('pwa_prompt_seen');
      if (!hasSeenPrompt) {
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
      }
    } else {
      // For Android/Desktop, listen to beforeinstallprompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        const hasSeenPrompt = localStorage.getItem('pwa_prompt_seen');
        if (!hasSeenPrompt) {
          setShowPrompt(true);
        }
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }
  }, []);

  // Manual trigger listener
  useEffect(() => {
    const handleShowPrompt = () => setShowPrompt(true);
    window.addEventListener('showPwaPrompt', handleShowPrompt);
    return () => window.removeEventListener('showPwaPrompt', handleShowPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_seen', 'true');
  };

  return (
    <AnimatePresence>
      {isStandalone || !showPrompt ? null : (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
        >
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl p-4 flex flex-col gap-4 max-w-sm mx-auto">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                  <Image
                    src={getPictureUrl('submit.png')}
                    alt="App Icon"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-gray-900 text-sm">Установить Qoqos</h3>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {isIOS
                      ? 'Добавьте на главный экран для быстрого доступа'
                      : 'Установите приложение для лучшего опыта'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 p-1 -mt-1 -mr-1"
              >
                <X size={20} />
              </button>
            </div>

            {isIOS ? (
              <div className="flex flex-col gap-2 text-sm text-gray-600 bg-gray-50/50 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-white rounded-md shadow-sm text-blue-500">
                    <Share size={14} />
                  </span>
                  <span>Нажмите «Поделиться»</span>
                </div>
                <div className="w-px h-3 bg-gray-200 ml-3" />
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-white rounded-md shadow-sm text-gray-700">
                    <PlusSquare size={14} />
                  </span>
                  <span>Выберите «На экран &quot;Домой&quot;»</span>
                </div>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-xl active:scale-95 transition-transform"
              >
                Установить
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
