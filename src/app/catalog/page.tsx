'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Filters } from '@/components/features/catalog/Filters';
import { ProductGrid } from '@/components/features/catalog/ProductGrid';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
}

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
    const [totalCount, setTotalCount] = useState(0);

    // Load products from API
    const loadProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const limit = 24;
            const res = await fetch(`/api/market/feed?limit=${limit}&offset=0`, { cache: 'no-store' });
            const data = await res.json();

            if (res.ok && Array.isArray(data.items)) {
                setProducts(data.items);
                setTotalCount(data.items.length);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        // TODO: Apply filters to products
        console.log('Filters changed:', newFilters);
    };

    // Filter products based on search query
    const filteredProducts = searchQuery
        ? products.filter(item => {
            const query = searchQuery.toLowerCase();
            return (
                item.title?.toLowerCase().includes(query) ||
                item.model?.toLowerCase().includes(query) ||
                item.storage?.toLowerCase().includes(query) ||
                item.color?.toLowerCase().includes(query)
            );
        })
        : products;

    // Transform marketplace items to product format
    const transformedProducts = filteredProducts.map(item => ({
        id: item.id,
        name: item.title,
        price: item.price || 0,
        image: item.cover || (item.photos && item.photos[0]) || 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image',
        condition: item.condition || 'Новый',
        brand: item.model?.split(' ')[0] || 'Unknown',
        inStock: true,
    }));

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="pt-6 pb-12">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Breadcrumbs */}
                    <nav className="mb-6 text-sm text-gray-500">
                        <Link href="/" className="hover:text-teal-600">Главная</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium">Каталог</span>
                    </nav>

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            {searchQuery ? `Результаты поиска: "${searchQuery}"` : 'Каталог товаров'}
                        </h1>
                        <p className="text-gray-500">Найдено {transformedProducts.length} товаров</p>
                    </div>

                    {/* Layout: Filters + Grid */}
                    <div className="flex gap-8">
                        <Filters onFilterChange={handleFilterChange} />

                        <div className="flex-1">
                            {/* Sort Options */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium">
                                        Популярные
                                    </button>
                                    <button className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
                                        Дешевле
                                    </button>
                                    <button className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
                                        Дороже
                                    </button>
                                    <button className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
                                        Новинки
                                    </button>
                                </div>

                                <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-teal-500">
                                    <option>Показывать по 24</option>
                                    <option>Показывать по 48</option>
                                    <option>Показывать по 96</option>
                                </select>
                            </div>

                            <ProductGrid products={transformedProducts} isLoading={isLoading} />
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
