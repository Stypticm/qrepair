'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, isMaster } from '@/stores/authStore';
import { useSignal, initDataState as _initDataState } from '@telegram-apps/sdk-react';
import { postEvent, bindViewportCssVars } from '@telegram-apps/sdk';
import { useTelegramCloudImages } from '@/hooks/useTelegramCloudImages';

export const useMobileAppInit = () => {
    const initDataState = useSignal(_initDataState);
    const {
        setRole,
        userId,
        setTelegramId,
        setCurrentStep,
        initializeTelegram,
        addDebugInfo,
    } = useAppStore();

    const [isLoading, setIsLoading] = useState(true);
    const [isInTelegram, setIsInTelegram] = useState<boolean | null>(null);
    const [isDesktopLike, setIsDesktopLike] = useState(false);
    const [screenHeight, setScreenHeight] = useState(0);

    // Marketplace Feed state
    const [marketplaceItems, setMarketplaceItems] = useState<any[]>([]);
    const [marketplaceOffset, setMarketplaceOffset] = useState(0);
    const marketplaceOffsetRef = useRef(0);
    const [marketplaceHasMore, setMarketplaceHasMore] = useState(true);
    const [marketplaceLoading, setMarketplaceLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');

    const router = useRouter();
    const { getImage } = useTelegramCloudImages();
    const testAdminIds = useMemo(() => ['1', '296925626', '531360988'], []);

    // 1. Redirect logic
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (sessionStorage.getItem('start-over') === 'true') {
                sessionStorage.removeItem('start-over');
                router.push('/request/form');
            }
        }
    }, [router]);

    // 2. Role prefetch
    useEffect(() => {
        if (!isLoading && isMaster(userId)) {
            try {
                router.prefetch('/master/points');
            } catch { }
        }
    }, [isLoading, userId, router]);

    // 3. Screen height tracking
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const updateScreenHeight = () => setScreenHeight(window.innerHeight);
            updateScreenHeight();
            window.addEventListener('resize', updateScreenHeight);
            return () => window.removeEventListener('resize', updateScreenHeight);
        }
    }, []);

    // 4. Telegram Init
    useEffect(() => {
        addDebugInfo('Запуск инициализации Telegram WebApp');
        if (typeof window !== 'undefined') {
            const setupTelegramFeatures = () => {
                initializeTelegram(initDataState);
                try {
                    const wa: any = window.Telegram?.WebApp;
                    const platform = wa?.platform;
                    const isMobilePlatform = platform === 'android' || platform === 'ios';
                    const isDesktopPlatform = !isMobilePlatform && (
                        platform === 'tdesktop' || platform === 'macos' || 
                        platform === 'web' || platform === 'weba' || 
                        platform === 'windows' || platform === 'linux'
                    );

                    if (isMobilePlatform) {
                        try {
                            if (typeof wa?.enableClosingConfirmation === 'function') wa.enableClosingConfirmation();
                            if (typeof wa?.disableVerticalSwipes === 'function') wa.disableVerticalSwipes();
                        } catch (error) {
                            console.error('disableVerticalSwipes failed:', error);
                        }
                    }

                    try { wa?.ready?.(); } catch { }

                    const applySwipeSettings = () => {
                        try {
                            if (isMobilePlatform) {
                                if (typeof wa?.disableVerticalSwipes === 'function') wa.disableVerticalSwipes();
                                if (typeof wa?.enableClosingConfirmation === 'function') wa.enableClosingConfirmation();
                            } else if (isDesktopPlatform) {
                                if (typeof wa?.enableVerticalSwipes === 'function') wa.enableVerticalSwipes();
                            }
                        } catch { }
                    };

                    applySwipeSettings();
                    setTimeout(applySwipeSettings, 300);
                    setTimeout(applySwipeSettings, 1000);

                    if (isMobilePlatform) {
                        const preventCollapseOnTopSwipe = () => {
                            if (window.scrollY === 0 && document.documentElement.scrollTop === 0) {
                                window.scrollTo({ top: 1, behavior: 'instant' });
                            }
                        };
                        setTimeout(preventCollapseOnTopSwipe, 100);
                        const handleTouchStart = () => {
                            if (window.scrollY === 0 && document.documentElement.scrollTop === 0) {
                                window.scrollTo({ top: 1, behavior: 'instant' });
                            }
                        };
                        document.addEventListener('touchstart', handleTouchStart, { passive: true });
                    }
                } catch (e) {
                    try {
                        const wa: any = window.Telegram?.WebApp;
                        const platform = wa?.platform;
                        if (platform === 'android' || platform === 'ios') {
                            postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false });
                        }
                    } catch { }
                }
                try { bindViewportCssVars(); } catch { }
            };

            const checkTelegram = () => {
                const tg = (window as any).Telegram?.WebApp;
                const hasTelegramWebApp = !!tg && tg.platform && tg.platform !== 'unknown';
                const hasTelegramWebviewProxy = !!(window as any).TelegramWebviewProxy;
                const initDataCookie = document.cookie.split('; ').find(row => row.startsWith('_initData='));
                const urlParams = new URLSearchParams(window.location.search);
                const hasTelegramParams = urlParams.has('tgWebAppStartParam') || urlParams.has('tgWebAppVersion');
                return hasTelegramWebApp || hasTelegramWebviewProxy || !!initDataCookie || hasTelegramParams;
            };

            let inTelegram = checkTelegram();
            if (!inTelegram) {
                setTimeout(() => {
                    inTelegram = checkTelegram();
                    setIsInTelegram(inTelegram);
                    if (inTelegram) {
                        setupTelegramFeatures();
                    }
                    setIsLoading(false);
                }, 1000);
            } else {
                setIsInTelegram(inTelegram);
                setIsLoading(false);
                setupTelegramFeatures();
            }

            const detectDesktop = () => setIsDesktopLike(window.innerWidth >= 768);
            detectDesktop();
            window.addEventListener('resize', detectDesktop);
            return () => window.removeEventListener('resize', detectDesktop);
        }
    }, [initializeTelegram, addDebugInfo, initDataState]);

    // 5. Steps recovery
    useEffect(() => {
        const savedStep = sessionStorage.getItem('currentStep');
        if (savedStep) setCurrentStep(savedStep);
    }, [setCurrentStep]);

    // 6. Marketplace loading
    const loadMoreMarketplaceItems = useCallback(async () => {
        setMarketplaceLoading(true);
        try {
            const limit = 12;
            const currentOffset = marketplaceOffsetRef.current;
            const res = await fetch(`/api/market/feed?limit=${limit}&offset=${currentOffset}`, { cache: 'no-store' });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Failed to load feed');

            const newItems = Array.isArray(data.items) ? data.items : [];
            setMarketplaceItems((prev) => [...prev, ...newItems]);
            const nextOffset = currentOffset + (newItems.length || 0);
            marketplaceOffsetRef.current = nextOffset;
            setMarketplaceOffset(nextOffset);
            setMarketplaceHasMore(false);
        } catch (e) {
            console.error('Feed load error', e);
            setMarketplaceHasMore(false);
        } finally {
            setMarketplaceLoading(false);
        }
    }, []);

    const refreshMarketplaceItems = useCallback(async () => {
        setMarketplaceLoading(true);
        try {
            const res = await fetch(`/api/market/feed?limit=12&offset=0`, { cache: 'no-store' });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Failed to refresh feed');

            const newItems = Array.isArray(data.items) ? data.items : [];
            setMarketplaceItems(newItems);
            marketplaceOffsetRef.current = newItems.length;
            setMarketplaceOffset(newItems.length);
            setMarketplaceHasMore(false);
        } catch (e) {
            console.error('Feed refresh error', e);
        } finally {
            setMarketplaceLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoading && marketplaceItems.length === 0 && marketplaceOffsetRef.current === 0 && !marketplaceLoading) {
            loadMoreMarketplaceItems();
        }
    }, [isLoading, marketplaceItems.length, marketplaceLoading, loadMoreMarketplaceItems]);

    useEffect(() => {
        const handleLotAdded = () => refreshMarketplaceItems();
        window.addEventListener('lotAdded', handleLotAdded);
        return () => window.removeEventListener('lotAdded', handleLotAdded);
    }, [refreshMarketplaceItems]);

    return {
        isLoading,
        isInTelegram,
        isDesktopLike,
        screenHeight,
        marketplaceItems,
        marketplaceLoading,
        marketplaceHasMore,
        loadMoreMarketplaceItems,
        viewMode,
        setViewMode,
        getImage,
        userId,
        router
    };
};
