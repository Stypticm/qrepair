import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';

/**
 * SwipeIndicator - Индикатор свайпа в Apple style
 * 
 * Красивые анимированные стрелки для подсказки о свайпе вверх/вниз
 */
export function SwipeIndicator() {
  return (
    <div className="fixed bottom-24 left-0 right-0 flex justify-center items-center gap-8 z-10 pointer-events-none">
      {/* Стрелка вверх */}
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <motion.div
          className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
            boxShadow: [
              '0 4px 12px rgba(0, 0, 0, 0.1)',
              '0 8px 20px rgba(0, 0, 0, 0.15)',
              '0 4px 12px rgba(0, 0, 0, 0.1)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <ArrowUp className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
        </motion.div>
        <motion.span
          className="text-xs font-medium text-gray-600 whitespace-nowrap"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          Скупка
        </motion.span>
      </motion.div>

      {/* Стрелка вниз */}
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <motion.div
          className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
            boxShadow: [
              '0 4px 12px rgba(0, 0, 0, 0.1)',
              '0 8px 20px rgba(0, 0, 0, 0.15)',
              '0 4px 12px rgba(0, 0, 0, 0.1)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <ArrowDown className="w-6 h-6 text-yellow-600" strokeWidth={2.5} />
        </motion.div>
        <motion.span
          className="text-xs font-medium text-gray-600 whitespace-nowrap"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          Ремонт
        </motion.span>
      </motion.div>
    </div>
  );
}

