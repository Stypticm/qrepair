"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import Image from "next/image";
import { getPictureUrl } from "@/core/lib/assets";
import { Page } from "@/components/Page";
import { Heart, ShoppingCart, Share2, Star } from "lucide-react";
import { sendTon } from "@/core/ton/tonconnect";

interface DeviceCard {
  id: string;
  title: string;
  description?: string;
  price: number | null;
  cover: string | null;
  date: string;
  // Дополнительные поля для расширенной информации
  model?: string;
  storage?: string;
  color?: string;
  condition?: string;
  seller?: string;
  location?: string;
}

interface ExpandableDeviceCardProps {
  cards: DeviceCard[];
}

export function ExpandableDeviceCard({ cards }: ExpandableDeviceCardProps) {
  const [active, setActive] = useState<DeviceCard | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const isSingle = cards.length === 1;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
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

  const formatPrice = (price: number | null) => {
    if (!price) return "Цена не указана";
    return `${price.toLocaleString('ru-RU')} ₽`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <>
      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <Page back={true}>
              <div className="min-h-[100svh] w-full max-w-[480px] mx-auto px-4 pb-6 flex items-center justify-center">
                <motion.div
                  layoutId={`card-${active.id}-${id}`}
                  ref={ref}
                  className="w-[92%] max-w-[420px] flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl"
                >
                  <motion.div layoutId={`image-${active.id}-${id}`} className="relative">
                    <div className="w-full h-64 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
                      <Image
                        width={300}
                        height={300}
                        src={active.cover || getPictureUrl('display_front_new.png') || '/display_front_new.png'}
                        alt={active.title}
                        className="w-full h-full object-contain p-6"
                      />
                    </div>
                  </motion.div>

                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start p-5">
                      <div className="flex-1">
                        <motion.h3
                          layoutId={`title-${active.id}-${id}`}
                          className="font-bold text-xl text-gray-900 mb-1"
                        >
                          {active.title}
                        </motion.h3>
                        {active.description && (
                          <motion.p
                            layoutId={`description-${active.id}-${id}`}
                            className="text-gray-600 text-sm"
                          >
                            {active.description}
                          </motion.p>
                        )}
                        <motion.div
                          layoutId={`price-${active.id}-${id}`}
                          className="text-2xl font-bold text-gray-900 mt-3"
                        >
                          {formatPrice(active.price)}
                        </motion.div>
                      </div>
                    </div>

                    <div className="px-5 pb-5">
                      <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {active.model && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <span className="text-gray-500">Модель</span>
                              <div className="font-medium text-gray-900">{active.model}</div>
                            </div>
                          )}
                          {active.storage && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <span className="text-gray-500">Память</span>
                              <div className="font-medium text-gray-900">{active.storage}</div>
                            </div>
                          )}
                          {active.color && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <span className="text-gray-500">Цвет</span>
                              <div className="font-medium text-gray-900">{active.color}</div>
                            </div>
                          )}
                          {active.condition && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <span className="text-gray-500">Состояние</span>
                              <div className="font-medium text-gray-900">{active.condition}</div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                          <div className="grid grid-cols-2 gap-3">
                            <motion.button
                              layoutId={`button-${active.id}-${id}`}
                              className="w-full px-5 py-3 text-base font-semibold rounded-2xl bg-[#2dc2c6] hover:bg-[#25a8ac] text-white transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                              <ShoppingCart className="w-5 h-5" />
                              Купить
                            </motion.button>
                            <button
                              className="w-full px-5 py-3 rounded-2xl bg-[#2dc2c6] hover:bg-[#25a8ac] transition-colors duration-200 text-white font-bold uppercase tracking-wide flex items-center justify-center gap-3"
                              onClick={async () => {
                                try {
                                  // Демонстрационная сумма 0.1 TON (в нанотонах: 0.1 * 1e9)
                                  await sendTon('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c', String(0.1 * 1e9))
                                } catch (e) {
                                  console.error('TON payment error', e)
                                }
                              }}
                            >
                              {/* TON Logo */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                className="w-6 h-6 drop-shadow-[0_0_2px_rgba(255,255,255,0.85)]"
                                aria-hidden
                              >
                                <path
                                  fill="#FFFFFF"
                                  stroke="#FFFFFF"
                                  strokeOpacity="0.85"
                                  strokeWidth="0.25"
                                  d="M12 2c5.523 0 10 2.477 10 5.533 0 1.42-.88 3.29-2.34 5.384-1.37 1.97-3.24 4.13-5.2 6.11-1.4 1.41-2.79 2.62-3.78 3.34a.99.99 0 0 1-1.36-.2c-.99-.72-2.38-1.93-3.78-3.34-1.96-1.98-3.83-4.14-5.2-6.11C.88 10.823 0 8.953 0 7.533 0 4.477 4.477 2 10 2h2Zm0 2h-2C6.06 4 2 5.57 2 7.533c0 .86.68 2.36 2.02 4.29 1.27 1.82 3.06 3.9 4.96 5.83 1.07 1.06 2.08 1.96 3.02 2.67.94-.71 1.95-1.61 3.02-2.67 1.9-1.93 3.69-4.01 4.96-5.83 1.34-1.93 2.02-3.43 2.02-4.29C22 5.57 17.94 4 14 4h-2Zm0 2 4 6h-3v6h-2v-6H8l4-6Z"
                                />
                              </svg>
                              Купить за TON
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <button
                              aria-label="Добавить в избранное"
                              className="px-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                            >
                              <Heart className="w-5 h-5 text-gray-600" />
                            </button>
                            <button
                              aria-label="Поделиться ссылкой"
                              className="px-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                            >
                              <Share2 className="w-5 h-5 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </Page>
          </div>
        ) : null}
      </AnimatePresence>

      <div className={isSingle ? "grid grid-cols-1 place-items-center" : "grid grid-cols-2 gap-3"}>
        {cards.map((card) => (
          <motion.div
            layoutId={`card-${card.id}-${id}`}
            key={`card-${card.id}-${id}`}
            onClick={() => setActive(card)}
            className={
              "bg-white rounded-2xl border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.06),0_10px_24px_rgba(0,0,0,0.10)] transition-all duration-200 cursor-pointer overflow-hidden " +
              (isSingle ? " w-[88%] max-w-[360px]" : "")
            }
          >
            <div className="relative">
              <motion.div layoutId={`image-${card.id}-${id}`}>
                <div className={`w-full ${isSingle ? 'h-64' : 'h-16'} bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center`}>
                  <Image
                    width={160}
                    height={300}
                    src={card.cover || getPictureUrl('display_front_new.png') || '/display_front_new.png'}
                    alt={card.title}
                    className="object-contain w-full h-full p-2"
                  />
                </div>
              </motion.div>
            </div>
            
            <div className="p-3">
              <motion.h3
                layoutId={`title-${card.id}-${id}`}
                className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2"
              >
                {card.title}
              </motion.h3>
              <motion.p
                layoutId={`description-${card.id}-${id}`}
                className="text-xs text-gray-500 mb-2 line-clamp-1"
              >
                {card.description}
              </motion.p>
              <motion.div
                layoutId={`price-${card.id}-${id}`}
                className="text-lg font-bold text-gray-900"
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
