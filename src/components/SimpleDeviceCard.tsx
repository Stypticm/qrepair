"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getPictureUrl } from "@/core/lib/assets";
import { Heart, ShoppingCart } from "lucide-react";
import { sendTon } from "@/core/ton/tonconnect";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { DeviceCard } from "./AdaptiveDeviceFeed";
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

  return (
    <>
      {/* Простое модальное окно с shadcn/ui Dialog */}
      <Dialog open={!!active} onOpenChange={() => setActive(null)}>
        <DialogContent 
          className="max-w-sm h-[80vh] p-0 overflow-hidden"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <DialogHeader className="p-0">
            {/* Изображение */}
            <div 
              className="w-full h-[35vh] bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden"
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
                className="w-full h-full object-contain p-4"
              />
              
              {/* Индикаторы фото */}
              {active?.photos && active.photos.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1 z-10">
                  {active.photos.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentPhotoIndex ? 'bg-white scale-125' : 'bg-gray-400/70'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Контент */}
          <div className="flex-1 flex flex-col overflow-y-auto p-3">
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
            
            {/* Характеристики */}
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

            {/* Кнопки */}
            <div className="flex flex-col gap-2 mt-auto">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={async () => {
                    if (active && isInCart(active.id)) {
                      router.push('/cart')
                    } else {
                      await addToCart({
                        id: active!.id,
                        title: active!.title,
                        price: active!.price,
                        cover: active!.cover,
                        photos: active!.photos,
                        model: active!.model,
                        storage: active!.storage,
                        color: active!.color,
                        condition: active!.condition,
                        description: active!.description,
                        date: new Date().toISOString(),
                      });
                    }
                  }}
                  disabled={cartLoading}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {active && isInCart(active.id) ? (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>В корзине</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>Добавить</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => active && toggleFavorite(active.id)}
                  disabled={favoritesLoading}
                  className="flex-1 h-12 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {active && isFavorite(active.id) ? (
                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                  ) : (
                    <Heart className="w-5 h-5" />
                  )}
                  <span>Избранное</span>
                </button>
              </div>
              
              {/* Кнопка "Все устройства" в Apple-стиле */}
              <button
                onClick={() => {
                  setActive(null); // Закрываем модальное окно
                  const event = new CustomEvent('switchToGrid');
                  window.dispatchEvent(event);
                }}
                className="w-full h-12 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-medium rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] mb-3 border border-gray-200"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                >
                  <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                </svg>
                Все устройства
              </button>
              
              <button
                onClick={() => sendTon(active!.price?.toString() || '0', active!.title)}
                className="w-full h-12 bg-gradient-to-r from-[#007AFF] to-[#00C6FF] hover:from-[#005BBF] hover:to-[#0099CC] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                >
                  <path
                    d="M12 2c5.523 0 10 2.477 10 5.533 0 1.42-.88 3.29-2.34 5.384-1.37 1.97-3.24 4.13-5.2 6.11-1.4 1.41-2.79 2.62-3.78 3.34a.99.99 0 0 1-1.36-.2c-.99-.72-2.38-1.93-3.78-3.34-1.96-1.98-3.83-4.14-5.2-6.11C.88 10.823 0 8.953 0 7.533 0 4.477 4.477 2 10 2h2Zm0 2h-2C6.06 4 2 5.57 2 7.533c0 .86.68 2.36 2.02 4.29 1.27 1.82 3.06 3.9 4.96 5.83 1.07 1.06 2.08 1.96 3.02 2.67.94-.71 1.95-1.61 3.02-2.67 1.9-1.93 3.69-4.01 4.96-5.83 1.34-1.93 2.02-3.43 2.02-4.29C22 5.57 17.94 4 14 4h-2Zm0 2 4 6h-3v6h-2v-6H8l4-6Z"
                  />
                </svg>
                Купить за TON
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Превью карточки */}
      <div className={isSingle ? "grid grid-cols-1 place-items-center" : "grid grid-cols-1"}>
        {cards.map((card) => (
          <div
            key={`card-${card.id}`}
            onClick={() => setActive(card)}
            className={`${
              isSingle 
                ? "h-[380px] w-full max-w-sm" 
                : "h-[280px]"
            } bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300`}
          >
            <div>
              <div 
                className={`${
                  isSingle ? 'h-78' : 'h-48'
                } bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden`}
              >
                <Image
                  width={400}
                  height={400}
                  src={card.cover || getPictureUrl('display_front_new.png') || '/display_front_new.png'}
                  alt={card.title}
                  className={`${
                    isSingle ? 'h-[380%] -mb-[160%]' : 'h-[380%] -mb-[120%]'
                  } w-full object-cover object-center`}
                />
              </div>
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
              
              {/* Кнопка "Все устройства" в Apple-стиле */}
              <button
                onClick={() => {
                  // Переход к сетке всех устройств
                  const event = new CustomEvent('switchToGrid');
                  window.dispatchEvent(event);
                }}
                className="w-full mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-medium rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                >
                  <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                </svg>
                Все устройства
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
