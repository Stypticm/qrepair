"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import Image from "next/image";
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
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.id}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex absolute top-4 right-4 lg:hidden items-center justify-center bg-white rounded-full h-8 w-8 shadow-lg"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            
            <motion.div
              layoutId={`card-${active.id}-${id}`}
              ref={ref}
              className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              <motion.div layoutId={`image-${active.id}-${id}`} className="relative">
                <div className="w-full h-80 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
                  <Image
                    width={300}
                    height={300}
                    src={active.cover || '/logo3.png'}
                    alt={active.title}
                    className="w-full h-full object-contain p-6"
                  />
                </div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sm font-medium text-gray-800">
                    {formatDate(active.date)}
                  </span>
                </div>
              </motion.div>

              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start p-6">
                  <div className="flex-1">
                    <motion.h3
                      layoutId={`title-${active.id}-${id}`}
                      className="font-bold text-2xl text-gray-900 mb-2"
                    >
                      {active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.id}-${id}`}
                      className="text-gray-600 text-lg"
                    >
                      {active.description}
                    </motion.p>
                    <motion.div
                      layoutId={`price-${active.id}-${id}`}
                      className="text-3xl font-bold text-gray-900 mt-3"
                    >
                      {formatPrice(active.price)}
                    </motion.div>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Дополнительная информация */}
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

                    {/* Кнопки действий */}
                    <div className="flex gap-3 pt-4">
                      <motion.button
                        layoutId={`button-${active.id}-${id}`}
                        className="flex-1 px-6 py-4 text-lg font-semibold rounded-2xl bg-[#2dc2c6] hover:bg-[#25a8ac] text-white transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Купить
                      </motion.button>
                      <button className="px-4 py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                        <Heart className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="px-4 py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                        <Share2 className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <motion.div
            layoutId={`card-${card.id}-${id}`}
            key={`card-${card.id}-${id}`}
            onClick={() => setActive(card)}
            className="bg-white rounded-2xl border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.06),0_10px_24px_rgba(0,0,0,0.10)] transition-all duration-200 cursor-pointer overflow-hidden"
          >
            <div className="relative">
              <motion.div layoutId={`image-${card.id}-${id}`}>
                <div className="w-full h-20 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
                  <Image
                    width={120}
                    height={80}
                    src={card.cover || '/logo3.png'}
                    alt={card.title}
                    className="object-contain w-full h-full p-3"
                  />
                </div>
              </motion.div>
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                <span className="text-xs font-medium text-gray-600">
                  {formatDate(card.date)}
                </span>
              </div>
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
              
              <motion.button
                layoutId={`button-${card.id}-${id}`}
                className="w-full mt-3 px-4 py-2 text-sm font-semibold rounded-xl bg-gray-100 hover:bg-[#2dc2c6] hover:text-white text-gray-700 transition-all duration-200"
              >
                Подробнее
              </motion.button>
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
