'use client';

import { Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, RefreshCcw } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { OneClickBuyModal } from '@/components/Market/OneClickBuyModal';
import OptimizedPhoneSelector from '@/components/OptimizedPhoneSelector';
import { PaymentButton } from '@/components/PaymentButton';

interface Product {
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
        photos: ['https://placehold.co/400x400/e2e8f0/64748b?text=iPhone+15+Pro'],
        condition: 'Новый',
        brand: 'Apple',
        model: 'iPhone 15 Pro Max',
        storage: '256GB',
        color: 'Titanium',
        inStock: true
    },
    {
        id: '2',
        name: 'Samsung Galaxy S24 Ultra',
        price: 99990,
        image: 'https://placehold.co/400x400/e2e8f0/64748b?text=Galaxy+S24',
        photos: ['https://placehold.co/400x400/e2e8f0/64748b?text=Galaxy+S24'],
        condition: 'Как новый',
        brand: 'Samsung',
        model: 'Galaxy S24 Ultra',
        storage: '512GB',
        color: 'Black',
        inStock: true
    },
    {
        id: '3',
        name: 'MacBook Air M3 13"',
        price: 129990,
        originalPrice: 149990,
        image: 'https://placehold.co/400x400/e2e8f0/64748b?text=MacBook+Air',
        photos: ['https://placehold.co/400x400/e2e8f0/64748b?text=MacBook+Air'],
        condition: 'Новый',
        brand: 'Apple',
        storage: '256GB/8GB',
        color: 'Midnight',
        inStock: true
    },
    {
        id: '4',
        name: 'iPad Pro 12.9" M2',
        price: 89990,
        image: 'https://placehold.co/400x400/e2e8f0/64748b?text=iPad+Pro',
        photos: ['https://placehold.co/400x400/e2e8f0/64748b?text=iPad+Pro'],
        condition: 'Отличное',
        brand: 'Apple',
        storage: '256GB',
        inStock: false
    },
    {
        id: '5',
        name: 'AirPods Pro 2',
        price: 24990,
        image: 'https://placehold.co/400x400/e2e8f0/64748b?text=AirPods+Pro',
        photos: ['https://placehold.co/400x400/e2e8f0/64748b?text=AirPods+Pro'],
        condition: 'Новый',
        brand: 'Apple',
        color: 'White',
        inStock: true
    },
    {
        id: '6',
        name: 'Apple Watch Series 9',
        price: 44990,
        originalPrice: 49990,
        image: 'https://placehold.co/400x400/e2e8f0/64748b?text=Watch+S9',
        photos: ['https://placehold.co/400x400/e2e8f0/64748b?text=Watch+S9'],
        condition: 'Как новый',
        brand: 'Apple',
        inStock: true
    },
];

