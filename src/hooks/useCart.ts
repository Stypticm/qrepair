import { useCallback } from 'react'
import { useAppStore } from '@/stores/authStore'
import { useCartStore, CartItem } from '@/stores/cartStore'

export function useCart() {
  const { telegramId } = useAppStore()
  const store = useCartStore()

  // Добавляем заявку в корзину
  const addToCart = useCallback(
    async (item: Omit<CartItem, 'quantity'>) => {
      store.addItem(item)

      // Отправляем на сервер (для будущей интеграции с Telegram Cloud)
      if (telegramId) {
        try {
          await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-telegram-id': telegramId,
            },
            body: JSON.stringify({
              lotId: item.id,
              action: 'add',
            }),
          })
        } catch (error) {
          console.error('Error syncing cart to server:', error)
        }
      }
    },
    [store, telegramId]
  )

  // Удаляем заявку из корзины
  const removeFromCart = useCallback(
    async (itemId: string) => {
      store.removeItem(itemId)

      // Отправляем на сервер
      if (telegramId) {
        try {
          await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-telegram-id': telegramId,
            },
            body: JSON.stringify({
              lotId: itemId,
              action: 'remove',
            }),
          })
        } catch (error) {
          console.error('Error syncing removal to server:', error)
        }
      }
    },
    [store, telegramId]
  )

  // Обновляем количество заявки
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      store.updateQuantity(itemId, quantity)
      
      if (telegramId) {
        try {
          await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-telegram-id': telegramId,
            },
            body: JSON.stringify({
              lotId: itemId,
              action: 'updateQuantity',
              quantity
            }),
          })
        } catch (error) {
           console.error('Error syncing quantity to server:', error)
        }
      }
    },
    [store, telegramId]
  )

  // Очищаем корзину
  const clearCart = useCallback(async () => {
    store.clearCart()

    // Отправляем на сервер
    if (telegramId) {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-telegram-id': telegramId,
          },
          body: JSON.stringify({ action: 'clear' }),
        })
      } catch (error) {
        console.error('Error syncing clear to server:', error)
      }
    }
  }, [store, telegramId])

  return {
    cartItems: store.items,
    loading: false, // loading state is now almost instant with local store
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart: store.isInCart,
    getTotalPrice: store.getTotalPrice,
    getTotalItems: store.getTotalItems,
  }
}
