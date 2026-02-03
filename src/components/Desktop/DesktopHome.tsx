'use client';

import { motion } from 'framer-motion';
import { DesktopHeader } from './DesktopHeader';
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
            <DesktopHeader />

            <main className="pt-24 pb-12">
                {/* Intro / Filter Header */}
                <div className="max-w-7xl mx-auto px-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-gray-900">
                            Qoqos маркетплейс
                        </h1>
                        <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-8">
                            Проверенные устройства с гарантией и доставкой.
                            <br className="hidden md:block" />
                            Мы проверяем каждый гаджет по необходимым параметрам.
                        </p>

                        <div className="mt-8 mb-12 max-w-2xl mx-auto">
                            <RotatingBanner
                                banners={banners}
                                className=""
                                screenHeight={800} // Force decent height for desktop
                                interval={5000}
                                desktopMode={true}
                            />
                        </div>

                    </motion.div>
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
            </main>

            <footer className="py-12 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm">
                    <p>&copy; 2025 Qoqos.</p>
                </div>
            </footer>
        </div>
    );
};