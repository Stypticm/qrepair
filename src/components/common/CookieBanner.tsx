'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-2xl rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center flex-shrink-0 text-teal-600">
              <Cookie className="w-6 h-6" />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Мы используем файлы cookie</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Это необходимо для того, чтобы сайт работал корректно и вам было удобно им пользоваться.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={handleAccept}
                className="flex-1 md:flex-none px-6 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all active:scale-95"
              >
                Принято
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
