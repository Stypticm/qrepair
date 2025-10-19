'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegramCloudImages } from '@/hooks/useTelegramCloudImages';
import { useSafeArea } from '@/hooks/useSafeArea';

interface RotatingBannerProps {
  banners: string[];
  interval?: number; // в миллисекундах
  className?: string;
  screenHeight?: number; // высота экрана для адаптивности
}

// iPhone-адаптивные размеры баннеров как у carousel
const getBannerDimensions = (screenWidth: number, screenHeight: number = 844) => {
  // Принцип 80/20: 20% адаптивной ширины дают 80% визуального единства с carousel
  
  // Адаптивность по высоте экрана для компактности
  const heightMultiplier = screenHeight > 900 ? 0.7 : screenHeight > 850 ? 0.8 : 1.0;
  
  // Баннер адаптивный как carousel - полная ширина экрана с отступами
  const containerWidth = screenWidth - 32; // как carousel: w-full с отступами 16px с каждой стороны
  
  if (screenWidth <= 375) {
    // iPhone SE, iPhone 12/13 mini - компактные картинки для малых экранов
    return { 
      containerWidth, 
      containerHeight: Math.round(250 * heightMultiplier),
      imageWidth: Math.round(containerWidth * 0.85), // компактнее на 15%
      imageHeight: Math.round(180 * heightMultiplier) // компактнее на 14%
    };
  } else if (screenWidth <= 390) {
    // iPhone 12/13/14/15 - компактные картинки для малых экранов
    return { 
      containerWidth, 
      containerHeight: Math.round(270 * heightMultiplier),
      imageWidth: Math.round(containerWidth * 0.85), // компактнее на 15%
      imageHeight: Math.round(200 * heightMultiplier) // компактнее на 13%
    };
  } else if (screenWidth <= 420) {
    // iPhone 12/13/14/15 Pro Max - компактные картинки для средних экранов
    return { 
      containerWidth, 
      containerHeight: Math.round(290 * heightMultiplier),
      imageWidth: Math.round(containerWidth * 0.9), // компактнее на 10%
      imageHeight: Math.round(220 * heightMultiplier) // компактнее на 12%
    };
  } else {
    // Desktop и большие экраны - полный размер картинок
    return { 
      containerWidth, 
      containerHeight: Math.round(310 * heightMultiplier),
      imageWidth: Math.round(containerWidth * 0.95), // слегка компактнее для больших экранов
      imageHeight: Math.round(270 * heightMultiplier)
    };
  }
};

export function RotatingBanner({ 
  banners, 
  interval = 4000, // 4 секунды - оптимально для восприятия
  className = '',
  screenHeight = 844
}: RotatingBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { getImage } = useTelegramCloudImages();
  const { isMobile, isDesktop } = useSafeArea();
  
  // Получаем ширину экрана для iPhone-адаптивности
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 390;

  // iPhone-адаптивные размеры с учетом высоты экрана
  const dimensions = useMemo(() => getBannerDimensions(screenWidth, screenHeight), [screenWidth, screenHeight]);

  // Ротация баннеров с оптимизацией для Telegram WebApp
  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [banners.length, interval]);

  // Пауза при наведении (для лучшего UX)
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Предзагрузка изображений для плавности (оптимизация производительности)
  useEffect(() => {
    banners.forEach((banner, index) => {
      if (index !== currentIndex) {
        const img = new window.Image();
        img.src = getImage(banner) || `/${banner}`;
        // Устанавливаем фиксированные размеры для предзагруженных изображений
        img.width = dimensions.imageWidth;
        img.height = dimensions.imageHeight;
      }
    });
  }, [banners, currentIndex, getImage, dimensions.imageWidth, dimensions.imageHeight]);

  // Оптимизация: скрытие компонента при потере фокуса
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];
  const bannerSrc = getImage(currentBanner) || `/${currentBanner}`;


  return (
    <div 
      className={`relative overflow-hidden rounded-2xl w-full ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        // Только высота фиксированная для предотвращения скачков
        height: `${dimensions.containerHeight}px`,
        minHeight: `${dimensions.containerHeight}px`,
        maxHeight: `${dimensions.containerHeight}px`,
        // Предотвращение layout shift
        contain: 'layout style paint',
        willChange: 'opacity'
      }}
    >
      <div 
        className="w-full h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        style={{
          // Только высота фиксированная
          height: `${dimensions.containerHeight}px`
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              transition: { 
                duration: 0.3, 
                ease: "easeOut"
              }
            }}
            exit={{ 
              opacity: 0,
              transition: { 
                duration: 0.2, 
                ease: "easeIn"
              }
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Image
              src={bannerSrc}
              alt={`Баннер ${currentIndex + 1}`}
              width={dimensions.imageWidth}
              height={dimensions.imageHeight}
              className="object-contain max-w-full max-h-full"
              style={{ 
                imageRendering: 'auto',
                // Оптимизация для iPhone
                WebkitTransform: 'translateZ(0)',
                transform: 'translateZ(0)'
              }}
              priority={currentIndex === 0} // Приоритет для первого баннера
              quality={85} // Оптимальное качество для мобильных
            />
            
            {/* Индикатор прогресса с iPhone-адаптивным дизайном */}
            {banners.length > 1 && !isHovered && isVisible && (
              <motion.div
                className="absolute bottom-1 left-1 right-1 h-0.5 bg-white/20 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  className="h-full bg-white/60 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ 
                    duration: interval / 1000, 
                    ease: "linear",
                    repeat: Infinity 
                  }}
                />
              </motion.div>
            )}

            {/* Точки индикации для iPhone */}
            {banners.length > 1 && (
              <div className="absolute top-1 right-1 flex space-x-1">
                {banners.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1 h-1 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'bg-white/80' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Хук для управления ротацией баннеров с iPhone-оптимизацией
export function useBannerRotation(banners: string[], interval: number = 4000) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [banners.length, interval, isPaused]);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);
  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
  }, [banners.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  }, [banners.length]);

  return {
    currentIndex,
    currentBanner: banners[currentIndex],
    isPaused,
    pause,
    resume,
    goToNext,
    goToPrevious,
  };
}
