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

// Временные тестовые данные
const generateTestData = (count: number): DeviceCard[] => {
  const models = ['iPhone 15 Pro', 'iPhone 14', 'iPhone 13 Pro', 'Samsung Galaxy S24', 'Google Pixel 8', 'OnePlus 12'];
  const conditions = ['Отличное', 'Хорошее', 'Удовлетворительное', 'Новое'];
  const colors = ['Чёрный', 'Белый', 'Синий', 'Красный', 'Золотой'];
  const storages = ['128GB', '256GB', '512GB', '1TB'];
  const locations = ['Москва', 'СПб', 'Казань', 'Екатеринбург'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `test-${i + 1}`,
    title: `${models[i % models.length]} ${storages[i % storages.length]}`,
    description: `Продаю ${models[i % models.length].toLowerCase()} в ${conditions[i % conditions.length].toLowerCase()} состоянии`,
    price: Math.floor(Math.random() * 50000) + 20000, // 20k-70k
    cover: null, // Будем использовать логотип по умолчанию
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Последние 30 дней
    model: models[i % models.length],
    storage: storages[i % storages.length],
    color: colors[i % colors.length],
    condition: conditions[i % conditions.length],
    seller: `Продавец ${i + 1}`,
    location: locations[i % locations.length]
  }));
};

export function AdaptiveDeviceFeed({ 
  items, 
  isLoading, 
  onLoadMore, 
  hasMore,
  mode = 'auto'
}: AdaptiveDeviceFeedProps) {
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'date' | 'popularity'>('date');
  
  // Временные тестовые данные для демонстрации
  const [testData, setTestData] = useState<DeviceCard[]>([]);
  const [testCount, setTestCount] = useState(12); // Начинаем с 12 для карусели
  
  // Генерируем тестовые данные
  useEffect(() => {
    setTestData(generateTestData(testCount));
  }, [testCount]);
  
  // Используем тестовые данные вместо реальных для демонстрации
  const displayItems = testData.length > 0 ? testData : items;
  
  const itemsPerPage = 6;
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

  // Автопрокрутка только для карусели
  useEffect(() => {
    if (viewMode === 'carousel' && isAutoPlaying && totalPages > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalPages);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [viewMode, isAutoPlaying, totalPages]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
    setIsAutoPlaying(false);
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

  // Функции для тестирования
  const addMoreTestData = () => {
    setTestCount(prev => prev + 12);
  };

  const resetTestData = () => {
    setTestCount(12);
    setCurrentIndex(0);
  };

  if (isLoading && displayItems.length === 0) {
    return (
      <div className="w-full">
        <div className="flex justify-center items-center h-64">
          <Image
            src={getPictureUrl('animation_running.gif') || '/animation_running.gif'}
            alt="Загрузка"
            width={96}
            height={96}
            className="object-contain"
          />
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
    <div className="w-full space-y-4">
      {/* Тестовые контролы */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-blue-800">🧪 Тестовый режим</h3>
          <div className="flex gap-2">
            <button
              onClick={addMoreTestData}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
            >
              +12 товаров
            </button>
            <button
              onClick={resetTestData}
              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors"
            >
              Сброс
            </button>
          </div>
        </div>
        <p className="text-xs text-blue-600">
          Текущее количество: {displayItems.length} товаров | Режим: {viewMode} | 
          Автопереключение: {mode === 'auto' ? 'Включено' : 'Выключено'}
        </p>
      </div>

      {/* Заголовок с контролами */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">
            {viewMode === 'carousel' ? 'Рекомендуемые устройства' : 'Все устройства'}
          </h2>
          <span className="text-sm text-gray-500">({displayItems.length})</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Переключатель режимов */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('carousel')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'carousel' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          {/* Кнопка фильтров */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-xl p-4 space-y-3"
          >
            {/* Поиск */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск устройств..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2dc2c6] focus:border-transparent"
              />
            </div>

            {/* Сортировка */}
            <div className="flex gap-2">
              <span className="text-sm text-gray-600 self-center">Сортировка:</span>
              {(['date', 'price', 'popularity'] as const).map((sort) => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === sort
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
          </motion.div>
        )}
      </AnimatePresence>

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
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    index === currentIndex ? 'bg-[#2dc2c6]' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Карусель */}
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
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

          {/* Информация о страницах */}
          <div className="text-center text-sm text-gray-500">
            Страница {currentIndex + 1} из {totalPages}
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

          {/* Загрузка больше */}
          <div className="text-center">
            <button
              onClick={addMoreTestData}
              className="px-6 py-3 bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold rounded-xl transition-colors"
            >
              Показать ещё 12 товаров
            </button>
          </div>
        </div>
      )}

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
    </div>
  );
}