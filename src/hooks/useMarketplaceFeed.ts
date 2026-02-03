import { useState, useRef, useCallback, useEffect } from 'react';
import { DeviceCard } from '@/components/AdaptiveDeviceFeed';

export const useMarketplaceFeed = () => {
    const [marketplaceItems, setMarketplaceItems] = useState<DeviceCard[]>([]);
    const [marketplaceLoading, setMarketplaceLoading] = useState(false);
    const [marketplaceHasMore, setMarketplaceHasMore] = useState(true);
    const [marketplaceOffset, setMarketplaceOffset] = useState(0);
    const marketplaceOffsetRef = useRef(0);

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
                // Determine uniqueness by id to avoid duplicates if any
                const existingIds = new Set(prev.map(i => i.id));
                const uniqueNewItems = newItems.filter(i => !existingIds.has(i.id));
                return [...prev, ...uniqueNewItems];
            });
            const nextOffset = currentOffset + (newItems.length || 0);
            marketplaceOffsetRef.current = nextOffset;
            setMarketplaceOffset(nextOffset);
            if (newItems.length < limit) {
                setMarketplaceHasMore(false);
            }
        } catch (e) {
            console.error('Feed load error', e);
            setMarketplaceHasMore(false);
        } finally {
            setMarketplaceLoading(false);
        }
    }, []);

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
            setMarketplaceHasMore(true); // Reset hasMore on refresh
        } catch (e) {
            console.error('Feed refresh error', e);
        } finally {
            setMarketplaceLoading(false);
        }
    }, []);

    // Initial load? It's usually controlled by component mount
    // but we can expose a function or just return the states

    return {
        marketplaceItems,
        marketplaceLoading,
        marketplaceHasMore,
        loadMoreMarketplaceItems,
        refreshMarketplaceItems
    };
};