export const ProductGrid = ({ products = MOCK_PRODUCTS, isLoading }: ProductGridProps) => {
    const { addToCart, isInCart, removeFromCart, loading: cartLoading } = useCart();
    const { toggleFavorite, isFavorite, loading: favoritesLoading } = useFavorites();
    const [active, setActive] = useState<Product | null>(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [isTradeInModalOpen, setIsTradeInModalOpen] = useState(false);
    const router = useRouter();

    const goToNextPhoto = () => {
        if (active?.photos && active.photos.length > 1) {
            setCurrentPhotoIndex((prev) => (prev + 1) % active.photos!.length);
        }
    };

    const goToPreviousPhoto = () => {
        if (active?.photos && active.photos.length > 1) {
            setCurrentPhotoIndex((prev) => (prev - 1 + active.photos!.length) % active.photos!.length);
        }
    };

    const formatPrice = (price: number | null) => {
        if (price === null) return 'Цена не указана';
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const handleCartClick = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();

        if (isInCart(product.id)) {
            router.push('/cart');
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
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-3xl h-80 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {products.map((product) => {
                const inCart = isInCart(product.id);
                const isFav = isFavorite(product.id);

                return (
                    <button
                        type="button"
                        key={product.id}
                        onClick={(e) => {
                            e.preventDefault();
                            setActive(product);
                        }}
                        className="group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:border-teal-200 cursor-pointer flex flex-col h-full w-full text-left"
                    >
                        {/* Image */}
                        <div className="relative h-44 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700"
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
                        <div className="p-3 flex flex-col flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-gray-500">{product.brand}</span>
                                <span className="text-xs text-gray-300">•</span>
                                <span className="text-xs text-gray-500">{product.condition}</span>
                            </div>

                            <h3 className="font-bold text-sm md:text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                                {product.name}
                            </h3>

                            <div className="flex items-end gap-2">
                                <span className="text-xl md:text-2xl font-bold text-gray-900">
                                    {product.price.toLocaleString()} ₽
                                </span>
                                {product.originalPrice && (
                                    <span className="text-sm text-gray-400 line-through mb-1">
                                        {product.originalPrice.toLocaleString()} ₽
                                    </span>
                                )}
                            </div>
                        </div>
                    </button>
                );
            })}

            {/* Modal for viewing product */}
            <Dialog open={!!active} onOpenChange={() => setActive(null)}>
                <DialogContent
                    className="max-w-sm h-[90vh] p-0 overflow-hidden rounded-[32px]"
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                >
                    <DialogHeader>
                        <div
                            className="w-full h-[35vh] bg-gradient-to-b flex items-center justify-center relative overflow-hidden rounded-2xl"
                            onTouchStart={(e) => {
                                e.stopPropagation();
                                const startX = e.changedTouches[0].clientX;
                                const startY = e.changedTouches[0].clientY;
                                e.currentTarget.setAttribute('data-start-x', startX.toString());
                                e.currentTarget.setAttribute('data-start-y', startY.toString());
                            }}
                            onTouchEnd={(e) => {
                                e.stopPropagation();
                                const startX = parseFloat(e.currentTarget.getAttribute('data-start-x') || '0');
                                const startY = parseFloat(e.currentTarget.getAttribute('data-start-y') || '0');
                                const endX = e.changedTouches[0].clientX;
                                const endY = e.changedTouches[0].clientY;
                                const dx = endX - startX;
                                const dy = Math.abs(endY - startY);

                                if (Math.abs(dx) > Math.max(30, dy)) {
                                    e.preventDefault();
                                    if (dx < 0) goToNextPhoto();
                                    else goToPreviousPhoto();
                                }
                            }}
                        >
                            <img
                                src={active?.photos?.[currentPhotoIndex] || active?.image || 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image'}
                                alt={`${active?.name} - фото ${currentPhotoIndex + 1}`}
                                className="w-full h-full object-contain p-8"
                            />

                            {active?.photos && active.photos.length > 1 && (
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1 z-10">
                                    {active.photos.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentPhotoIndex ? 'bg-white scale-125' : 'bg-gray-400/70'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </DialogHeader>

                    <div className="flex-1 flex flex-col p-4 overflow-y-auto">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <DialogTitle className="font-semibold text-lg text-gray-900 mb-1">
                                    {active?.name}
                                </DialogTitle>
                                {active?.description && (
                                    <DialogDescription className="text-gray-600 text-sm mb-2">
                                        {active.description}
                                    </DialogDescription>
                                )}
                                <div className="text-xl font-bold text-gray-900 mt-2">
                                    {formatPrice(active?.price || null)}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Модель</div>
                                <div className="font-semibold text-gray-900 text-sm">{active?.model || 'Не указана'}</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Память</div>
                                <div className="font-semibold text-gray-900 text-sm">{active?.storage || 'Не указана'}</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Цвет</div>
                                <div className="font-semibold text-gray-900 text-sm">{active?.color || 'Не указан'}</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Состояние</div>
                                <div className="font-semibold text-teal-600 text-sm">{active?.condition || 'Не указано'}</div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-auto">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={async () => {
                                        if (active && isInCart(active.id)) {
                                            router.push('/cart')
                                        } else if (active) {
                                            await addToCart({
                                                id: active.id,
                                                title: active.name,
                                                price: active.price,
                                                cover: active.image,
                                                photos: active.photos,
                                                model: active.model,
                                                storage: active.storage,
                                                color: active.color,
                                                condition: active.condition,
                                                description: active.description,
                                                date: new Date().toISOString(),
                                            });
                                        }
                                    }}
                                    disabled={cartLoading}
                                    className="flex-1 h-12 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-2xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    <span>{active && isInCart(active.id) ? 'В корзине' : 'Добавить'}</span>
                                </button>

                                <button
                                    onClick={() => active && toggleFavorite(active.id)}
                                    disabled={favoritesLoading}
                                    className="flex-1 h-12 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold rounded-2xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    <Heart className={active && isFavorite(active.id) ? "w-5 h-5 text-red-500 fill-current" : "w-5 h-5"} />
                                    <span>Избранное</span>
                                </button>
                            </div>

                            <button
                                onClick={() => setIsBuyModalOpen(true)}
                                className="w-full h-12 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                <span>Купить в 1 клик</span>
                            </button>

                            <button
                                onClick={() => setIsTradeInModalOpen(true)}
                                className="w-full h-12 border-2 border-gray-100 hover:border-teal-100 text-gray-700 font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                <RefreshCcw className="w-5 h-5 text-teal-600" />
                                <span>Trade-in оценка</span>
                            </button>

                            <PaymentButton
                                amount={active?.price || 0}
                                description={active?.name || 'Устройство'}
                                productId={active?.id || ''}
                                productDetails={active ? {
                                    id: active.id,
                                    title: active.name,
                                    price: active.price,
                                    cover: active.image,
                                    photos: active.photos,
                                    model: active.brand,
                                    storage: active.storage,
                                    color: active.color,
                                    condition: active.condition,
                                    description: active.description,
                                } : undefined}
                                className="w-full h-12 bg-gradient-to-r from-[#007AFF] to-[#00C6FF] hover:from-[#005BBF] hover:to-[#0099CC] text-white font-semibold rounded-2xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                Оплатить заказ
                            </PaymentButton>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <OneClickBuyModal
                isOpen={isBuyModalOpen}
                onClose={() => setIsBuyModalOpen(false)}
                productTitle={active?.name || ''}
                productPrice={active?.price || null}
                productId={active?.id}
            />

            <OptimizedPhoneSelector
                open={isTradeInModalOpen}
                onOpenChange={setIsTradeInModalOpen}
            />
        </div>
    );
};
