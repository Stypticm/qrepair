'use client';

import { Footer } from '@/components/layout/Footer';
import { Filters } from '@/components/features/catalog/Filters';
import { ProductGrid } from '@/components/features/catalog/ProductGrid';
import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal, X } from 'lucide-react';
import type { FilterState } from '@/components/features/catalog/Filters';

interface Product {
    id: string;
    title: string;
    price: number | null;
    cover: string | null;
    photos: string[];
    model?: string;
    storage?: string;
    color?: string;
    condition?: string;
    date?: string;
}

type SortKey = 'popular' | 'cheap' | 'expensive' | 'newest';

function CatalogContent() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    const [filters, setFilters] = useState<FilterState>({
        priceRange: [0, 200000],
        brands: [],
        conditions: [],
        inStock: false
    });

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const LIMIT = 12;

    const [sortKey, setSortKey] = useState<SortKey>('popular');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const loadProducts = useCallback(async (currentOffset: number, isLoadMore = false) => {
        if (isLoadMore) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
        }

        try {
            const res = await fetch(`/api/market/feed?limit=${LIMIT}&offset=${currentOffset}`, { cache: 'no-store' });
            const data = await res.json();

            if (res.ok && Array.isArray(data.items)) {
                if (data.items.length < LIMIT) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

                if (isLoadMore) {
                    setProducts(prev => [...prev, ...data.items]);
                } else {
                    setProducts(data.items);
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [LIMIT]);

    useEffect(() => {
        setOffset(0);
        setHasMore(true);
        loadProducts(0, false);
    }, [loadProducts]);

    const handleLoadMore = () => {
        const nextOffset = offset + LIMIT;
        setOffset(nextOffset);
        loadProducts(nextOffset, true);
    };

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
    };

    // Apply search + filters + sort
    const transformedProducts = useMemo(() => {
        let result = [...products];

        // Search query
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.title?.toLowerCase().includes(q) ||
                item.model?.toLowerCase().includes(q) ||
                item.storage?.toLowerCase().includes(q) ||
                item.color?.toLowerCase().includes(q)
            );
        }

        // Price filter
        if (filters.priceRange[0] > 0 || filters.priceRange[1] < 200000) {
            result = result.filter(item => {
                const price = item.price || 0;
                return price >= filters.priceRange[0] && price <= filters.priceRange[1];
            });
        }

        // Brand filter
        if (filters.brands.length > 0) {
            result = result.filter(item => {
                const brand = item.model?.split(' ')[0] || '';
                return filters.brands.some(b => brand.toLowerCase().includes(b.toLowerCase()));
            });
        }

        // Condition filter
        if (filters.conditions.length > 0) {
            result = result.filter(item =>
                filters.conditions.includes(item.condition || 'Новый')
            );
        }

        // Sort
        switch (sortKey) {
            case 'cheap':
                result.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'expensive':
                result.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'newest':
                result.sort((a, b) => {
                    const da = a.date ? new Date(a.date).getTime() : 0;
                    const db = b.date ? new Date(b.date).getTime() : 0;
                    return db - da;
                });
                break;
            default:
                break;
        }

        return result.map(item => ({
            id: item.id,
            name: item.title,
            price: item.price || 0,
            image: item.cover || (item.photos && item.photos[0]) || 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image',
            condition: item.condition || 'Новый',
            brand: item.model?.split(' ')[0] || 'Unknown',
            inStock: true,
        }));
    }, [products, searchQuery, filters, sortKey]);

    const sortButtons: { key: SortKey; label: string }[] = [
        { key: 'popular', label: 'Популярные' },
        { key: 'cheap', label: 'Дешевле' },
        { key: 'expensive', label: 'Дороже' },
        { key: 'newest', label: 'Новинки' },
    ];

    return (
        <div className="min-h-screen bg-white pt-4">
            <main className="pt-6 pb-12">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    {/* Breadcrumbs */}
                    <nav className="mb-6 text-sm text-gray-500">
                        <Link href="/" className="hover:text-teal-600">Главная</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium">Каталог</span>
                    </nav>

                    {/* Page Header */}
                    <div className="mb-6 md:mb-8 flex items-end justify-between">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1">
                                {searchQuery ? `Результаты: «${searchQuery}»` : 'Каталог'}
                            </h1>
                            <p className="text-gray-500 text-sm">{transformedProducts.length} товаров</p>
                        </div>
                        {/* Mobile filter toggle */}
                        <button
                            onClick={() => setMobileFiltersOpen(true)}
                            className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Фильтры
                        </button>
                    </div>

                    {/* Layout: Filters + Grid */}
                    <div className="flex gap-8">
                        {/* Desktop filters */}
                        <div className="hidden md:block">
                            <Filters onFilterChange={handleFilterChange} />
                        </div>

                        {/* Mobile filters drawer */}
                        {mobileFiltersOpen && (
                            <div className="fixed inset-0 z-50 md:hidden">
                                <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
                                <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto">
                                    <div className="flex items-center justify-between p-4 border-b">
                                        <span className="font-bold text-gray-900">Фильтры</span>
                                        <button onClick={() => setMobileFiltersOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <Filters onFilterChange={(f) => { handleFilterChange(f); setMobileFiltersOpen(false); }} />
                                </div>
                            </div>
                        )}

                        <div className="flex-1">
                            {/* Sort Options */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 overflow-x-auto">
                                <div className="flex gap-2">
                                    {sortButtons.map(btn => (
                                        <button
                                            key={btn.key}
                                            onClick={() => setSortKey(btn.key)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${sortKey === btn.key
                                                ? 'bg-gray-900 text-white'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {btn.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <ProductGrid products={transformedProducts} isLoading={isLoading} />

                            {!isLoading && hasMore && transformedProducts.length > 0 && (
                                <div className="mt-8 flex justify-center">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isLoadingMore}
                                        className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-900 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isLoadingMore ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                Загрузка...
                                            </>
                                        ) : (
                                            'Показать ещё'
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function CatalogPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <CatalogContent />
        </Suspense>
    );
}
