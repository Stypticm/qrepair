"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import Image from "next/image";
import { getPictureUrl } from "@/core/lib/assets";
import { Page } from "@/components/Page";
import { Heart, ShoppingCart, Share2, Star } from "lucide-react";

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

                        <div className="flex gap-3 pt-2">
                          <motion.button
                            layoutId={`button-${active.id}-${id}`}
                            className="flex-1 px-5 py-3 text-base font-semibold rounded-2xl bg-[#2dc2c6] hover:bg-[#25a8ac] text-white transition-colors duration-200 flex items-center justify-center gap-2"
                          >
                            <ShoppingCart className="w-5 h-5" />
                            Купить
                          </motion.button>
                          <button className="px-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                            <Heart className="w-5 h-5 text-gray-600" />
                          </button>
                          <button className="px-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                            <Share2 className="w-5 h-5 text-gray-600" />
                          </button>
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
