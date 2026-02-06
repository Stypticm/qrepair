'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';

export const VersionCheck = () => {
    const [needsUpdate, setNeedsUpdate] = useState(false);

    useEffect(() => {
        // Only run in production-like environments or when window is available
        if (typeof window === 'undefined') return;

        const checkVersion = async () => {
            try {
                const response = await fetch('/version.json', {
                    cache: 'no-store', // Crucial to bypass local cache
                    headers: {
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }
                });
                const data = await response.json();

                // Get the last known build time from local storage
                const lastBuildTime = localStorage.getItem('app_build_time');
                const currentBuildTime = data.buildTime.toString();

                if (lastBuildTime && lastBuildTime !== currentBuildTime) {
                    setNeedsUpdate(true);
                } else {
                    localStorage.setItem('app_build_time', currentBuildTime);
                }
            } catch (error) {
                console.error('Failed to check version:', error);
            }
        };

        // Check on mount
        checkVersion();

        // Check when the app returns from background (common in mobile/PWA)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkVersion();
            }
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);

        // Optional: Polling every 10 minutes
        const interval = setInterval(checkVersion, 600000);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(interval);
        };
    }, []);

    const handleUpdate = () => {
        // Clear caches and reload
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                for (let registration of registrations) {
                    registration.update();
                }
            });
        }

        // Force reload from server
        window.location.reload();
    };

    return (
        <AnimatePresence>
            {needsUpdate && (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="fixed bottom-24 left-4 right-4 z-[60] md:left-auto md:right-4 md:w-80"
                >
                    <div className="bg-black/80 backdrop-blur-xl text-white p-4 rounded-3xl shadow-2xl border border-white/10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center animate-pulse">
                                <RefreshCw size={20} className="text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">Доступно обновление</span>
                                <span className="text-xs text-gray-400">Обновите для новых функций</span>
                            </div>
                        </div>
                        <button
                            onClick={handleUpdate}
                            className="bg-white text-black px-4 py-2 rounded-2xl text-xs font-bold active:scale-95 transition-transform"
                        >
                            Обновить
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
