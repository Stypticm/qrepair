'use client';

import { Heart, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    photos: string[];
    condition: string;
    brand: string;
    model?: string;
    storage?: string;
    color?: string;
    description?: string;
    inStock: boolean;
    oldPrice?: number | null;
    isAccessory?: boolean;
    targetBrand?: string;
    targetModel?: string;
}

interface ProductGridProps {
    products?: Product[];
    isLoading?: boolean;
}

export const VariantCard = ({ group, allProducts }: { group: Product[], allProducts: Product[] }) => {
    // Default to the first product in the group that is in stock, or just the first if none are in stock
    const defaultProduct = group.find(p => p.inStock) || group[0];
    const [activeProduct, setActiveProduct] = useState<Product>(defaultProduct);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const { addToCart, isInCart, loading: cartLoading } = useCart();
    const { toggleFavorite, isFavorite, loading: favoritesLoading } = useFavorites();
    const router = useRouter();

    const photos = activeProduct.photos && activeProduct.photos.length > 0
        ? activeProduct.photos
        : [activeProduct.image];

    // Reset photo index when variant changes
    useEffect(() => {
        setCurrentPhotoIndex(0);
    }, [activeProduct.id]);

    const inCart = isInCart(activeProduct.id);
    const isFav = isFavorite(activeProduct.id);

    // Extract all unique colors and storages for this specific model group
    const availableColors = useMemo(() => Array.from(new Set(group.map(p => p.color))).filter(Boolean) as string[], [group]);
    const availableStorages = useMemo(() => Array.from(new Set(group.map(p => p.storage))).filter(Boolean) as string[], [group]);

    const handleColorClick = (e: React.MouseEvent, color: string) => {
        e.preventDefault();
        e.stopPropagation();
        // Try to find same storage + new color, else fall back to any product with new color
        const newProduct = group.find(p => p.color === color && p.storage === activeProduct.storage) || group.find(p => p.color === color);
        if (newProduct) setActiveProduct(newProduct);
    };

    const handleStorageClick = (e: React.MouseEvent, storage: string) => {
        e.preventDefault();
        e.stopPropagation();
        // Try to find same color + new storage, else fall back to any product with new storage
        const newProduct = group.find(p => p.storage === storage && p.color === activeProduct.color) || group.find(p => p.storage === storage);
        if (newProduct) setActiveProduct(newProduct);
    };

    const handleFavoriteClick = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(product.id);
    };

    // Helper map of colors for dots (simple implementation for UI)
    const colorMap: Record<string, string> = {
        'Black': 'bg-black', 'Черный': 'bg-black', 'Титан': 'bg-stone-500', 
        'White': 'bg-white', 'Белый': 'bg-white', 'Blue': 'bg-blue-600',
        'Синий': 'bg-blue-600', 'Natural Titanium': 'bg-[#B1AFA7]',
        'Titanium': 'bg-[#B1AFA7]', 'Silver': 'bg-gray-300', 'Серебристый': 'bg-gray-300'
    };
    
    const getColorClass = (colorName: string) => {
        return colorMap[colorName] || colorMap[colorName.split(' ')[0]] || 'bg-gray-400';
    };

    return (
        <Link
            href={`/catalog/${activeProduct.id}`}
            className="group bg-white border border-gray-100/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-900/5 transition-all duration-300 hover:-translate-y-1 block h-full w-full flex flex-col"
        >
            {/* Image Box */}
            <div className="relative h-40 md:h-48 bg-gray-50/50 flex items-center justify-center overflow-hidden w-full">
                <AnimatePresence mode="popLayout">
                    <motion.img
                        key={`${activeProduct.id}-${currentPhotoIndex}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        src={photos[currentPhotoIndex]}
                        alt={activeProduct.name}
                        className="w-full h-full object-contain p-6 mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                </AnimatePresence>

                {/* Photo Carousel Controls (Transparent overlays) */}
                {photos.length > 1 && (
                    <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex">
                        <div 
                            className="w-1/2 h-full cursor-pointer" 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
                            }}
                        />
                        <div 
                            className="w-1/2 h-full cursor-pointer" 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
                            }}
                        />
                    </div>
                )}

                {/* Carousel Dots */}
                {photos.length > 1 && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 z-20">
                        {photos.map((_, idx) => (
                          <div 
                            key={idx}
                            className={cn(
                              "w-1 h-1 rounded-full transition-all duration-300",
                              idx === currentPhotoIndex ? "bg-gray-900 w-2.5" : "bg-gray-300"
                            )}
                          />
                        ))}
                    </div>
                )}

                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {(activeProduct.oldPrice || activeProduct.originalPrice) && activeProduct.price < (activeProduct.oldPrice || activeProduct.originalPrice)! && (
                        <Badge className="bg-[#FF3B30] text-white border-0 font-black px-2 py-1 rounded-lg text-[10px] uppercase tracking-wider shadow-sm select-none">
                            -{Math.round((1 - activeProduct.price / (activeProduct.oldPrice || activeProduct.originalPrice)! ) * 100)}%
                        </Badge>
                    )}
                    {!activeProduct.inStock && (
                        <Badge variant="secondary" className="bg-gray-900/80 backdrop-blur-md text-white border-0 select-none">
                            Под заказ
                        </Badge>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={(e) => handleFavoriteClick(e, activeProduct)}
                        disabled={favoritesLoading}
                        className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-md bg-white text-gray-700 hover:text-red-500",
                            isFav && "text-red-500 bg-red-50"
                        )}
                    >
                        <Heart className={cn("w-5 h-5", isFav && "fill-current")} />
                    </button>
                </div>
            </div>

            {/* Content Box */}
            <div className="p-3 md:p-4 flex flex-col flex-1 bg-white relative z-20">
                {/* Variant Selectors (Inline) */}
                {(availableColors.length > 1 || availableStorages.length > 1) && (
                    <div className="flex flex-col gap-3 mb-3" onClick={e => e.preventDefault()}>
                        
                        {/* Storage Selection */}
                        {availableStorages.length > 1 && (
                            <div className="flex flex-wrap gap-1.5">
                                {availableStorages.map(storage => {
                                    const variant = group.find(p => p.storage === storage && p.color === activeProduct.color) || group.find(p => p.storage === storage);
                                    const isAvailable = !!variant;
                                    const isActive = activeProduct.storage === storage;
                                    
                                    return (
                                        <button
                                            key={storage}
                                            onClick={(e) => isAvailable && handleStorageClick(e, storage)}
                                            disabled={!isAvailable}
                                            className={cn(
                                                "px-2 py-1 text-[10px] md:text-xs font-bold rounded-lg border transition-all select-none",
                                                isActive ? "bg-gray-900 text-white border-gray-900" 
                                                : isAvailable ? "bg-white text-gray-600 border-gray-200 hover:border-gray-400 group-hover:bg-gray-50" 
                                                : "bg-gray-50/50 text-gray-300 border-gray-100 cursor-not-allowed hidden"
                                            )}
                                        >
                                            {storage}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Color Selection (Dots) */}
                        {availableColors.length > 1 && (
                            <div className="flex items-center gap-1.5">
                                {availableColors.map(color => {
                                    const variant = group.find(p => p.color === color && p.storage === activeProduct.storage) || group.find(p => p.color === color);
                                    const isAvailable = !!variant;
                                    const isActive = activeProduct.color === color;
                                    
                                    return (
                                        <button
                                            key={color}
                                            onClick={(e) => isAvailable && handleColorClick(e, color)}
                                            disabled={!isAvailable}
                                            title={color}
                                            className={cn(
                                                "w-5 h-5 md:w-6 md:h-6 rounded-full border-2 transition-all p-0.5 select-none focus:outline-none",
                                                isActive ? "border-gray-900 scale-110 shadow-sm" 
                                                : isAvailable ? "border-transparent hover:border-gray-300" 
                                                : "border-transparent opacity-20 hidden"
                                            )}
                                        >
                                            <div className={cn("w-full h-full rounded-full border border-black/10", getColorClass(color))} />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400">{activeProduct.brand}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-[11px] font-medium text-gray-500">{activeProduct.condition}</span>
                </div>

                <AnimatePresence mode="wait">
                    <motion.h3 
                        key={activeProduct.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-bold text-[13px] md:text-sm leading-tight text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors"
                    >
                        {/* If grouped, just show model name or full name */}
                        {group.length > 1 ? (activeProduct.model || activeProduct.name) : activeProduct.name}
                    </motion.h3>
                </AnimatePresence>

                <div className="flex items-baseline gap-2.5 mt-auto pt-2">
                    <span className="text-xl md:text-[22px] font-black tracking-tight text-gray-900 leading-none">
                        {activeProduct.price.toLocaleString()} ₽
                    </span>
                    {(activeProduct.oldPrice || activeProduct.originalPrice) && (activeProduct.oldPrice || activeProduct.originalPrice)! > activeProduct.price && (
                        <span className="text-[13px] text-gray-300 line-through font-bold decoration-red-500/50">
                            {(activeProduct.oldPrice || activeProduct.originalPrice)!.toLocaleString()} ₽
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export const ProductGrid = ({ products = [], isLoading }: ProductGridProps) => {

    const groupedProducts = useMemo(() => {
        if (!products || products.length === 0) return [];
        
        const groups: Record<string, Product[]> = {};
        
        products.forEach(p => {
            // Unify by Model Name or generic name so variants group correctly
            const key = p.model || p.name.replace(/(\d+GB|\d+TB|Black|White|Silver|Titanium|Blue|Purple)/gi, '').trim();
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(p);
        });

        return Object.values(groups);
    }, [products]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-3xl h-[340px] animate-pulse overflow-hidden">
                        <div className="h-48 bg-gray-100 w-full" />
                        <div className="p-4 space-y-3">
                            <div className="h-3 bg-gray-200 rounded-full w-1/4" />
                            <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                            <div className="h-4 bg-gray-200 rounded-full w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (groupedProducts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-gray-100 text-center mx-4 md:mx-0">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ничего не найдено</h3>
                <p className="text-gray-500 max-w-sm">
                    Мы не смогли найти товары по вашему запросу. Возможно, вы использовали слишком строгие фильтры.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {groupedProducts.map((group, index) => (
                <VariantCard key={`${group[0]?.model || group[0]?.name}-${index}`} group={group} allProducts={products} />
            ))}
        </div>
    );
};


