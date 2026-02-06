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
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-4 left-4 right-4 z-[9999] md:hidden pointer-events-auto"
        >
          <div className="bg-white/80 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-3xl p-4 flex flex-col gap-3 max-w-sm mx-auto overflow-hidden relative">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between relative group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex-shrink-0 overflow-hidden border border-gray-100 p-1">
                  <Image
                    src={getPictureUrl('submit.png')}
                    alt="App Icon"
                    width={40}
                    height={40}
                    className="object-cover rounded-xl"
                  />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-gray-900 text-[13px] leading-tight">Qoqos App</h3>
                  <p className="text-gray-500 text-[11px] font-medium leading-tight">Доступно обновление интерфейса</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 bg-gray-100/50 hover:bg-gray-200/50 rounded-full flex items-center justify-center text-gray-400 active:scale-90 transition-all"
              >
                <X size={14} />
              </button>
            </div>

            <div className="relative">
              <p className="text-[13px] text-gray-700 leading-relaxed px-1">
                {isIOS
                  ? 'Чтобы установить, нажмите «Поделиться», затем «На экран "Домой"»'
                  : 'Установите приложение для мгновенного доступа и лучших функций.'
                }
              </p>
            </div>

            {!isIOS && (
              <button
                onClick={handleInstallClick}
                className="w-full py-2.5 bg-[#2dc2c6] text-white text-[13px] font-bold rounded-2xl active:scale-95 transition-all shadow-[0_4px_12px_rgba(45,194,198,0.2)] hover:bg-[#28b1b5]"
              >
                Установить сейчас
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
