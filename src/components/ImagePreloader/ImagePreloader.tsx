'use client';

import { useEffect, useState, useCallback } from 'react';
import { getPictureUrl } from '@/core/lib/assets';

interface ImagePreloaderProps {
  images: string[];
  onProgress?: (loaded: number, total: number) => void;
  onComplete?: () => void;
  priority?: boolean;
}

interface PreloadState {
  loaded: number;
  total: number;
  isComplete: boolean;
  errors: string[];
}

export function ImagePreloader({ 
  images, 
  onProgress, 
  onComplete, 
  priority = false 
}: ImagePreloaderProps) {
  const [state, setState] = useState<PreloadState>({
    loaded: 0,
    total: images.length,
    isComplete: false,
    errors: []
  });

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        setState(prev => ({
          ...prev,
          loaded: prev.loaded + 1
        }));
        resolve();
      };
      
      img.onerror = () => {
        setState(prev => ({
          ...prev,
          loaded: prev.loaded + 1,
          errors: [...prev.errors, src]
        }));
        resolve(); // Не реджектим, чтобы не блокировать загрузку других изображений
      };
      
      // Устанавливаем приоритет загрузки
      if (priority) {
        img.loading = 'eager';
      }
      
      img.src = src;
    });
  }, [priority]);

  useEffect(() => {
    if (images.length === 0) {
      setState(prev => ({ ...prev, isComplete: true }));
      onComplete?.();
      return;
    }

    const preloadAll = async () => {
      try {
        // Загружаем изображения батчами для лучшей производительности
        const batchSize = priority ? 3 : 6;
        const batches = [];
        
        for (let i = 0; i < images.length; i += batchSize) {
          batches.push(images.slice(i, i + batchSize));
        }

        for (const batch of batches) {
          await Promise.allSettled(
            batch.map(imageName => preloadImage(getPictureUrl(`${imageName}.png`)))
          );
          
          // Небольшая задержка между батчами для предотвращения блокировки UI
          if (batches.indexOf(batch) < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        setState(prev => ({ ...prev, isComplete: true }));
        onComplete?.();
      } catch (error) {
        console.error('Error preloading images:', error);
        setState(prev => ({ ...prev, isComplete: true }));
        onComplete?.();
      }
    };

    preloadAll();
  }, [images, preloadImage, onComplete, priority]);

  // Уведомляем о прогрессе
  useEffect(() => {
    onProgress?.(state.loaded, state.total);
  }, [state.loaded, state.total, onProgress]);

  return null; // Компонент не рендерит ничего
}

// Хук для отслеживания состояния предзагрузки
export function useImagePreloader(images: string[], priority = false) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleProgress = useCallback((loaded: number, total: number) => {
    setProgress(Math.round((loaded / total) * 100));
  }, []);

  const handleComplete = useCallback(() => {
    setIsComplete(true);
  }, []);

  return {
    progress,
    isComplete,
    errors,
    ImagePreloader: (
      <ImagePreloader
        images={images}
        onProgress={handleProgress}
        onComplete={handleComplete}
        priority={priority}
      />
    )
  };
}
