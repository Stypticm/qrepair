'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '@/components/ui/progress-bar';

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
              <ProgressBar 
                value={progress} 
                className="h-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                {progress}%
              </p>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
