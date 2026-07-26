"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Grid, List, Filter, Search, Hammer, Smartphone, X } from "lucide-react";
import { useSafeArea } from '@/hooks/useSafeArea';
import { AceternityDeviceCard } from './AceternityDeviceCard';
import { SimpleDeviceCard } from './SimpleDeviceCard';
import { HorizontalScrollCarousel } from './HorizontalScrollCarousel';
import Image from "next/image";
import { getPictureUrl } from "@/core/lib/assets";
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
  oldPrice?: number | null;
}

interface AdaptiveDeviceFeedProps {
  items: DeviceCard[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  mode?: 'carousel' | 'grid' | 'auto';
  onViewModeChange?: (mode: 'carousel' | 'grid') => void;
  showRecommendationsButton?: boolean;
  hideSorting?: boolean;
}


export function AdaptiveDeviceFeed({
  items,
  isLoading,
  onLoadMore,
  hasMore,
  mode = 'carousel',
  onViewModeChange,
  showRecommendationsButton = true,
  hideSorting = false
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

  // Поиск и фильтрация
  const filteredItems = useMemo(() => {
    return items.filter((item: DeviceCard) => {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.description ? item.description.toLowerCase().includes(q) : false) ||
        (item.model ? item.model.toLowerCase().includes(q) : false) ||
        (item.color ? item.color.toLowerCase().includes(q) : false)
      );
    });
  }, [items, searchQuery]);

  // Сортировка
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (b.price || 0) - (a.price || 0);
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'popularity':
          // Простая логика популярности на основе ID
          return parseInt(a.id.split('-')[1] || '0') - parseInt(b.id.split('-')[1] || '0');
        default:
          return 0;
      }
    });
  }, [filteredItems, sortBy]);

  // Группировка по модели для Variant Cards
  const groupedItems = useMemo(() => {
    if (!sortedItems || sortedItems.length === 0) return [];
    const groups: Record<string, DeviceCard[]> = {};
    
    sortedItems.forEach(item => {
      // Группируем по модели
      const key = item.model || item.title.replace(/(\d+GB|\d+TB|Black|White|Silver|Titanium|Blue|Purple)/gi, '').trim();
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    
    return Object.values(groups);
  }, [sortedItems]);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(groupedItems.length / itemsPerPage);

  const displayItems = items;

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
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Загрузка каталога...</span>
          </div>

          <div className="relative flex justify-center w-full mx-auto">
            <div className="w-full max-w-sm aspect-[4/5] bg-card rounded-[2.5rem] shadow-xl border border-border p-6 flex flex-col animate-pulse overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />

              <div className="aspect-square w-full bg-gray-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-8 relative overflow-hidden">
                <div className="w-32 h-32 bg-gray-100 dark:bg-white/10 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-12 h-12 text-gray-200 dark:text-gray-700" />
                </div>
              </div>

              <div className="space-y-4 px-2">
                <div className="h-6 bg-gray-100 dark:bg-white/10 rounded-full w-3/4" />
                <div className="h-4 bg-gray-50 dark:bg-white/5 rounded-full w-1/2" />

                <div className="pt-4 mt-auto flex justify-between items-center">
                  <div className="h-8 bg-gray-100 dark:bg-white/10 rounded-full w-1/3" />
                  <div className="h-12 bg-gray-100 dark:bg-white/10 rounded-2xl w-12" />
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
      <div className="w-full text-center py-10 text-gray-500 dark:text-gray-400">
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
        {viewMode === 'grid' && (
          <div className="bg-surface rounded-xl p-4 space-y-3">
            {/* Кнопка возврата к рекомендациям по центру (вверху) */}
            {showRecommendationsButton && (
              <div className="w-full flex justify-center">
                <button
                  onClick={switchToCarousel}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 text-sm"
                >
                  ← На главную
                </button>
              </div>
            )}

            {/* Фильтр (сортировка) */}
            {!hideSorting && (
              <div className="flex gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 self-center">Сортировка:</span>
                {(['date', 'price', 'popularity'] as const).map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setSortBy(sort)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${sortBy === sort
                      ? 'bg-teal-500 text-white'
                      : 'bg-card text-muted hover:bg-surface'
                      }`}
                  >
                    {sort === 'date' ? 'По дате' : sort === 'price' ? 'По цене' : 'По популярности'}
                  </button>
                ))}
              </div>
            )}

            {/* Результаты поиска */}
            {searchQuery && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Найдено: {filteredItems.length} из {displayItems.length} товаров
              </div>
            )}
          </div>
        )}

        {/* Контент */}
        {viewMode === 'carousel' ? (
          <motion.div
            className="w-full space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Горизонтальный скролл с карточками */}
            <HorizontalScrollCarousel
                itemWidth="85%"
                gap={16}
                showArrows={true}
                showIndicators={true}
            >
              {groupedItems.map((group: DeviceCard[]) => (
                <SimpleDeviceCard key={group[0].id} cards={group} isSingle={true} />
              ))}
            </HorizontalScrollCarousel>

            {/* Кнопка "Каталог" */}
            <div className="flex justify-center mt-6">
              <Link
                href="/catalog"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Grid className="w-5 h-5" />
                Каталог
              </Link>
            </div>

          </motion.div>
        ) : (
          /* Сетка */
          <div className="space-y-4 pb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {groupedItems.map((group: DeviceCard[], index: number) => (
                <motion.div
                  key={group[0].id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <SimpleDeviceCard cards={group} isSingle={false} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Индикатор обновления данных */}
        {isLoading && displayItems.length > 0 && (
          <div className="flex justify-center items-center py-2">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
              <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin"></div>
              Обновляем данные...
            </div>
          </div>
        )}

      </motion.div>
    </AnimatePresence>
  );
}