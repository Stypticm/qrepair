"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SimpleDeviceCard } from "./SimpleDeviceCard";
import Image from "next/image";
import { getPictureUrl } from "@/core/lib/assets";

interface DeviceCard {
  id: string;
  title: string;
  description?: string;
  price: number | null;
  cover: string | null;
  photos: string[]; // Все фото для галереи
  date: string;
  model?: string;
  storage?: string;
  color?: string;
  condition?: string;
  seller?: string;
  location?: string;
}

interface DeviceCarouselProps {
  items: DeviceCard[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function DeviceCarousel({ items, isLoading, onLoadMore, hasMore }: DeviceCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Показываем по 6 карточек за раз (2 ряда по 3)
  const itemsPerPage = 6;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const currentItems = items.slice(currentIndex * itemsPerPage, (currentIndex + 1) * itemsPerPage);

  // Автопрокрутка
  useEffect(() => {
    if (isAutoPlaying && totalPages > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalPages);
      }, 4000); // Меняем каждые 4 секунды
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, totalPages]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
    setIsAutoPlaying(false);
    // Возобновляем автопрокрутку через 10 секунд
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [totalPages]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [totalPages]);

  const goToPage = useCallback((page: number) => {
    setCurrentIndex(page);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  // Загружаем больше данных когда доходим до последней страницы
  useEffect(() => {
    if (currentIndex === totalPages - 1 && hasMore && onLoadMore) {
      onLoadMore();
    }
  }, [currentIndex, totalPages, hasMore, onLoadMore]);

  if (isLoading && items.length === 0) {
    return (
      <div className="w-full">
        <div className="flex justify-center items-center h-64">
          <img
            src={getPictureUrl('coconut-dancing.gif') || '/coconut-dancing.gif'}
            alt="Загрузка"
            className="w-24 h-24 object-contain"
          />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full text-center py-8 text-gray-500">
        Ещё нет предложений — загляните позже
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Заголовок с индикаторами */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">Рекомендуемые устройства</h2>
          {totalPages > 1 && (
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${index === currentIndex ? 'bg-[#2dc2c6]' : 'bg-gray-300'
                    }`}
                />
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex gap-2">
            <button
              onClick={goToPrevious}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={goToNext}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Карусель */}
      <div className="relative overflow-hidden min-h-[560px]">
        <AnimatePresence>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full"
          >
            <SimpleDeviceCard cards={currentItems} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Индикатор загрузки */}
      {isLoading && (
        <div className="flex justify-center items-center py-4">
          <span className="inline-flex items-center gap-2 text-gray-500">
            <Image
              src={getPictureUrl('animation_running.gif') || '/animation_running.gif'}
              alt="Загрузка"
              width={24}
              height={24}
              className="object-contain"
            />
            Загрузка...
          </span>
        </div>
      )}

      {/* Информация о страницах */}
      {totalPages > 1 && (
        <div className="text-center text-sm text-gray-500">
          Страница {currentIndex + 1} из {totalPages}
        </div>
      )}
    </div>
  );
}
