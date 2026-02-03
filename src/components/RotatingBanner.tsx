'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegramCloudImages } from '@/hooks/useTelegramCloudImages';
import { useSafeArea } from '@/hooks/useSafeArea';

interface RotatingBannerProps {
  banners: string[];
  interval?: number;
  className?: string;
  screenHeight?: number;
  desktopMode?: boolean;
}

// iPhone-адаптивные размеры баннеров
const getBannerDimensions = (screenWidth: number, screenHeight: number = 844) => {
  const heightMultiplier = screenHeight > 900 ? 0.7 : screenHeight > 850 ? 0.8 : 1.0;

  if (screenWidth <= 375) {
    return { containerHeight: Math.round(250 * heightMultiplier) };
  } else if (screenWidth <= 390) {
    return { containerHeight: Math.round(270 * heightMultiplier) };
  } else if (screenWidth <= 420) {
    return { containerHeight: Math.round(290 * heightMultiplier) };
  } else {
    return { containerHeight: Math.round(310 * heightMultiplier) };
  }
};

export function RotatingBanner({
  banners,
  interval = 4000,
  className = '',
  screenHeight = 844,
  desktopMode = false
}: RotatingBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { getImage } = useTelegramCloudImages();
  const { isMobile, isDesktop } = useSafeArea();

  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 390;
  const dimensions = useMemo(() => getBannerDimensions(screenWidth, screenHeight), [screenWidth, screenHeight]);

  // Ротация баннеров
  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [banners.length, interval]);

  // Пауза при наведении
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Предзагрузка изображений
  useEffect(() => {
    banners.forEach((banner, index) => {
      if (index !== currentIndex) {
        const img = new window.Image();
        img.src = getImage(banner) || `/${banner}`;
      }
    });
  }, [banners, currentIndex, getImage]);

  // Оптимизация: скрытие при потере фокуса
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Стили контейнера в зависимости от режима
  const containerStyle = desktopMode ? {
    width: '100%',
    aspectRatio: '3 / 1',
    position: 'relative' as const,
  } : {
    height: `${dimensions.containerHeight}px`,
    minHeight: `${dimensions.containerHeight}px`,
    maxHeight: `${dimensions.containerHeight}px`,
  };

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];
  const bannerSrc = getImage(currentBanner) || `/${currentBanner}`;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl w-full ${desktopMode ? '' : 'max-w-sm mx-auto'} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...containerStyle,
        contain: 'layout style paint',
        willChange: 'opacity'
      }}
    >
      <div
        className={`w-full h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${desktopMode ? '' : 'absolute inset-0'}`}
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
              width={800}
              height={400}
              className={`w-full h-full object-contain object-center`}
              style={{
                imageRendering: 'auto',
                WebkitTransform: 'translateZ(0)',
                transform: 'translateZ(0)'
              }}
              priority={currentIndex === 0}
              quality={90}
            />

            {/* Индикатор прогресса */}
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

            {/* Точки индикации */}
            {banners.length > 1 && (
              <div className="absolute top-1 right-1 flex space-x-1">
                {banners.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1 h-1 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-white/80' : 'bg-white/40'
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

// Хук для управления ротацией баннеров
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
