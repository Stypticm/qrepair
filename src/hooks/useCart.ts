import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/stores/authStore'

interface CartItem {
  id: string
  title: string
  price: number | null
  cover: string | null
  photos: string[]
  date: string
  model?: string
  storage?: string
  color?: string
  condition?: string
  description?: string
  quantity: number
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const { telegramId } = useAppStore()

  // Загружаем корзину из localStorage при инициализации
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart))
        } catch (error) {
          console.error('Error parsing cart:', error)
        }
      }
    }
  }, [])

  // Сохраняем корзину в localStorage
  const saveCart = useCallback((newCart: CartItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(newCart))
    }
  }, [])

  // Добавляем заявку в корзину
  const addToCart = useCallback(
    async (item: Omit<CartItem, 'quantity'>) => {
      setLoading(true)
      try {
        const existingItem = cartItems.find(
          (cartItem) => cartItem.id === item.id
        )

        let newCart: CartItem[]
        if (existingItem) {
          // Увеличиваем количество существующей заявки
          newCart = cartItems.map((cartItem) =>
            cartItem.id === item.id
              ? {
                  ...cartItem,
                  quantity: cartItem.quantity + 1,
                }
              : cartItem
          )
        } else {
          // Добавляем новую заявку
          newCart = [...cartItems, { ...item, quantity: 1 }]
        }

        setCartItems(newCart)
        saveCart(newCart)

        // Отправляем на сервер (для будущей интеграции с Telegram Cloud)
        if (telegramId) {
          await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-telegram-id': telegramId,
            },
            body: JSON.stringify({
              requestId: item.id,
              action: 'add',
            }),
          })
        }
      } catch (error) {
        console.error('Error adding to cart:', error)
      } finally {
        setLoading(false)
      }
    },
    [cartItems, saveCart, telegramId]
  )

  // Удаляем заявку из корзины
  const removeFromCart = useCallback(
    async (itemId: string) => {
      setLoading(true)
      try {
        const newCart = cartItems.filter(
          (item) => item.id !== itemId
        )
        setCartItems(newCart)
        saveCart(newCart)

        // Отправляем на сервер
        if (telegramId) {
          await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-telegram-id': telegramId,
            },
            body: JSON.stringify({
              requestId: itemId,
              action: 'remove',
            }),
          })
        }
      } catch (error) {
        console.error('Error removing from cart:', error)
      } finally {
        setLoading(false)
      }
    },
    [cartItems, saveCart, telegramId]
  )

  // Обновляем количество заявки
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeFromCart(itemId)
        return
      }

      setLoading(true)
      try {
        const newCart = cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
        setCartItems(newCart)
        saveCart(newCart)
      } catch (error) {
        console.error('Error updating quantity:', error)
      } finally {
        setLoading(false)
      }
    },
    [cartItems, saveCart, removeFromCart]
  )

  // Очищаем корзину
  const clearCart = useCallback(async () => {
    setLoading(true)
    try {
      setCartItems([])
      saveCart([])

      // Отправляем на сервер
      if (telegramId) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-telegram-id': telegramId,
          },
          body: JSON.stringify({ action: 'clear' }),
        })
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
    } finally {
      setLoading(false)
    }
  }, [saveCart, telegramId])

  // Проверяем, находится ли заявка в корзине
  const isInCart = useCallback(
    (itemId: string) => {
      return cartItems.some((item) => item.id === itemId)
    },
    [cartItems]
  )

  // Получаем общую стоимость
  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity
    }, 0)
  }, [cartItems])

  // Получаем общее количество заявок
  const getTotalItems = useCallback(() => {
    return cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    )
  }, [cartItems])

  return {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getTotalPrice,
    getTotalItems,
  }
}
