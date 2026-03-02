'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ShoppingCart, RefreshCcw, ArrowRight, Check, Loader2 } from 'lucide-react';
import { OneClickBuyModal } from '@/components/Market/OneClickBuyModal';
import OptimizedPhoneSelector from '@/components/OptimizedPhoneSelector';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';

interface MarketItemClientProps {
  id: string;
  title: string;
  price: number | null;
  coverImage: string;
  photos: string[];
  model: string;
  storage: string;
  color: string;
  condition: string;
  description: string | null;
}

export function MarketItemClient({
  id,
  title,
  price,
  coverImage,
  photos,
  model,
  storage,
  color,
  condition,
  description,
}: MarketItemClientProps) {
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isTradeInModalOpen, setIsTradeInModalOpen] = useState(false);
  const router = useRouter();
  const { addToCart, isInCart, loading: cartLoading } = useCart();

  const inCart = isInCart(id);

  const formattedPrice = price
    ? `${price.toLocaleString('ru-RU')} ₽`
    : 'Цена не указана';

  const handleAddToCart = async () => {
    if (inCart) {
      router.push('/cart');
      return;
    }

    await addToCart({
      id,
      title,
      price,
      cover: coverImage,
      photos,
      date: new Date().toISOString(),
      model,
      storage,
      color,
      condition,
      description: description || undefined,
    });

    router.push('/cart');
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <div
        className="flex-1 p-2 md:p-6"
        style={{ paddingTop: 'env(--safe-area-top, 10px)' }}
      >
        <div className="w-full max-w-md mx-auto md:max-w-4xl space-y-3 md:space-y-4 pb-20 md:pb-10">
          {/* Desktop: two-column layout */}
          <div className="md:flex md:gap-8 lg:gap-10">
            {/* Image */}
            <div className="w-full md:w-1/2 h-44 md:h-80 lg:h-96 bg-gradient-to-b from-gray-50 to-gray-100 rounded-[1.5rem] md:rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden">
              <Image
                src={coverImage}
                alt={title}
                width={480}
                height={360}
                className="object-contain w-full h-full p-2 md:p-6"
              />
            </div>

            {/* Info */}
            <div className="md:w-1/2 mt-3 md:mt-0 space-y-2.5 md:space-y-3">
              <div>
                <h1 className="text-lg md:text-3xl font-semibold text-gray-900 tracking-tight leading-tight line-clamp-2">
                  {title}
                </h1>
                <div className="mt-0.5 text-base md:text-2xl text-gray-600 font-medium">{formattedPrice}</div>
              </div>

              <div className="p-2 md:p-4 bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 md:mb-2">Описание</div>
                <div className="text-[11px] md:text-sm text-gray-600 leading-snug max-h-16 md:max-h-none overflow-y-auto">
                  {description || 'Описание отсутствует'}
                </div>
              </div>

              <div className="p-2 md:p-4 bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 md:mb-2">Характеристики</div>
                <div className="space-y-1 md:space-y-2 text-[11px] md:text-sm text-gray-700">
                  <div className="flex justify-between border-b border-gray-50 pb-0.5">
                    <span className="text-gray-400">Модель</span>
                    <span className="font-medium text-right ml-2">{model}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-0.5">
                    <span className="text-gray-400">Память</span>
                    <span className="font-medium">{storage}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-0.5">
                    <span className="text-gray-400">Цвет</span>
                    <span className="font-medium max-w-[120px] truncate text-right">{color}</span>
                  </div>
                  <div className="flex justify-between pb-0.5">
                    <span className="text-gray-400">Состояние</span>
                    <span className="font-medium text-teal-600">{condition}</span>
                  </div>
                </div>
              </div>

              <div className="pt-1.5 md:pt-3 flex flex-col gap-1.5 md:gap-2">
                <Button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className={`w-full h-11 md:h-12 rounded-full font-bold text-xs md:text-sm shadow-md group transition-all active:scale-[0.98] ${inCart
                    ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-gray-300/20'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                    }`}
                >
                  {cartLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : inCart ? (
                    <>
                      <Check className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                      В корзине — перейти
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                      В корзину
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => setIsBuyModalOpen(true)}
                  variant="outline"
                  className="w-full h-11 md:h-12 rounded-full border border-teal-200 md:border-2 hover:border-teal-300 hover:bg-teal-50/50 text-teal-700 font-semibold text-xs md:text-sm transition-all active:scale-[0.98]"
                >
                  <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                  Купить в 1 клик
                </Button>

                <Button
                  onClick={() => setIsTradeInModalOpen(true)}
                  variant="outline"
                  className="w-full h-11 md:h-12 rounded-full border border-gray-200 md:border-2 hover:border-teal-100 hover:bg-teal-50/50 text-gray-700 font-semibold text-xs md:text-sm transition-all active:scale-[0.98]"
                >
                  <RefreshCcw className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 text-teal-600" />
                  Оцените по Trade-in
                </Button>
              </div>

              <p className="text-[9px] md:text-[11px] text-gray-400 text-center px-4 md:px-6 leading-tight mb-2 md:mb-0">
                При обмене старой техники вы можете получить скидку до 80% на этот товар по программе Trade-in
              </p>
            </div>
          </div>
        </div>
      </div>

      <OneClickBuyModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        productTitle={title}
        productPrice={price}
      />

      <OptimizedPhoneSelector
        open={isTradeInModalOpen}
        onOpenChange={setIsTradeInModalOpen}
      />
    </div>
  );
}
