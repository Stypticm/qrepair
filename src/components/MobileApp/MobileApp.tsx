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
import { getPictureUrl } from '@/core/lib/assets';

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
        return <LoadingState />;
    }

    return (
        <AdaptiveContainer
            fixedContent={
                <>
                    <MenuComponent userId={userId as number} router={router} isLoading={isLoading} />

                    {!isInTelegram && <PWAInstallPrompt />}

                    <AuthModal
                        isOpen={isLoginModalOpen}
                        onClose={() => setIsLoginModalOpen(false)}
                    />
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
