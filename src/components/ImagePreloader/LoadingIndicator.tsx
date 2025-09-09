'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';

interface LoadingIndicatorProps {
  progress: number;
  isVisible: boolean;
  message?: string;
}

export function LoadingIndicator({
  progress,
  isVisible,
  message = 'Загрузка изображений...'
}: LoadingIndicatorProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-4 left-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-2">
                {message}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {progress}%
              </p>
            </div>
            <Image
              src={getPictureUrl('animation_running.gif') || '/animation_running.gif'}
              alt="Загрузка"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
