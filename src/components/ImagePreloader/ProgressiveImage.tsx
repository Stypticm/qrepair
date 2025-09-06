'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getPictureUrl } from '@/core/lib/assets';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export function ProgressiveImage({
  src,
  alt,
  className = '',
  fill = false,
  width,
  height,
  priority = false,
  loading = 'lazy',
  onLoad,
  onError
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');

  useEffect(() => {
    // Получаем полный URL изображения
    const fullSrc = src.startsWith('http') ? src : getPictureUrl(`${src}.png`);
    setImageSrc(fullSrc);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Плейсхолдер с анимацией загрузки */}
      <AnimatePresence>
        {!isLoaded && !hasError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gray-100 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Основное изображение */}
      <AnimatePresence>
        {isLoaded && !hasError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <Image
              src={imageSrc}
              alt={alt}
              fill={fill}
              width={width}
              height={height}
              className="object-cover transition-transform duration-200 hover:scale-105"
              priority={priority}
              loading={loading}
              onLoad={handleLoad}
              onError={handleError}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Состояние ошибки */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gray-100 flex items-center justify-center"
          >
            <div className="text-center text-gray-500">
              <div className="w-8 h-8 mx-auto mb-2 text-gray-400">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs">Ошибка загрузки</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
