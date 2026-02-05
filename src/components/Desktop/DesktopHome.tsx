'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ReviewsCarousel } from '@/components/features/reviews/ReviewsCarousel';
import { BlogGrid } from '@/components/features/blog/BlogGrid';
import { RotatingBanner } from '@/components/RotatingBanner';
import { AdaptiveDeviceFeed } from '@/components/AdaptiveDeviceFeed';
import { useMarketplaceFeed } from '@/hooks/useMarketplaceFeed';
import { useEffect, useMemo } from 'react';

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
        <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
            <Header />

            <main className="pt-0 pb-12">
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
            </main>

            <Footer />
        </div>
    );
};