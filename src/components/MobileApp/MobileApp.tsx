'use client';

import { useEffect, useState } from 'react';
import { AdaptiveContainer } from '@/components/AdaptiveContainer/AdaptiveContainer';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import MenuComponent from '@/components/Menu/MenuComponent';

import { useMobileAppInit } from './useMobileAppInit';
import { AuthModal } from './AuthModal';
import { LoadingState } from './LoadingState';
import { MainFeed } from './MainFeed';
import { FAQAccordion } from '@/components/FAQ/FAQAccordion';

export const MobileApp = () => {
    const {
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
    } = useMobileAppInit();

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        const handleOpenLogin = () => setIsLoginModalOpen(true);
        window.addEventListener('openLoginModal', handleOpenLogin);
        return () => window.removeEventListener('openLoginModal', handleOpenLogin);
    }, []);

    if (isLoading || isInTelegram === null) {
        return <LoadingState imageUrl={getImage('animation_running.gif') || '/animation_running.gif'} />;
    }

    return (
        <AdaptiveContainer
            fixedContent={
                <>
                    <AuthModal
                        isOpen={isLoginModalOpen}
                        onClose={() => setIsLoginModalOpen(false)}
                    />

                    <MenuComponent userId={userId as number} router={router} isLoading={isLoading} />

                    {!isInTelegram && <PWAInstallPrompt />}
                </>
            }
        >
            <MainFeed
                isDesktopLike={isDesktopLike}
                viewMode={viewMode}
                marketplaceItems={marketplaceItems}
                marketplaceLoading={marketplaceLoading}
                loadMoreMarketplaceItems={loadMoreMarketplaceItems}
                marketplaceHasMore={marketplaceHasMore}
                setViewMode={setViewMode}
                screenHeight={screenHeight}
            />
            <div className="pb-24 bg-white">
                <FAQAccordion />
            </div>
        </AdaptiveContainer >
    );
};
