'use client';

import { useEffect } from 'react';
import { getPictureUrl } from '@/core/lib/assets';

interface ImagePreloaderProps {
  images: string[];
}

export function ImagePreloader({ images }: ImagePreloaderProps) {
  useEffect(() => {
    // Предзагружаем изображения
    images.forEach((imageName) => {
      const src = getPictureUrl(`${imageName}.png`);
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  return null; // Компонент не рендерит ничего
}
