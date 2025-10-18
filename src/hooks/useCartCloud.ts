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
  const [cloudSyncEnabled, setCloudSyncEnabled] =
    useState(false)
  const { telegramId } = useAppStore()

  // Проверяем доступность Telegram Cloud Storage
  useEffect(() => {
    if (telegramId && typeof window !== 'undefined') {
      // Проверяем, поддерживает ли Telegram WebApp Cloud Storage
      const hasCloudStorage =
        (window as any).Telegram?.WebApp?.CloudStorage !==
        undefined
      setCloudSyncEnabled(hasCloudStorage)

      if (hasCloudStorage) {
        console.log('✅ Telegram Cloud Storage доступен')
        loadFromCloud()
      } else {
        console.log(
          '⚠️ Telegram Cloud Storage недоступен, используем localStorage'
        )
        loadFromLocalStorage()
      }
    }
  }, [telegramId])

  // Загружаем из localStorage (fallback)
  const loadFromLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart))
        } catch (error) {
          console.error(
            'Error parsing cart from localStorage:',
            error
          )
        }
      }
    }
  }, [])

  // Загружаем из Telegram Cloud Storage
  const loadFromCloud = useCallback(async () => {
    if (!telegramId) return

    try {
      const response = await fetch('/api/cart/cloud', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-id': telegramId,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.cartItems && data.cartItems.length > 0) {
          setCartItems(data.cartItems)
          console.log(
            '✅ Корзина загружена из Telegram Cloud'
          )
        } else {
          // Если в облаке пусто, загружаем из localStorage
          loadFromLocalStorage()
        }
      } else {
        console.warn(
          '⚠️ Ошибка загрузки из облака, используем localStorage'
        )
        loadFromLocalStorage()
      }
    } catch (error) {
      console.error('Error loading from cloud:', error)
      loadFromLocalStorage()
    }
  }, [telegramId, loadFromLocalStorage])

  // Сохраняем в localStorage (всегда)
  const saveToLocalStorage = useCallback(
    (newCart: CartItem[]) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'cart',
          JSON.stringify(newCart)
        )
      }
    },
    []
  )

  // Синхронизируем с Telegram Cloud Storage
  const syncToCloud = useCallback(
    async (cartData: CartItem[]) => {
      if (!telegramId || !cloudSyncEnabled) return

      try {
        await fetch('/api/cart/cloud', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-telegram-id': telegramId,
          },
          body: JSON.stringify({
            cartData,
            action: 'sync',
          }),
        })
        console.log(
          '✅ Корзина синхронизирована с Telegram Cloud'
        )
      } catch (error) {
        console.error('Error syncing to cloud:', error)
      }
    },
    [telegramId, cloudSyncEnabled]
  )

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

        // Сохраняем локально (всегда)
        saveToLocalStorage(newCart)

        // Синхронизируем с облаком (если доступно)
        await syncToCloud(newCart)

        // Отправляем на сервер для аналитики
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
    [cartItems, saveToLocalStorage, syncToCloud, telegramId]
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

        // Сохраняем локально (всегда)
        saveToLocalStorage(newCart)

        // Синхронизируем с облаком (если доступно)
        await syncToCloud(newCart)

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
    [cartItems, saveToLocalStorage, syncToCloud, telegramId]
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

        // Сохраняем локально (всегда)
        saveToLocalStorage(newCart)

        // Синхронизируем с облаком (если доступно)
        await syncToCloud(newCart)
      } catch (error) {
        console.error('Error updating quantity:', error)
      } finally {
        setLoading(false)
      }
    },
    [
      cartItems,
      saveToLocalStorage,
      syncToCloud,
      removeFromCart,
    ]
  )

  // Очищаем корзину
  const clearCart = useCallback(async () => {
    setLoading(true)
    try {
      setCartItems([])

      // Сохраняем локально (всегда)
      saveToLocalStorage([])

      // Синхронизируем с облаком (если доступно)
      await syncToCloud([])

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
  }, [saveToLocalStorage, syncToCloud, telegramId])

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
    cloudSyncEnabled,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getTotalPrice,
    getTotalItems,
    syncToCloud,
  }
}
