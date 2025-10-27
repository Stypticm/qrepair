import { create } from 'zustand'
import {
  persist,
  createJSONStorage,
} from 'zustand/middleware'

/**
 * Zustand Store для управления навигацией между секциями evaluation
 *
 * Сетка координат:
 * - (0, 0) — ИИ Оценка (центральная)
 * - (0, -1) — ИИ Скупка (свайп вверх)
 * - (0, 1) — Ремонт (свайп вниз)
 *
 * Свайп влево (из любой секции) → router.back()
 * Поддержка персистентного состояния для восстановления позиции при возврате
 */
interface EvaluationNavState {
  // Текущая позиция в координатной сетке
  position: { x: number; y: number }

  // Методы навигации
  goUp: () => void // Скупка (y: -1)
  goDown: () => void // Ремонт (y: 1)
  goLeft: () => void // Пустая функция (не используется)
  goRight: () => void // Пустая функция (не используется)
  resetPosition: () => void // Вернуться в центр

  // Внутренние хелперы
  setPosition: (x: number, y: number) => void
}

export const useEvaluationNavStore =
  create<EvaluationNavState>()(
    persist(
      (set) => ({
        // Начальная позиция — центральная секция
        position: { x: 0, y: 0 },

        // Навигация вверх → ИИ Скупка
        goUp: () =>
          set((state) => {
            // Из центра (0, 0) → (0, -1)
            if (
              state.position.x === 0 &&
              state.position.y === 0
            ) {
              return { position: { x: 0, y: -1 } }
            }
            // Из Ремонта (0, 1) → Оценка (0, 0)
            if (
              state.position.x === 0 &&
              state.position.y === 1
            ) {
              return { position: { x: 0, y: 0 } }
            }
            return state
          }),

        // Навигация вниз → Ремонт
        goDown: () =>
          set((state) => {
            // Из центра (0, 0) → (0, 1)
            if (
              state.position.x === 0 &&
              state.position.y === 0
            ) {
              return { position: { x: 0, y: 1 } }
            }
            // Из Скупки (0, -1) → Оценка (0, 0)
            if (
              state.position.x === 0 &&
              state.position.y === -1
            ) {
              return { position: { x: 0, y: 0 } }
            }
            return state
          }),

        // Навигация влево → Назад
        goLeft: () =>
          set((state) => {
            // Из центра (0, 0) → (x: -1) для навигации назад
            if (
              state.position.x === 0 &&
              state.position.y === 0
            ) {
              return { position: { x: -1, y: 0 } }
            }
            return state
          }),

        // Навигация вправо → Вперёд (для будущих расширений)
        goRight: () =>
          set((state) => {
            // Из "Назад" (-1, 0) → центр (0, 0)
            if (
              state.position.x === -1 &&
              state.position.y === 0
            ) {
              return { position: { x: 0, y: 0 } }
            }
            return state
          }),

        // Вернуться в центр
        resetPosition: () =>
          set({ position: { x: 0, y: 0 } }),

        // Прямая установка позиции (для программной навигации)
        setPosition: (x: number, y: number) =>
          set({ position: { x, y } }),
      }),
      {
        name: 'evaluation-nav-store',
        storage: createJSONStorage(() =>
          typeof window !== 'undefined'
            ? localStorage
            : {
                getItem: () => null,
                setItem: () => {},
                removeItem: () => {},
              }
        ),
        // Сохраняем только позицию (для восстановления при возврате)
        partialize: (state) => ({
          position: state.position,
        }),
      }
    )
  )

/**
 * Хелпер для получения названия текущей секции
 */
export const getSectionName = (pos: {
  x: number
  y: number
}): string => {
  if (pos.x === 0 && pos.y === 0) return 'ai-evaluation'
  if (pos.x === 0 && pos.y === -1) return 'ai-buyout'
  if (pos.x === 0 && pos.y === 1) return 'repair'
  if (pos.x === -1 && pos.y === 0) return 'back'
  return 'unknown'
}

/**
 * Хелпер программа для проверки доступных направлений
 */
export const getAvailableDirections = (pos: {
  x: number
  y: number
}) => {
  const result: {
    up: boolean
    down: boolean
    left: boolean
    right: boolean
  } = {
    up: false,
    down: false,
    left: false,
    right: false,
  }

  // Из центра (0, 0): вверх, вниз, влево
  if (pos.x === 0 && pos.y === 0) {
    result.up = true
    result.down = true
    result.left = true
  }

  // Из Скупки (0, -1): только вниз
  if (pos.x === 0 && pos.y === -1) {
    result.down = true
  }

  // Из Ремонта (0, 1): только вверх
  if (pos.x === 0 && pos.y === 1) {
    result.up = true
  }

  return result
}
