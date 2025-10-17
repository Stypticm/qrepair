"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Grid, List, Filter, Search } from "lucide-react";
import { ExpandableDeviceCard } from "./ExpandableDeviceCard";
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

interface AdaptiveDeviceFeedProps {
  items: DeviceCard[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  mode?: 'carousel' | 'grid' | 'auto';
}


export function AdaptiveDeviceFeed({
  items,
  isLoading,
  onLoadMore,
  hasMore,
  mode = 'carousel'
}: AdaptiveDeviceFeedProps) {
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'date' | 'popularity'>('date');
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const lastWheelTs = useRef<number>(0);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const switchToGrid = useCallback(() => {
    setViewMode('grid');
    setShowFilters(false);
    // плавная прокрутка к началу списка
    setTimeout(() => {
      rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }, []);

  const switchToCarousel = useCallback(() => {
    setViewMode('carousel');
    setShowFilters(false);
    setTimeout(() => {
      rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }, []);

  // Используем реальные данные из props
  const displayItems = items;

  const itemsPerPage = 1;
  const totalPages = Math.ceil(displayItems.length / itemsPerPage);
  const currentItems = displayItems.slice(currentIndex * itemsPerPage, (currentIndex + 1) * itemsPerPage);

  // Автоматическое переключение режима на основе количества товаров
  useEffect(() => {
    if (mode === 'auto') {
      if (displayItems.length > 20) {
        setViewMode('grid');
      } else {
        setViewMode('carousel');
      }
    } else {
      setViewMode(mode);
    }
  }, [displayItems.length, mode]);

  // Автопрокрутка отключена

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  const goToPage = useCallback((page: number) => {
    setCurrentIndex(page);
  }, []);

  // Фильтрация и поиск
  const filteredItems = displayItems.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.description ? item.description.toLowerCase().includes(q) : false) ||
      (item.model ? item.model.toLowerCase().includes(q) : false) ||
      (item.color ? item.color.toLowerCase().includes(q) : false)
    );
  });

  // Сортировка
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return (b.price || 0) - (a.price || 0);
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'popularity':
        // Простая логика популярности на основе ID
        return parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1]);
      default:
        return 0;
    }
  });


  if (isLoading && displayItems.length === 0) {
    return (
      <div className="w-full">
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="relative w-12 h-12">
            <Image
              src={getPictureUrl('animation_running.gif') || '/animation_running.gif'}
              alt="Загрузка"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div className="text-center">
            <p className="text-gray-600 font-medium">Загружаем товары...</p>
            <p className="text-gray-400 text-sm">Пожалуйста, подождите</p>
          </div>
        </div>
      </div>
    );
  }

  if (displayItems.length === 0) {
    return (
      <div className="w-full text-center py-8 text-gray-500">
        Ещё нет предложений — загляните позже
      </div>
    );
  }

  return (
    <div ref={rootRef} className="w-full space-y-4">

      {/* В режиме grid показываем панель с кнопкой возврата к карусели */}

      {/* Фильтры и поиск */}
      {/* В режиме grid фильтры и поиск всегда видимы */}
      {viewMode === 'grid' && (
        <div className="mt-12 bg-gray-50 rounded-xl p-4 space-y-3">
          {/* Кнопка возврата к рекомендациям по центру (вверху) */}
          <div className="w-full flex justify-center">
            <button
              onClick={switchToCarousel}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
            >
              ← Рекомендации
            </button>
          </div>

          {/* Поиск (чуть выше по высоте) */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск устройств..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2dc2c6] focus:border-transparent"
            />
          </div>

          {/* Фильтр (сортировка) */}
          <div className="flex gap-2">
            <span className="text-sm text-gray-600 self-center">Сортировка:</span>
            {(['date', 'price', 'popularity'] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${sortBy === sort
                    ? 'bg-[#2dc2c6] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {sort === 'date' ? 'По дате' : sort === 'price' ? 'По цене' : 'По популярности'}
              </button>
            ))}
          </div>

          {/* Результаты поиска */}
          {searchQuery && (
            <div className="text-sm text-gray-600">
              Найдено: {filteredItems.length} из {displayItems.length} товаров
            </div>
          )}
        </div>
      )}

      {/* Контент */}
      {viewMode === 'carousel' ? (
        <div className="space-y-4">
          {/* Индикаторы страниц */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1">
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

          {/* Карусель с ручным свайпом */}
          <div
            className="relative overflow-hidden outline-none flex justify-center"
            role="region"
            aria-label="Карусель устройств"
            tabIndex={0}
            onTouchStart={(e) => {
              touchStartX.current = e.changedTouches[0].clientX;
              touchStartY.current = e.changedTouches[0].clientY;
            }}
            onTouchMove={(e) => {
              // Блокируем вертикальный свайп/скролл в пределах карусели, если горизонтальное движение доминирует
              const x = e.changedTouches[0].clientX;
              const y = e.changedTouches[0].clientY;
              if (touchStartX.current != null && touchStartY.current != null) {
                const dx = Math.abs(x - touchStartX.current);
                const dy = Math.abs(y - touchStartY.current);
                if (dx > dy && dx > 8) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }
            }}
            onTouchEnd={(e) => {
              touchEndX.current = e.changedTouches[0].clientX;
              const endY = e.changedTouches[0].clientY;
              if (touchStartX.current !== null && touchEndX.current !== null && touchStartY.current !== null) {
                const dx = touchEndX.current - touchStartX.current;
                const dy = Math.abs(endY - touchStartY.current);
                if (Math.abs(dx) > Math.max(30, dy)) {
                  if (dx < 0) goToNext(); else goToPrevious();
                }
              }
              touchStartX.current = null;
              touchStartY.current = null;
              touchEndX.current = null;
            }}
            onWheel={(e) => {
              const now = Date.now();
              if (now - lastWheelTs.current < 350) return; // дебаунс
              lastWheelTs.current = now;
              if (e.deltaY > 20) goToNext();
              else if (e.deltaY < -20) goToPrevious();
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') goToNext();
              if (e.key === 'ArrowLeft') goToPrevious();
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-full w-full"
              >
                <ExpandableDeviceCard cards={currentItems} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Навигация */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={goToPrevious}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={goToNext}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}

          {/* Кнопка все товары под каруселью (ещё заметнее) */}
          <div className="text-center">
            <button
              onClick={switchToGrid}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2dc2c6] to-[#49cfd2] hover:from-[#25a8ac] hover:to-[#39c4c8] text-white text-sm font-bold shadow-md active:scale-[0.98] transition"
            >
              <List className="w-4 h-4" />
              Все товары
            </button>
          </div>
        </div>
      ) : (
        /* Сетка */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {sortedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ExpandableDeviceCard cards={[item]} />
              </motion.div>
            ))}
          </div>

          {/* Нижняя кнопка убрана по требованию */}
        </div>
      )}

      {/* Индикатор обновления данных */}
      {isLoading && displayItems.length > 0 && (
        <div className="flex justify-center items-center py-2">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            Обновляем данные...
          </div>
        </div>
      )}
    </div>
  );
}