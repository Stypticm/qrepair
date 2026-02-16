'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export const useVersionCheck = () => {
    const [needsUpdate, setNeedsUpdate] = useState(false);
    const lastCheckRef = useRef<number>(0);

    const checkVersion = useCallback(async () => {
        // Prevent too frequent checks
        const now = Date.now();
        if (now - lastCheckRef.current < 30000) return; // 30 seconds throttle
        lastCheckRef.current = now;

        try {
            const response = await fetch('/version.json', {
                cache: 'no-store',
                headers: {
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }
            });
            const data = await response.json();

            const lastBuildTime = localStorage.getItem('app_build_time');
            const currentBuildTime = data.buildTime.toString();

            if (lastBuildTime && lastBuildTime !== currentBuildTime) {
                console.log('🔄 New version detected:', data.version);
                setNeedsUpdate(true);
            } else if (!lastBuildTime) {
                localStorage.setItem('app_build_time', currentBuildTime);
            }
        } catch (error) {
            console.error('Failed to check version:', error);
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        checkVersion();

        const handleFocus = () => {
            console.log('📱 App focused, checking version...');
            checkVersion();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkVersion();
            }
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('visibilitychange', handleVisibilityChange);

        const interval = setInterval(checkVersion, 300000); // 5 minutes

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(interval);
        };
    }, [checkVersion]);

    const performUpdate = useCallback(() => {
        // We catch the build time AGAIN just before reload to be absolutely sure it's stored
        fetch('/version.json', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                localStorage.setItem('app_build_time', data.buildTime.toString());
                
                // Unregister Service Workers
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then((registrations) => {
                        for (let registration of registrations) {
                            registration.update();
                        }
                    });
                }

                console.log('✅ Update applied, reloading...');
                // Preserve current URL instead of potentially redirecting to home
                const currentUrl = window.location.href;
                window.location.href = currentUrl;
            })
            .catch(() => {
                // Fallback reload - also preserve URL
                const currentUrl = window.location.href;
                window.location.href = currentUrl;
            });
    }, []);

    return { needsUpdate, performUpdate, checkVersion };
};
