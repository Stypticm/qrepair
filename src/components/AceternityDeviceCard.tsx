"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import Image from "next/image";
import { getPictureUrl } from "@/core/lib/assets";
import { Heart, ShoppingCart } from "lucide-react";
import { sendTon } from "@/core/ton/tonconnect";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { DeviceCard } from "./AdaptiveDeviceFeed";

interface AceternityDeviceCardProps {
  cards: DeviceCard[];
  isSingle?: boolean;
}

export function AceternityDeviceCard({ cards, isSingle = false }: AceternityDeviceCardProps) {
  const [active, setActive] = useState<DeviceCard | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const { toggleFavorite, isFavorite, loading: favoritesLoading } = useFavorites();
  const { addToCart, isInCart, loading: cartLoading } = useCart();
  const router = useRouter();

  // Touch events для фото-карусели
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const lastWheelTs = useRef<number>(0);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
        setCurrentPhotoIndex(0);
      }
    }

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

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
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md h-full w-full z-[99999]"
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-[99999]">
            <motion.button
              key={`button-${active.id}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex absolute top-4 right-4 items-center justify-center bg-white rounded-full h-8 w-8 shadow-lg"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            
            <motion.div
              layoutId={`card-${active.id}-${id}`}
              ref={ref}
              className="w-full max-w-sm h-[80vh] flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl"
            >
              <motion.div layoutId={`image-${active.id}-${id}`}>
                <div 
                  className="w-full h-[35vh] bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden"
                  onTouchStart={(e) => {
                    touchStartX.current = e.changedTouches[0].clientX;
                    touchStartY.current = e.changedTouches[0].clientY;
                    e.stopPropagation();
                  }}
                  onTouchMove={(e) => {
                    if (Math.abs(e.changedTouches[0].clientY - touchStartY.current!) > 10) {
                      e.preventDefault();
                    }
                  }}
                  onTouchEnd={(e) => {
                    touchEndX.current = e.changedTouches[0].clientX;
                    const endY = e.changedTouches[0].clientY;
                    if (touchStartX.current !== null && touchEndX.current !== null && touchStartY.current !== null) {
                      const dx = touchEndX.current - touchStartX.current;
                      const dy = Math.abs(endY - touchStartY.current);
                      if (Math.abs(dx) > Math.max(30, dy)) {
                        if (dx < 0) goToNextPhoto(); else goToPreviousPhoto();
                      }
                    }
                    touchStartX.current = null;
                    touchStartY.current = null;
                    touchEndX.current = null;
                  }}
                  onWheel={(e) => {
                    const now = Date.now();
                    if (now - lastWheelTs.current < 350) return;
                    lastWheelTs.current = now;
                    if (e.deltaY > 20) goToNextPhoto();
                    else if (e.deltaY < -20) goToPreviousPhoto();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') goToNextPhoto();
                    if (e.key === 'ArrowLeft') goToPreviousPhoto();
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPhotoIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <Image
                        width={400}
                        height={400}
                        src={active.photos?.[currentPhotoIndex] || active.cover || getPictureUrl('display_front_new.png') || '/display_front_new.png'}
                        alt={`${active.title} - фото ${currentPhotoIndex + 1}`}
                        className="w-full h-full object-contain p-4"
                      />
                    </motion.div>
                  </AnimatePresence>
                  
                  {active.photos && active.photos.length > 1 && (
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
              </motion.div>

              <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="flex justify-between items-start p-3">
                  <div className="flex-1">
                    <motion.h3
                      layoutId={`title-${active.id}-${id}`}
                      className="font-semibold text-lg text-gray-900 mb-1"
                    >
                      {active.title}
                    </motion.h3>
                    {active.description && (
                      <motion.p
                        layoutId={`description-${active.id}-${id}`}
                        className="text-gray-600 text-sm mb-2"
                      >
                        {active.description}
                      </motion.p>
                    )}
                    <motion.div
                      layoutId={`price-${active.id}-${id}`}
                      className="text-xl font-bold text-gray-900 mt-2"
                    >
                      {formatPrice(active.price)}
                    </motion.div>
                  </div>
                </div>
                
                <div className="p-3 pt-0">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {/* Характеристики */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Модель</div>
                        <div className="font-semibold text-gray-900 text-sm">{active.model || 'Не указана'}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Память</div>
                        <div className="font-semibold text-gray-900 text-sm">{active.storage || 'Не указана'}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Цвет</div>
                        <div className="font-semibold text-gray-900 text-sm">{active.color || 'Не указан'}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Состояние</div>
                        <div className="font-semibold text-gray-900 text-sm">{active.condition || 'Не указано'}</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 pt-1">
                      <div className="grid grid-cols-2 gap-1">
                        <motion.button
                          onClick={async () => {
                            if (isInCart(active.id)) {
                              router.push('/cart')
                            } else {
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
                          {isInCart(active.id) ? (
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
                        </motion.button>

                        <motion.button
                          onClick={() => toggleFavorite(active.id)}
                          disabled={favoritesLoading}
                          className="flex-1 h-12 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                          {isFavorite(active.id) ? (
                            <Heart className="w-5 h-5 text-red-500 fill-current" />
                          ) : (
                            <Heart className="w-5 h-5" />
                          )}
                          <span>Избранное</span>
                        </motion.button>
                      </div>
                      <button
                        onClick={() => sendTon(active.price?.toString() || '0', active.title)}
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
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <div className={isSingle ? "grid grid-cols-1 place-items-center" : "grid grid-cols-2 gap-3"}>
        {cards.map((card) => (
          <motion.div
            layoutId={`card-${card.id}-${id}`}
            key={`card-${card.id}-${id}`}
            onClick={() => setActive(card)}
            className={`${
              isSingle 
                ? "h-[380px] w-full max-w-md" 
                : "h-[280px]"
            } bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300`}
          >
            <motion.div layoutId={`image-${card.id}-${id}`}>
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
            </motion.div>
            
            <div className="p-4 flex flex-col h-full">
              <div className="flex-1">
                <motion.h3
                  layoutId={`title-${card.id}-${id}`}
                  className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2"
                >
                  {card.title}
                </motion.h3>
                {card.price && (
                  <motion.div
                    layoutId={`price-${card.id}-${id}`}
                    className="text-lg font-bold text-gray-900 mt-auto"
                  >
                    {formatPrice(card.price)}
                  </motion.div>
                )}
              </div>
              
              <motion.div
                layoutId={`price-${card.id}-${id}`}
                className="text-lg font-bold text-gray-900 mt-auto"
              >
                {formatPrice(card.price)}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-gray-600"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};
