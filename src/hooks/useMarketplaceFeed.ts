import { useState, useRef, useCallback, useEffect } from 'react';
import { DeviceCard } from '@/components/AdaptiveDeviceFeed';

// Simple global session cache
let cachedMarketplaceItems: DeviceCard[] = [];
let cachedMarketplaceOffset = 0;
let cachedMarketplaceHasMore = true;

export const useMarketplaceFeed = () => {
    const [marketplaceItems, setMarketplaceItems] = useState<DeviceCard[]>(cachedMarketplaceItems);
    const [marketplaceLoading, setMarketplaceLoading] = useState(false);
    const [marketplaceHasMore, setMarketplaceHasMore] = useState(cachedMarketplaceHasMore);
    const [marketplaceOffset, setMarketplaceOffset] = useState(cachedMarketplaceOffset);
    const marketplaceOffsetRef = useRef(cachedMarketplaceOffset);

    // Sync ref with initial state from cache
    useEffect(() => {
        marketplaceOffsetRef.current = marketplaceOffset;
    }, []);

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
                const existingIds = new Set(prev.map(i => i.id));
                const uniqueNewItems = newItems.filter((i: DeviceCard) => !existingIds.has(i.id));
                const updatedItems = [...prev, ...uniqueNewItems];
                cachedMarketplaceItems = updatedItems;
                return updatedItems;
            });
            const nextOffset = currentOffset + (newItems.length || 0);
            marketplaceOffsetRef.current = nextOffset;
            cachedMarketplaceOffset = nextOffset;
            setMarketplaceOffset(nextOffset);
            if (newItems.length < limit) {
                setMarketplaceHasMore(false);
                cachedMarketplaceHasMore = false;
            }
        } catch (e) {
            console.error('Feed load error', e);
            setMarketplaceHasMore(false);
            cachedMarketplaceHasMore = false;
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
            cachedMarketplaceItems = newItems;
            marketplaceOffsetRef.current = newItems.length;
            cachedMarketplaceOffset = newItems.length;
            setMarketplaceOffset(newItems.length);
            setMarketplaceHasMore(true);
            cachedMarketplaceHasMore = true;
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
