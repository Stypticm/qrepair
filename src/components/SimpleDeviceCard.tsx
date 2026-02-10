"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getPictureUrl } from "@/core/lib/assets";
import { Heart, ShoppingCart, ShoppingBag, RefreshCcw } from "lucide-react";
import { PaymentButton } from "./PaymentButton";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { DeviceCard } from "./AdaptiveDeviceFeed";
import { OneClickBuyModal } from "./Market/OneClickBuyModal";
import OptimizedPhoneSelector from "./OptimizedPhoneSelector";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SimpleDeviceCardProps {
  cards: DeviceCard[];
  isSingle?: boolean;
}

export function SimpleDeviceCard({ cards, isSingle = false }: SimpleDeviceCardProps) {
  const [active, setActive] = useState<DeviceCard | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const { toggleFavorite, isFavorite, loading: favoritesLoading } = useFavorites();
  const { addToCart, isInCart, loading: cartLoading } = useCart();
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

  // Управление системной кнопкой "Назад" в Telegram
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = (window as any).Telegram?.WebApp;
    if (!tg?.BackButton) return;

    if (active) {
      tg.BackButton.show();
      const handleBack = () => {
        setActive(null);
      };
      tg.BackButton.onClick(handleBack);
      return () => {
        tg.BackButton.offClick(handleBack);
        tg.BackButton.hide();
      };
    } else {
      tg.BackButton.hide();
    }
  }, [active]);

  // Обработчик события закрытия карточки после успешной оплаты
  useEffect(() => {
    const handleCloseDeviceCard = () => {
      setActive(null);
    };

    window.addEventListener('closeDeviceCard', handleCloseDeviceCard);
    return () => window.removeEventListener('closeDeviceCard', handleCloseDeviceCard);
  }, []);

  return (
    <>
      <Dialog open={!!active} onOpenChange={() => setActive(null)}>
        <DialogContent
          className="max-w-sm h-[90vh] p-0 overflow-hidden"
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
              <Image
                width={400}
                height={400}
                src={active?.photos?.[currentPhotoIndex] || active?.cover || getPictureUrl('display_front_new.png') || '/display_front_new.png'}
                alt={`${active?.title} - фото ${currentPhotoIndex + 1}`}
                className="object-contain p-10"
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

          <div className="flex-1 flex flex-col p-3 overflow-y-auto">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <DialogTitle className="font-semibold text-lg text-gray-900 mb-1">
                  {active?.title}
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
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Модель</div>
                <div className="font-semibold text-gray-900 text-sm">{active?.model || 'Не указана'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Память</div>
                <div className="font-semibold text-gray-900 text-sm">{active?.storage || 'Не указана'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Цвет</div>
                <div className="font-semibold text-gray-900 text-sm">{active?.color || 'Не указан'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Состояние</div>
                <div className="font-semibold text-gray-900 text-sm">{active?.condition || 'Не указано'}</div>
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
                        title: active.title,
                        price: active.price,
                        cover: active.cover,
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
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{active && isInCart(active.id) ? 'В корзине' : 'Добавить'}</span>
                </button>

                <button
                  onClick={() => active && toggleFavorite(active.id)}
                  disabled={favoritesLoading}
                  className="flex-1 h-12 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Heart className={active && isFavorite(active.id) ? "w-5 h-5 text-red-500 fill-current" : "w-5 h-5"} />
                  <span>Избранное</span>
                </button>
              </div>

              <button
                onClick={() => setIsBuyModalOpen(true)}
                className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Купить в 1 клик</span>
              </button>

              <button
                onClick={() => setIsTradeInModalOpen(true)}
                className="w-full h-12 border-2 border-gray-100 hover:border-teal-100 text-gray-700 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <RefreshCcw className="w-5 h-5 text-teal-600" />
                <span>Trade-in оценка</span>
              </button>

              <PaymentButton
                amount={active?.price || 0}
                description={active?.title || 'Устройство'}
                productId={active?.id || ''}
                className="w-full h-12 bg-gradient-to-r from-[#007AFF] to-[#00C6FF] hover:from-[#005BBF] hover:to-[#0099CC] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                Оплатить заказ
              </PaymentButton>

              <button
                onClick={() => {
                  setActive(null);
                  const event = new CustomEvent('switchToGrid');
                  window.dispatchEvent(event);
                }}
                className="w-full h-10 bg-gray-50 text-gray-500 text-xs font-medium rounded-xl hover:bg-gray-100 transition-colors"
              >
                Все устройства
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <OneClickBuyModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        productTitle={active?.title || ''}
        productPrice={active?.price || null}
        productId={active?.id}
      />

      <OptimizedPhoneSelector
        open={isTradeInModalOpen}
        onOpenChange={setIsTradeInModalOpen}
      />

      {/* Превью карточки */}
      <div className={isSingle ? "grid grid-cols-1 place-items-center" : "grid grid-cols-1"}>
        {cards.map((card) => (
          <div
            key={`card-${card.id}`}
            onClick={() => setActive(card)}
            className={`${isSingle ? "h-[380px] w-full max-w-sm" : "h-[280px]"} bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300`}
          >
            <div className={`${isSingle ? 'h-78' : 'h-48'} bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden`}>
              <Image
                width={400}
                height={400}
                src={card.cover || getPictureUrl('display_front_new.png') || '/display_front_new.png'}
                alt={card.title}
                className={`${isSingle ? 'h-[380%] -mb-[160%]' : 'h-[380%] -mb-[120%]'} w-full object-cover object-center`}
              />
            </div>

            <div className="p-4 flex flex-col h-full">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                  {card.title}
                </h3>
                {card.price && (
                  <p className="text-lg font-bold text-gray-900 mt-auto">
                    {formatPrice(card.price)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
