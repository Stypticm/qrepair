"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Grid, List, Filter, Search, Hammer, Smartphone, X } from "lucide-react";
import { useSafeArea } from '@/hooks/useSafeArea';
import { AceternityDeviceCard } from './AceternityDeviceCard';
import { SimpleDeviceCard } from './SimpleDeviceCard';
import { HorizontalScrollCarousel } from './HorizontalScrollCarousel';
import Image from "next/image";
import { getPictureUrl } from "@/core/lib/assets";
import { cn } from '@/lib/utils';

export interface DeviceCard {
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
  onViewModeChange?: (mode: 'carousel' | 'grid') => void;
  showRecommendationsButton?: boolean;
}


export function AdaptiveDeviceFeed({
  items,
  isLoading,
  onLoadMore,
  hasMore,
  mode = 'carousel',
  onViewModeChange,
  showRecommendationsButton = true
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
  const { isDesktop } = useSafeArea();
  const rootRef = useRef<HTMLDivElement | null>(null);

  const switchToGrid = useCallback(() => {
    setViewMode('grid');
    setShowFilters(false);
    onViewModeChange?.('grid');
    // плавная прокрутка к началу списка
    setTimeout(() => {
      rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }, [onViewModeChange]);

  const switchToCarousel = useCallback(() => {
    setViewMode('carousel');
    setShowFilters(false);
    onViewModeChange?.('carousel');
    // Возвращаемся в начальное состояние страницы
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  }, [onViewModeChange]);

  // Используем реальные данные из props (без фильтрации для начала)
  const displayItems = items;
  const itemsPerPage = 1; // Показываем по 1 карточке за раз (настоящий carousel)
  const totalPages = Math.ceil(displayItems.length / itemsPerPage);
  const currentItems = displayItems.slice(currentIndex * itemsPerPage, (currentIndex + 1) * itemsPerPage);

  // Устанавливаем режим в зависимости от переданного параметра
  useEffect(() => {
    const handleSwitchToGrid = () => {
      switchToGrid();
    };

    window.addEventListener('switchToGrid', handleSwitchToGrid);
    return () => window.removeEventListener('switchToGrid', handleSwitchToGrid);
  }, [switchToGrid]);

  useEffect(() => {
    if (mode === 'grid') {
      setViewMode('grid');
    } else if (mode === 'carousel') {
      setViewMode('carousel');
    } else {
      // mode === 'auto' - используем carousel по умолчанию
      setViewMode('carousel');
    }
  }, [mode]);

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


  // Показываем скелетон только при загрузке
  if (isLoading && displayItems.length === 0) {
    return (
      <div className="w-full">
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center mb-8 gap-2">
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse opacity-60" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse opacity-30" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Загрузка каталога...</span>
          </div>

          <div className="relative flex justify-center w-full mx-auto">
            <div className="w-full max-w-sm aspect-[4/5] bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-6 flex flex-col animate-pulse overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />

              <div className="aspect-square w-full bg-gray-50 rounded-3xl flex items-center justify-center mb-8 relative overflow-hidden">
                <div className="w-32 h-32 bg-gray-100/80 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-12 h-12 text-gray-200" />
                </div>
              </div>

              <div className="space-y-4 px-2">
                <div className="h-6 bg-gray-100 rounded-full w-3/4" />
                <div className="h-4 bg-gray-50 rounded-full w-1/2" />

                <div className="pt-4 mt-auto flex justify-between items-center">
                  <div className="h-8 bg-gray-100 rounded-full w-1/3" />
                  <div className="h-12 bg-gray-100 rounded-2xl w-12" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Если нет данных и не загружается - показываем сообщение
  if (displayItems.length === 0) {
    return (
      <div className="w-full text-center py-10 text-gray-500">
        Пока нет новых объявлений
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={rootRef}
        className="w-full space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Поиск (виден только на мобилках/PWA, так как на десктопе есть в шапке) */}
        {!isDesktop && (
          <div className="pt-5 mb-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className={cn(
                  "w-4 h-4 transition-colors",
                  searchQuery ? "text-teal-500" : "text-gray-400"
                )} />
              </div>
              <input
                type="text"
                placeholder="Поиск по названию или модели..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-100 h-12 pl-11 pr-10 rounded-2xl text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            {/* Кнопка возврата к рекомендациям по центру (вверху) */}
            {showRecommendationsButton && (
              <div className="w-full flex justify-center">
                <button
                  onClick={switchToCarousel}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
                >
                  ← Рекомендации
                </button>
              </div>
            )}



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
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Горизонтальный скролл с карточками */}
            <HorizontalScrollCarousel
              itemWidth="85vw"
              gap={16}
              showArrows={true}
              showIndicators={true}
            >
              {displayItems.map((item) => (
                <SimpleDeviceCard key={item.id} cards={[item]} isSingle={true} />
              ))}
            </HorizontalScrollCarousel>

            {/* Кнопка "Все устройства" */}
            <div className="flex justify-center mt-6">
              <button
                onClick={switchToGrid}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Grid className="w-5 h-5" />
                Все устройства
              </button>
            </div>

          </motion.div>
        ) : (
          /* Сетка */
          <div className="space-y-4 overflow-y-auto max-h-[80vh] pb-20 scrollbar-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <SimpleDeviceCard cards={[item]} isSingle={false} />
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

      </motion.div>
    </AnimatePresence>
  );
}