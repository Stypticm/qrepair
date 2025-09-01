'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="bg-white border-0 shadow-2xl rounded-3xl p-8 max-w-sm mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-center"
            >
              {/* Иконка */}
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1 }}
                className="w-16 h-16 bg-[#2dc2c6]/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <span className="text-3xl">📱</span>
              </motion.div>

              {/* Заголовок */}
              <motion.h2
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-gray-900 mb-3"
              >
                Добро пожаловать в QoS
              </motion.h2>

              {/* Описание */}
              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 mb-8 leading-relaxed"
              >
                Выберите модель iPhone и оцените его состояние. 
                Это займет всего 1-2 минуты.
              </motion.p>

              {/* Кнопка */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  onClick={onClose}
                  className="w-full bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold py-4 rounded-2xl text-lg transition-all duration-200 hover:shadow-lg"
                >
                  Начать оценку
                </Button>
              </motion.div>

              {/* Подсказка */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs text-gray-500 mt-4"
              >
                Просто следуйте инструкциям на каждом шаге
              </motion.p>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
