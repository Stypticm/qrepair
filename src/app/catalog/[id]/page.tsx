'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, ShoppingBag, ArrowLeft, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';
import { OneClickBuyModal } from '@/components/Market/OneClickBuyModal';
import OptimizedPhoneSelector from '@/components/OptimizedPhoneSelector';
import { PaymentButton } from '@/components/PaymentButton';
import { Footer } from '@/components/layout/Footer';

// Use same Product interface as grid
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
    oldPrice?: number | null;
    isAccessory?: boolean;
    targetBrand?: string;
    targetModel?: string;
}

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { addToCart, isInCart, loading: cartLoading } = useCart();
    const { toggleFavorite, isFavorite, loading: favoritesLoading } = useFavorites();

    const [product, setProduct] = useState<Product | null>(null);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [isTradeInModalOpen, setIsTradeInModalOpen] = useState(false);

    // Slide direction state for photo carousel
    // Used when switching variants to know which way to slide
    const [slideDirection, setSlideDirection] = useState(1);

    useEffect(() => {
        const fetchProductData = async () => {
            setIsLoading(true);
            try {
                // In a real scenario you would fetch the specific product first by ID,
                // but since we need all variants, we can use the feed endpoint 
                // similar to Catalog grid (which fetches everything)
                const res = await fetch(`/api/market/feed?limit=200`, { cache: 'no-store' });
                const data = await res.json();

                if (res.ok && Array.isArray(data.items)) {
                    const mapped = data.items.map((item: any) => ({
                        id: item.id,
                        name: item.title,
                        price: item.price || 0,
                        image: item.cover || (item.photos && item.photos[0]) || 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image',
                        photos: item.photos || [item.cover || 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image'],
                        condition: item.condition || 'Новый',
                        brand: item.model?.split(' ')[0] || 'Unknown',
                        model: item.model,
                        storage: item.storage,
                        color: item.color,
                        inStock: true,
                        oldPrice: item.oldPrice,
                        originalPrice: item.oldPrice, // mapping oldPrice to originalPrice for Badge logic
                        description: item.description,
                        isAccessory: item.isAccessory,
                        targetBrand: item.targetBrand,
                        targetModel: item.targetModel,
                    }));

                    setAllProducts(mapped);

                    const foundProduct = mapped.find((p: Product) => p.id === id);
                    if (foundProduct) {
                        setProduct(foundProduct);
                    } else {
                        // Product not found
                    }
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductData();
    }, [id]);

    const handleVariantChange = (newVariant: Product) => {
        // Update URL and trigger Next.js navigation
        router.push(`/catalog/${newVariant.id}`, { scroll: false });
    };

    const currentVariants = useMemo(() => {
        if (!product || !allProducts.length) return [];
        // Standardize comparison by lowering case and trimming
        const modelName = (product.model || product.name || '').toLowerCase().trim();
        return allProducts.filter(p => {
            const pModel = (p.model || p.name || '').toLowerCase().trim();
            return pModel === modelName && !p.isAccessory;
        });
    }, [product, allProducts]);

    const accessories = useMemo(() => {
        if (!product || !allProducts.length) return [];
        const modelName = (product.model || '').toLowerCase().trim();
        const brandName = (product.brand || '').toLowerCase().trim();

        return allProducts.filter(p => {
            if (!p.isAccessory) return false;
            
            const targetModel = (p.targetModel || '').toLowerCase().trim();
            const targetBrand = (p.targetBrand || '').toLowerCase().trim();

            return (targetModel && modelName.includes(targetModel)) || 
                   (targetBrand && brandName === targetBrand);
        }).slice(0, 4);
    }, [product, allProducts]);

    const goToNextPhoto = () => {
        if (product?.photos && product.photos.length > 1) {
            setSlideDirection(1);
            setCurrentPhotoIndex((prev) => (prev + 1) % product.photos!.length);
        }
    };

    const goToPreviousPhoto = () => {
        if (product?.photos && product.photos.length > 1) {
            setSlideDirection(-1);
            setCurrentPhotoIndex((prev) => (prev - 1 + product.photos!.length) % product.photos!.length);
        }
    };

    const handleCartClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!product) return;

        if (isInCart(product.id)) {
            router.push('/cart');
        } else {
            await addToCart({
                id: product.id,
                title: product.name,
                price: product.price,
                cover: product.image,
                photos: [product.image],
                date: new Date().toISOString(),
                condition: product.condition,
                model: product.model || product.brand,
                storage: product.storage,
                color: product.color,
            });
            // остаёмся на карточке, чтобы можно было добавить что-то ещё
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-20 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-20 flex flex-col items-center justify-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Товар не найден</h1>
                <button onClick={() => router.push('/catalog')} className="mt-4 px-6 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors">
                    Вернуться в каталог
                </button>
            </div>
        );
    }

    const isFav = isFavorite(product.id);

    return (
        <div className="min-h-screen bg-white">
            <main className="pt-24 pb-32 max-w-[1400px] mx-auto px-4 md:px-10">
                {/* Breadcrumbs - Full Width */}
                <nav className="flex items-center gap-2 text-[12px] text-gray-400 mb-10 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <Link href="/" className="hover:text-gray-900 transition-colors uppercase tracking-wider">Главная</Link>
                    <span className="opacity-30">/</span>
                    <Link href="/catalog" className="hover:text-gray-900 transition-colors uppercase tracking-wider">Каталог</Link>
                    <span className="opacity-30">/</span>
                    <span className="hover:text-gray-900 transition-colors uppercase tracking-wider">Смартфоны</span>
                    <span className="opacity-30">/</span>
                    <span className="text-gray-900 font-bold uppercase tracking-wider truncate max-w-[200px] md:max-w-none">
                        {product.name}
                    </span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Left Side: Photo Gallery */}
                    <div className="flex flex-col gap-6 sticky top-32">
                        <div className="bg-[#F8F8F8] rounded-[40px] aspect-[4/5] flex items-center justify-center relative overflow-hidden p-8 md:p-16">
                            {/* Sale Badge */}
                            {product.originalPrice && (
                                <div className="absolute top-8 left-8 bg-[#FF3B30] text-white px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-xl z-20">
                                    SALE -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                </div>
                            )}

                            {/* Main Image */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${product.id}-${currentPhotoIndex}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    className="w-full h-full"
                                >
                                    <img
                                        src={product.photos[currentPhotoIndex] || product.image}
                                        alt={product.name}
                                        className="w-full h-full object-contain mix-blend-multiply drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Arrows for Desktop */}
                            {product.photos.length > 1 && (
                                <>
                                    <button
                                        onClick={goToPreviousPhoto}
                                        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-900 shadow-lg border border-white hover:bg-white transition-all active:scale-95 z-10 opacity-0 group-hover:opacity-100"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {product.photos.length > 1 && (
                            <div className="flex gap-4 justify-center overflow-x-auto py-2 scrollbar-hide pb-4">
                                {product.photos.map((photo, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPhotoIndex(i)}
                                        className={cn(
                                            "relative flex-shrink-0 w-20 md:w-24 h-24 md:h-28 rounded-3xl bg-[#F8F8F8] border-2 transition-all duration-300",
                                            i === currentPhotoIndex
                                                ? "border-[#25C27C] scale-105 shadow-xl ring-4 ring-[#25C27C]/5"
                                                : "border-transparent hover:border-gray-200"
                                        )}
                                    >
                                        <img src={photo} alt="" className="w-full h-full object-contain p-3 mix-blend-multiply" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Side: Details and Price Box */}
                    <div className="flex flex-col">
                        <div className="mb-4">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3 block">
                                {product.brand} {product.condition}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.1]">
                                {product.name}
                            </h1>
                        </div>

                        <div className="flex items-center gap-6 mb-10 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="text-green-600">В наличии</span>
                            </div>
                            <span>Артикул: {product.id.slice(0, 8)}</span>
                        </div>

                        {/* Variant Selection Tabs Style */}
                        <div className="space-y-10 mb-12">
                            {/* Memory */}
                            {currentVariants.length > 1 && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Память</label>
                                        <span className="text-xs font-bold text-gray-900">{product.storage}GB</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {Array.from(new Set(currentVariants.map(v => v.storage))).filter(Boolean).map((storage) => {
                                            const variant = currentVariants.find(v => v.storage === storage && v.color === product.color) || currentVariants.find(v => v.storage === storage);
                                            if (!variant) return null;
                                            const isActive = product.storage === storage;
                                            return (
                                                <button
                                                    key={storage as string}
                                                    onClick={() => handleVariantChange(variant)}
                                                    className={cn(
                                                        "h-14 rounded-2xl border-2 font-bold transition-all text-sm",
                                                        isActive
                                                            ? "border-black bg-black text-white shadow-xl shadow-black/10"
                                                            : "border-gray-100 text-gray-500 hover:border-gray-300 bg-gray-50/50"
                                                    )}
                                                >
                                                    {storage}ГБ
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Color Selection with Pills */}
                            {currentVariants.length > 1 && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Цвет</label>
                                        <span className="text-xs font-bold text-gray-900 capitalize">{product.color}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {Array.from(new Set(currentVariants.map(v => v.color))).filter(Boolean).map((color) => {
                                            const variant = currentVariants.find(v => v.color === color && v.storage === product.storage) || currentVariants.find(v => v.color === color);
                                            if (!variant) return null;
                                            const isActive = product.color === color;
                                            return (
                                                <button
                                                    key={color as string}
                                                    onClick={() => handleVariantChange(variant)}
                                                    className={cn(
                                                        "px-5 h-12 rounded-2xl border-2 font-bold transition-all text-[13px] capitalize",
                                                        isActive
                                                            ? "border-black bg-black text-white shadow-lg"
                                                            : "border-gray-100 text-gray-500 hover:border-gray-200"
                                                    )}
                                                >
                                                    {color}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Floating Interaction Box */}
                        <div className="bg-[#F8F8F8] rounded-[40px] p-8 md:p-10 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col gap-8">
                            <div>
                                <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Стоимость</div>
                                <div className="flex items-baseline gap-4">
                                    <span className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
                                        {product.price.toLocaleString()} ₽
                                    </span>
                                    {(product.oldPrice || product.originalPrice) && (
                                        <span className="text-2xl md:text-3xl text-gray-200 line-through font-bold decoration-red-500/30">
                                            {(product.oldPrice || product.originalPrice)!.toLocaleString()} ₽
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-4 text-[13px] font-bold text-gray-500">
                                    <span>Гарантия от магазина</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <span className="text-blue-600">12 месяцев</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={handleCartClick}
                                    disabled={cartLoading}
                                    className={cn(
                                        "h-20 rounded-[28px] font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl overflow-hidden relative group",
                                        isInCart(product.id)
                                            ? "bg-gray-100 text-gray-900"
                                            : "bg-[#25C27C] text-white hover:bg-[#1fa968] shadow-green-500/20"
                                    )}
                                >
                                    <ShoppingCart className="w-6 h-6" />
                                    <span>{isInCart(product.id) ? 'В корзине' : 'Купить'}</span>
                                </button>

                                <button
                                    onClick={() => setIsBuyModalOpen(true)}
                                    className="h-20 bg-white border-2 border-gray-100 text-gray-900 font-black rounded-[28px] hover:border-black transition-all active:scale-95 text-lg shadow-sm"
                                >
                                    В 1 клик
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => setIsTradeInModalOpen(true)}
                                    className="w-full h-16 bg-white border border-gray-100 rounded-3xl flex items-center justify-between px-6 group hover:border-teal-200 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
                                            <RefreshCcw className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-bold text-gray-900">Trade-in оценка</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Обменяйте старый на новый</div>
                                        </div>
                                    </div>
                                    <ArrowLeft className="w-5 h-5 text-gray-300 rotate-180" />
                                </button>

                                {/* <PaymentButton
                                    amount={product.price}
                                    description={product.name}
                                    productId={product.id}
                                    className="w-full h-12 bg-gray-50 hover:bg-gray-100 text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all"
                                >
                                    Прямая оплата картой
                                </PaymentButton> */}
                            </div>
                        </div>

                        {/* Info Sections */}
                        <div className="mt-12 space-y-8">
                            {product.description && (
                                <div className="p-8 bg-blue-50/30 rounded-[32px] border border-blue-50/50">
                                    <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Описание устройства</h3>
                                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap font-medium">
                                        {product.description}
                                    </p>
                                </div>
                            )}

                            {/* Accessory suggestions block */}
                            {!product.isAccessory && accessories.length > 0 && (
                                <div>
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Рекомендуем к покупке</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {accessories.map(acc => (
                                            <Link
                                                key={acc.id}
                                                href={`/catalog/${acc.id}`}
                                                className="bg-white p-4 rounded-[28px] border border-gray-50 hover:border-teal-100 hover:shadow-xl transition-all flex items-center gap-4 text-left group"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                    <img src={acc.image} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[11px] font-bold text-gray-900 truncate leading-tight">{acc.name}</div>
                                                    <div className="text-[10px] font-black text-teal-600 mt-1">{acc.price.toLocaleString()} ₽</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            <OneClickBuyModal
                isOpen={isBuyModalOpen}
                onClose={() => setIsBuyModalOpen(false)}
                productTitle={product.name}
                productPrice={product.price}
                productId={product.id}
            />

            <OptimizedPhoneSelector
                open={isTradeInModalOpen}
                onOpenChange={setIsTradeInModalOpen}
            />
        </div>
    );
}
