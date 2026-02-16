'use client';

import { RotatingBanner } from '@/components/RotatingBanner';
import { AdaptiveDeviceFeed } from '@/components/AdaptiveDeviceFeed';
import { Hammer } from 'lucide-react';

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
                            <>
                                <div className="w-full flex justify-center mb-6">
                                    <RotatingBanner banners={bannerList} interval={5000} screenHeight={screenHeight} />
                                </div>

                                {/* Анонс ремонта */}
                                <div className="flex justify-center mb-6 px-1">
                                    <div className="w-full bg-white/60 backdrop-blur-md rounded-2xl border border-dashed border-teal-200 p-4 flex items-center gap-4 shadow-sm">
                                        <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Hammer className="w-6 h-6 text-teal-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-900 leading-none">Ремонт</h3>
                                                <span className="text-[10px] font-bold bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded uppercase tracking-wider">Скоро</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Профессиональный ремонт вашей техники
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
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
