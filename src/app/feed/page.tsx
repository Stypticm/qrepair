'use client'

import { AdaptiveDeviceFeed } from '@/components/AdaptiveDeviceFeed'
import { Button } from '@/components/ui/button';
import { useState, useRef, useCallback, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { useRouter } from 'next/navigation';

import MenuComponent from '@/components/Menu/MenuComponent';
import { useAppStore } from '@/stores/authStore';

export default function FeedPage() {
    const router = useRouter();

    const { userId } = useAppStore();

    // Состояние для marketplace
    const [marketplaceItems, setMarketplaceItems] = useState<Array<{
        id: string;
        title: string;
        price: number | null;
        date: string;
        cover: string | null;
        photos: string[];
        model?: string;
        storage?: string;
        color?: string;
        condition?: string;
        description?: string;
    }>>([]);
    const [marketplaceOffset, setMarketplaceOffset] = useState(0);
    const marketplaceOffsetRef = useRef(0);
    const [marketplaceHasMore, setMarketplaceHasMore] = useState(true);
    const [marketplaceLoading, setMarketplaceLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isGridViewMode, setIsGridViewMode] = useState(false);

    // Загружаем данные при инициализации
    useEffect(() => {
        if (!isLoading && marketplaceItems.length === 0 && marketplaceOffsetRef.current === 0 && !marketplaceLoading) {
            loadMoreMarketplaceItems();
        }
        // намеренно не добавляем loadMoreMarketplaceItems в зависимости, чтобы не триггерить повторно
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading, marketplaceItems.length, marketplaceLoading]);

    // Функция загрузки marketplace данных
    const loadMoreMarketplaceItems = useCallback(async () => {
        console.log('Loading marketplace items...');
        setMarketplaceLoading(true);
        try {
            const limit = 12;
            const currentOffset = marketplaceOffsetRef.current;
            console.log('Fetching from API with offset:', currentOffset);
            const res = await fetch(`/api/market/feed?limit=${limit}&offset=${currentOffset}`, { cache: 'no-store' });
            const data = await res.json();
            console.log('API response:', data);
            if (!res.ok) throw new Error(data?.error || 'Failed to load feed');

            const newItems = Array.isArray(data.items) ? data.items : [];
            console.log('New items loaded:', newItems.length);
            setMarketplaceItems((prev) => {
                const updated = [...prev, ...newItems];
                console.log('Total items after update:', updated.length);
                return updated;
            });
            const nextOffset = currentOffset + (newItems.length || 0);
            marketplaceOffsetRef.current = nextOffset;
            setMarketplaceOffset(nextOffset);
            // Мы хотим загрузить только один пакет из 12
            setMarketplaceHasMore(false);
        } catch (e) {
            console.error('Feed load error', e);
            setMarketplaceHasMore(false);
        } finally {
            setMarketplaceLoading(false);
        }
    }, []);

    // Функция обновления marketplace данных (для автообновления)
    const refreshMarketplaceItems = useCallback(async () => {
        setMarketplaceLoading(true);
        try {
            const limit = 12;
            const res = await fetch(`/api/market/feed?limit=${limit}&offset=0`, { cache: 'no-store' });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Failed to refresh feed');

            const newItems = Array.isArray(data.items) ? data.items : [];
            setMarketplaceItems(newItems);
            marketplaceOffsetRef.current = newItems.length;
            setMarketplaceOffset(newItems.length);
            setMarketplaceHasMore(false);
        } catch (e) {
            console.error('Feed refresh error', e);
        } finally {
            setMarketplaceLoading(false);
        }
    }, []);

    // Слушатель для автообновления после добавления лота
    useEffect(() => {
        const handleLotAdded = () => {
            console.log('Lot added, refreshing marketplace...');
            refreshMarketplaceItems();
        };

        // Слушаем событие добавления лота
        window.addEventListener('lotAdded', handleLotAdded);

        return () => {
            window.removeEventListener('lotAdded', handleLotAdded);
        };
    }, [refreshMarketplaceItems]);

    const handleViewModeChange = useCallback((mode: 'grid' | 'carousel') => {
        setIsGridViewMode(mode === 'grid');
    }, []);

    return (
        <div className="w-full h-screen grid place-items-center p-4">
            <div className='flex justify-center items-center fixed top-5 right-1/2 left-1/2'>
                <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-full bg-gray-400"
                >
                    <ArrowUp className="w-10 h-10" />
                </Button>
            </div>
            <div className="w-full max-w-[420px] bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 p-3">
                <AdaptiveDeviceFeed
                    items={marketplaceItems}
                    isLoading={marketplaceLoading}
                    onLoadMore={loadMoreMarketplaceItems}
                    hasMore={marketplaceHasMore}
                    mode="auto"
                    onViewModeChange={handleViewModeChange}
                />
            </div>
            {/* Нижнее меню — в центре */}
            <MenuComponent userId={userId as number} router={router} isLoading={isLoading} />
        </div>
    )
}