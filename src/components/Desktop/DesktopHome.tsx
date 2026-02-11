'use client';

import { Footer } from '@/components/layout/Footer';
import { ReviewsCarousel } from '@/components/features/reviews/ReviewsCarousel';
import { BlogGrid } from '@/components/features/blog/BlogGrid';
import { RotatingBanner } from '@/components/RotatingBanner';
import { AdaptiveDeviceFeed } from '@/components/AdaptiveDeviceFeed';
import { FAQAccordion } from '@/components/FAQ/FAQAccordion';
import { useMarketplaceFeed } from '@/hooks/useMarketplaceFeed';
import { useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/Header';

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

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="pb-16">
                {/* Intro / Filter Header */}
                <div className="max-w-7xl mx-auto px-6 mb-12 pt-12">
                    {/* Banners */}
                    <div className="mt-8 mb-12 max-w-2xl mx-auto">
                        <RotatingBanner
                            banners={banners}
                            className=""
                            screenHeight={800} // Force decent height for desktop
                            interval={5000}
                            desktopMode={true}
                        />
                    </div>
                </div>

                {/* Marketplace Feed Section */}
                <section className="min-h-[600px]" id="marketplace">
                    <div className="max-w-7xl mx-auto px-6">
                        <AdaptiveDeviceFeed
                            items={marketplaceItems}
                            isLoading={marketplaceLoading}
                            hasMore={marketplaceHasMore}
                            onLoadMore={loadMoreMarketplaceItems}
                            mode="grid"
                            showRecommendationsButton={false}
                        />
                    </div>
                </section>

                <ReviewsCarousel />
                <BlogGrid />
                <FAQAccordion />
            </main>

            <Footer />
        </div>
    );
};