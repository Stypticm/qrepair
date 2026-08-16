'use client';

import { ReviewsCarousel } from '@/components/features/reviews/ReviewsCarousel';
import { BlogGrid } from '@/components/features/blog/BlogGrid';
import { RotatingBanner } from '@/components/RotatingBanner';
import { AdaptiveDeviceFeed } from '@/components/AdaptiveDeviceFeed';
import { FAQAccordion } from '@/components/FAQ/FAQAccordion';
import { useMarketplaceFeed } from '@/hooks/useMarketplaceFeed';
import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

export const DesktopHome = () => {
    const {
        marketplaceItems,
        marketplaceLoading,
        marketplaceHasMore,
        loadMoreMarketplaceItems,
        refreshMarketplaceItems
    } = useMarketplaceFeed();

    useEffect(() => {
        refreshMarketplaceItems();
    }, [refreshMarketplaceItems]);

    // Banners list - using real filenames from public directory
    const banners = useMemo(() => [
        'banner.png',
        'banner2.png'
    ], []);

    const CoconutBanner = dynamic(() => import('@/components/CoconutBanner'), { ssr: false });

    return (
        <div className="min-h-screen bg-surface">
            <main className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Intro / Filter Header */}
                <div className="mb-8 sm:mb-12">
                    {/* Banners */}
                    {/* <div className="mt-8 mb-12 max-w-2xl mx-auto">
                        <RotatingBanner
                            banners={banners}
                            className=""
                            screenHeight={800} // Force decent height for desktop
                            interval={5000}
                            desktopMode={true}
                        />
                    </div> */}

                    {/* <div className="relative w-full h-[320px] md:h-[400px] rounded-[2rem] overflow-hidden bg-gradient-to-br from-sky-100 to-blue-50 shadow-inner">
                        <CoconutBanner className="" style={{ width: '100%', height: '100%' }} />
                        <div className="absolute inset-0 pointer-events-none flex flex-col justify-center px-12">
                            <h2 className="text-3xl font-bold text-blue-900 leading-tight">Сдай старый телефон —<br />получи выгоду сегодня</h2>
                            <p className="text-blue-600 mt-2 font-medium">Моментальная оценка и честная скупка</p>
                        </div>
                    </div> */}
                </div>

                {/* Marketplace Feed Section */}
                <section className="min-h-[600px] mb-12" id="marketplace">
                    <div className="mb-6 sm:mb-8">
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Новинки</h2>
                        <p className="text-muted mt-2 font-medium text-sm sm:text-base">Самые свежие поступления в нашем каталоге</p>
                    </div>
                    <AdaptiveDeviceFeed
                        items={marketplaceItems.slice(0, 8)}
                        isLoading={marketplaceLoading}
                        hasMore={false}
                        onLoadMore={loadMoreMarketplaceItems}
                        mode="grid"
                        showRecommendationsButton={false}
                        hideSorting={true}
                    />
                </section>

                <BlogGrid />
                <ReviewsCarousel />
                <FAQAccordion />
            </main>
        </div>
    );
};