'use client';

import { RotatingBanner } from '@/components/RotatingBanner';
import { AdaptiveDeviceFeed } from '@/components/AdaptiveDeviceFeed';
import { Hammer, Coins } from 'lucide-react';
import Link from 'next/link';

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

                                {/* Кнопки сервисов */}
                                <div className="grid grid-cols-2 gap-3 mb-6 px-1">
                                    <Link href="/repair" className="bg-white/60 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center gap-2 shadow-sm border border-gray-100 hover:bg-white/80 transition-all active:scale-[0.96]">
                                        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Hammer className="w-5 h-5 text-teal-600" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-bold text-gray-900 text-sm leading-none">Ремонт</h3>
                                            <p className="text-[10px] text-gray-500 mt-1">Сервис</p>
                                        </div>
                                    </Link>

                                    <Link href="/buyback" className="bg-white/60 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center gap-2 shadow-sm border border-gray-100 hover:bg-white/80 transition-all active:scale-[0.96]">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Coins className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-bold text-gray-900 text-sm leading-none">Скупка</h3>
                                            <p className="text-[10px] text-gray-500 mt-1">Быстрая цена</p>
                                        </div>
                                    </Link>
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
