'use client';

import { RotatingBanner } from '@/components/RotatingBanner';
import { AdaptiveDeviceFeed } from '@/components/AdaptiveDeviceFeed';
import { Hammer, Coins, Heart, Grid3X3 } from 'lucide-react';
import { BlogGrid } from '@/components/features/blog/BlogGrid';
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
            <div className={`w-full ${isDesktopLike ? 'max-w-[420px]' : ''} mx-auto`}>
                <div className={`${isDesktopLike ? 'max-h-[900px] overflow-auto shadow-2xl rounded-[3rem] mt-4' : ''}`}>
                    <div
                        className={`w-full ${isDesktopLike ? 'max-w-[520px]' : ''} mx-auto min-h-screen bg-gradient-to-b from-background to-surface pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-24 px-4 box-border overflow-x-hidden`}
                    >
                        {viewMode === 'carousel' && (
                            <>
                                {/* <div className="w-full flex justify-center mb-6">
                                    <RotatingBanner banners={bannerList} interval={5000} screenHeight={screenHeight} />
                                </div> */}

                                {/* Кнопки сервисов */}
                                <div className="grid grid-cols-2 gap-3 mb-3 px-1">
                                    <Link href="/repair" className="bg-card/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center gap-2 shadow-sm border border-border hover:bg-card/80 dark:hover:bg-white/10 transition-all active:scale-[0.96]">
                                        <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Hammer className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-bold text-foreground text-sm leading-none">Ремонт</h3>
                                            <p className="text-[10px] text-muted mt-1">Сервис</p>
                                        </div>
                                    </Link>

                                    <Link href="/buyback" className="bg-card/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center gap-2 shadow-sm border border-border hover:bg-card/80 dark:hover:bg-white/10 transition-all active:scale-[0.96]">
                                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Coins className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-bold text-foreground text-sm leading-none">Скупка</h3>
                                            <p className="text-[10px] text-muted mt-1">Быстрая цена</p>
                                        </div>
                                    </Link>
                                </div>

                                {/* Кнопки избранного и каталога */}
                                <div className="grid grid-cols-2 gap-3 mb-6 px-1">
                                    <Link href="/favorites" className="bg-card/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center gap-2 shadow-sm border border-border hover:bg-card/80 dark:hover:bg-white/10 transition-all active:scale-[0.96]">
                                        <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Heart className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-bold text-foreground text-sm leading-none">Избранное</h3>
                                            <p className="text-[10px] text-muted mt-1">Ваши лоты</p>
                                        </div>
                                    </Link>

                                    <Link href="/catalog" className="bg-card/60 dark:bg-white/5 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center gap-2 shadow-sm border border-border hover:bg-card/80 dark:hover:bg-white/10 transition-all active:scale-[0.96]">
                                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Grid3X3 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-bold text-foreground text-sm leading-none">Каталог</h3>
                                            <p className="text-[10px] text-muted mt-1">Все товары</p>
                                        </div>
                                    </Link>
                                </div>
                            </>
                        )}

                        <div className="w-full mt-8">
                            <div className="mb-4 px-2">
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">Новинки</h2>
                            <p className="text-sm text-muted font-medium">Последние поступления</p>
                            </div>
                            <AdaptiveDeviceFeed
                                items={marketplaceItems}
                                isLoading={marketplaceLoading}
                                onLoadMore={loadMoreMarketplaceItems}
                                hasMore={marketplaceHasMore}
                                mode="auto"
                                onViewModeChange={setViewMode}
                                hideSorting={true}
                            />
                        </div>

                        <div className="mt-4 mb-6">
                            <BlogGrid />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
