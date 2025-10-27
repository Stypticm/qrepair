import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';

interface SwipeIndicatorProps {
  section: 'ai-evaluation' | 'ai-buyout' | 'repair';
}

export function SwipeIndicator({ section }: SwipeIndicatorProps) {
  // Центральная секция: стрелки вверх и вниз
  if (section === 'ai-evaluation') {
    return (
      <div className="fixed bottom-24 left-0 right-0 flex justify-center items-center gap-8 z-10 pointer-events-none">
        {/* Стрелка вверх - Скупка */}
        <motion.div className="flex flex-col items-center gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <motion.div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <ArrowUp className="w-6 h-6 text-green-600" strokeWidth={2.5} />
          </motion.div>
          <motion.span className="text-xs font-medium text-gray-600" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            Скупка
          </motion.span>
        </motion.div>

        {/* Стрелка вниз - Ремонт */}
        <motion.div className="flex flex-col items-center gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <motion.div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <ArrowDown className="w-6 h-6 text-yellow-600" strokeWidth={2.5} />
          </motion.div>
          <motion.span className="text-xs font-medium text-gray-600" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            Ремонт
          </motion.span>
        </motion.div>
      </div>
    );
  }

  // Секция Скупка: стрелка вниз + вправо
  if (section === 'ai-buyout') {
    return (
      <div className="fixed bottom-24 left-0 right-0 flex justify-center items-center gap-8 z-10 pointer-events-none">
        {/* Стрелка вниз - Назад */}
        <motion.div className="flex flex-col items-center gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <motion.div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <ArrowDown className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
          </motion.div>
          <motion.span className="text-xs font-medium text-gray-600" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            Назад
          </motion.span>
        </motion.div>

        {/* Стрелка вправо - Далее */}
        <motion.div className="flex flex-col items-center gap-2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
          <motion.div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <ArrowRight className="w-6 h-6 text-green-600" strokeWidth={2.5} />
          </motion.div>
          <motion.span className="text-xs font-medium text-gray-600" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            Далее
          </motion.span>
        </motion.div>
      </div>
    );
  }

  // Секция Ремонт: стрелка вверх + вправо
  if (section === 'repair') {
    return (
      <div className="fixed bottom-24 left-0 right-0 flex justify-center items-center gap-8 z-10 pointer-events-none">
        {/* Стрелка вверх - Назад */}
        <motion.div className="flex flex-col items-center gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <motion.div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <ArrowUp className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
          </motion.div>
          <motion.span className="text-xs font-medium text-gray-600" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            Назад
          </motion.span>
        </motion.div>

        {/* Стрелка вправо - Далее */}
        <motion.div className="flex flex-col items-center gap-2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
          <motion.div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <ArrowRight className="w-6 h-6 text-yellow-600" strokeWidth={2.5} />
          </motion.div>
          <motion.span className="text-xs font-medium text-gray-600" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            Далее
          </motion.span>
        </motion.div>
      </div>
    );
  }

  return null;
}

