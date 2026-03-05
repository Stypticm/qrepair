"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import Image from "next/image";
import { getPictureUrl } from "@/core/lib/assets";
import { Heart, ShoppingCart, ShoppingBag, RefreshCcw, ChevronRight } from "lucide-react";
import { PaymentButton } from "./PaymentButton";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { DeviceCard } from "./AdaptiveDeviceFeed";
import { OneClickBuyModal } from "./Market/OneClickBuyModal";
import OptimizedPhoneSelector from "./OptimizedPhoneSelector";
import Link from "next/link";

interface AceternityDeviceCardProps {
  cards: DeviceCard[];
  isSingle?: boolean;
}

export function AceternityDeviceCard({ cards, isSingle = false }: AceternityDeviceCardProps) {
  const [active, setActive] = useState<DeviceCard | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isTradeInModalOpen, setIsTradeInModalOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const { toggleFavorite, isFavorite, loading: favoritesLoading } = useFavorites();
  const { addToCart, isInCart, loading: cartLoading } = useCart();
  const router = useRouter();

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

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
          <div className="fixed inset-0 grid place-items-center z-[99999] p-4">
            <motion.div
              layoutId={`card-${active.id}-${id}`}
              ref={ref}
              className="w-full max-w-sm max-h-[90vh] flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="overflow-y-auto flex flex-col h-full scrollbar-hide">
                <motion.div layoutId={`image-${active.id}-${id}`} className="relative h-[35vh] shrink-0">
                  <div
                    className="w-full h-full bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden"
                    onTouchStart={(e) => {
                      touchStartX.current = e.changedTouches[0].clientX;
                      touchStartY.current = e.changedTouches[0].clientY;
                    }}
                    onTouchEnd={(e) => {
                      const endX = e.changedTouches[0].clientX;
                      const endY = e.changedTouches[0].clientY;
                      if (touchStartX.current !== null && touchStartY.current !== null) {
                        const dx = endX - touchStartX.current;
                        const dy = Math.abs(endY - touchStartY.current);
                        if (Math.abs(dx) > Math.max(30, dy)) {
                          if (dx < 0) goToNextPhoto(); else goToPreviousPhoto();
                        }
                      }
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentPhotoIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <Image
                          width={400}
                          height={400}
                          src={active.photos?.[currentPhotoIndex] || active.cover || getPictureUrl('display_front_new.png')}
                          alt={active.title}
                          className="w-full h-full object-contain p-8"
                        />
                      </motion.div>
                    </AnimatePresence>

                    {active.photos && active.photos.length > 1 && (
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                        {active.photos.map((_, index) => (
                          <div
                            key={index}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentPhotoIndex ? 'bg-gray-900 w-3' : 'bg-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <motion.h3
                      layoutId={`title-${active.id}-${id}`}
                      className="font-bold text-xl text-gray-900 leading-tight mb-1"
                    >
                      {active.title}
                    </motion.h3>
                    <motion.div
                      layoutId={`price-${active.id}-${id}`}
                      className="text-lg font-medium text-gray-500"
                    >
                      {formatPrice(active.price)}
                    </motion.div>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <div className="text-gray-400 mb-0.5 uppercase tracking-tighter font-bold">Память</div>
                        <div className="font-semibold text-gray-800">{active.storage || '—'}</div>
                      </div>
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <div className="text-gray-400 mb-0.5 uppercase tracking-tighter font-bold">Состояние</div>
                        <div className="font-semibold text-teal-600">{active.condition || '—'}</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 pt-2">
                      <button
                        onClick={() => setIsBuyModalOpen(true)}
                        className="w-full h-14 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        <span>Купить в 1 клик</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={async () => {
                            if (isInCart(active.id)) router.push('/cart');
                            else {
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
                          className="flex-1 h-12 bg-blue-50 text-blue-600 font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>{isInCart(active.id) ? 'В корзине' : 'В корзину'}</span>
                        </button>

                        <button
                          onClick={() => toggleFavorite(active.id)}
                          className="flex-1 h-12 bg-gray-50 text-gray-600 font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-colors"
                        >
                          <Heart className={isFavorite(active.id) ? "w-4 h-4 text-red-500 fill-current" : "w-4 h-4"} />
                          <span>Избранное</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setIsTradeInModalOpen(true)}
                        className="w-full h-12 border-2 border-gray-100 hover:border-teal-100 text-gray-700 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all"
                      >
                        <RefreshCcw className="w-4 h-4 text-teal-500" />
                        <span>Trade-in оценка</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setActive(null)}
                    className="mt-6 text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

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

      <div className={isSingle ? "grid grid-cols-1 place-items-center" : "grid grid-cols-2 gap-3"}>
        {cards.map((card) => (
          <motion.div
            layoutId={`card-${card.id}-${id}`}
            key={`card-${card.id}-${id}`}
            onClick={() => setActive(card)}
            className={`group ${isSingle ? "h-[380px] w-full max-w-md" : "h-[280px]"} bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300`}
          >
            <motion.div layoutId={`image-${card.id}-${id}`}>
              <div className={`${isSingle ? 'h-72' : 'h-44'} bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden`}>
                <Image
                  width={400}
                  height={400}
                  src={card.cover || getPictureUrl('display_front_new.png')}
                  alt={card.title}
                  className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            </motion.div>

            <div className="p-4 flex flex-col h-full">
              <div className="flex-1">
                <motion.h3
                  layoutId={`title-${card.id}-${id}`}
                  className="font-bold text-gray-900 text-sm mb-1 line-clamp-2"
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
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
