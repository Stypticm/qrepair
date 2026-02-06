'use client';

import { RotatingBanner } from '@/components/RotatingBanner';
import { AdaptiveDeviceFeed } from '@/components/AdaptiveDeviceFeed';

interface MainFeedProps {
    isDesktopLike: boolean;
    viewMode: 'carousel' | 'grid';
    marketplaceItems: any[];
    marketplaceLoading: boolean;
    loadMoreMarketplaceItems: () => void;
    marketplaceHasMore: boolean;
    setViewMode: (mode: 'carousel' | 'grid') => void;
    screenHeight: number;
}

export const MainFeed = ({
    isDesktopLike,
    viewMode,
    marketplaceItems,
    marketplaceLoading,
    loadMoreMarketplaceItems,
    marketplaceHasMore,
    setViewMode,
    screenHeight
}: MainFeedProps) => {
    const bannerList = ['banner.png', 'banner2.png'];

    return (
        <div className={`${isDesktopLike ? 'flex justify-center' : ''}`}>
            <div className="w-full max-w-[420px]">
                <div className={`${isDesktopLike ? 'max-h-[900px] overflow-auto shadow-2xl rounded-[3rem] mt-4' : ''}`}>
                    <div
                        className={`w-full ${isDesktopLike ? 'max-w-[520px]' : 'max-w-[480px]'} mx-auto min-h-screen bg-gradient-to-b from-white to-gray-50 pt-2 pb-24 px-4 box-border`}
                    >
                        {viewMode === 'carousel' && (
                            <div className="w-full flex justify-center mb-6">
                                <RotatingBanner banners={bannerList} interval={5000} screenHeight={screenHeight} />
                            </div>
                        )}

                        <div className="w-full">
                            <AdaptiveDeviceFeed
                                items={marketplaceItems}
                                isLoading={marketplaceLoading}
                                onLoadMore={loadMoreMarketplaceItems}
                                hasMore={marketplaceHasMore}
                                mode="auto"
                                onViewModeChange={setViewMode}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
