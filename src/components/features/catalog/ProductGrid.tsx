'use client';

import { Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    condition: string;
    brand: string;
    inStock: boolean;
}

interface ProductGridProps {
    products?: Product[];
    isLoading?: boolean;
}

const MOCK_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'iPhone 15 Pro Max 256GB',
        price: 119990,
        originalPrice: 139990,
        image: 'https://placehold.co/400x400/e2e8f0/64748b?text=iPhone+15+Pro',
        condition: 'Новый',
        brand: 'Apple',
        inStock: true
    },
    {
        id: '2',
        name: 'Samsung Galaxy S24 Ultra',
        price: 99990,
        image: 'https://placehold.co/400x400/e2e8f0/64748b?text=Galaxy+S24',
        condition: 'Как новый',
        brand: 'Samsung',
        inStock: true
    },
    {
        id: '3',
        name: 'MacBook Air M3 13"',
        price: 129990,
        originalPrice: 149990,
        image: 'https://placehold.co/400x400/e2e8f0/64748b?text=MacBook+Air',
        condition: 'Новый',
        brand: 'Apple',
        inStock: true
    },
    {
        id: '4',
        name: 'iPad Pro 12.9" M2',
        price: 89990,
        image: 'https://placehold.co/400x400/e2e8f0/64748b?text=iPad+Pro',
        condition: 'Отличное',
        brand: 'Apple',
        inStock: false
    },
    {
        id: '5',
        name: 'AirPods Pro 2',
        price: 24990,
        image: 'https://placehold.co/400x400/e2e8f0/64748b?text=AirPods+Pro',
        condition: 'Новый',
        brand: 'Apple',
        inStock: true
    },
    {
        id: '6',
        name: 'Apple Watch Series 9',
        price: 44990,
        originalPrice: 49990,
        image: 'https://placehold.co/400x400/e2e8f0/64748b?text=Watch+S9',
        condition: 'Как новый',
        brand: 'Apple',
        inStock: true
    },
];

export const ProductGrid = ({ products = MOCK_PRODUCTS, isLoading }: ProductGridProps) => {
    const { addToCart, isInCart, removeFromCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();

    const handleCartClick = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();

        if (isInCart(product.id)) {
            removeFromCart(product.id);
        } else {
            addToCart({
                id: product.id,
                title: product.name,
                price: product.price,
                cover: product.image,
                photos: [product.image],
                date: new Date().toISOString(),
                condition: product.condition,
                model: product.brand,
            });
        }
    };

    const handleFavoriteClick = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(product.id);
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-apple-lg h-96 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
                const inCart = isInCart(product.id);
                const isFav = isFavorite(product.id);

                return (
                    <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="group bg-white border border-gray-100 rounded-apple-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-teal-200"
                    >
                        {/* Image */}
                        <div className="relative aspect-square bg-gray-50 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />

                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                                {product.originalPrice && (
                                    <Badge className="bg-red-500 text-white font-bold">
                                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                    </Badge>
                                )}
                                {!product.inStock && (
                                    <Badge variant="secondary" className="bg-gray-900/80 text-white">
                                        Под заказ
                                    </Badge>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => handleFavoriteClick(e, product)}
                                    className={cn(
                                        "w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-md",
                                        isFav ? "bg-red-50 hover:bg-red-100 text-red-500" : "bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700"
                                    )}
                                >
                                    <Heart className={cn("w-4 h-4", isFav && "fill-current")} />
                                </button>
                                <button
                                    onClick={(e) => handleCartClick(e, product)}
                                    className={cn(
                                        "w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-md",
                                        inCart ? "bg-teal-600 text-white" : "bg-teal-500 hover:bg-teal-600 text-white"
                                    )}
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-gray-500">{product.brand}</span>
                                <span className="text-xs text-gray-300">•</span>
                                <span className="text-xs text-gray-500">{product.condition}</span>
                            </div>

                            <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-teal-600 transition-colors">
                                {product.name}
                            </h3>

                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold text-gray-900">
                                    {product.price.toLocaleString()} ₽
                                </span>
                                {product.originalPrice && (
                                    <span className="text-sm text-gray-400 line-through mb-1">
                                        {product.originalPrice.toLocaleString()} ₽
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};
