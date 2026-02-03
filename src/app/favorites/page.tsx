'use client'

import { useState, useEffect } from 'react'
import { Page } from '@/components/Page'
import { useFavorites } from '@/hooks/useFavorites'
import { Heart, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'
import { getPictureUrl } from '@/core/lib/assets'
import { sendTon } from '@/core/ton/tonconnect'
import { DesktopHeader } from '@/components/Desktop/DesktopHeader'

interface FavoriteLot {
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
}

export default function FavoritesPage() {
  const { favorites, removeFromFavorites, loading } = useFavorites()
  const [favoriteLots, setFavoriteLots] = useState<FavoriteLot[]>([])
  const [loadingLots, setLoadingLots] = useState(true)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  // Загружаем данные лотов из избранного
  useEffect(() => {
    const loadFavoriteLots = async () => {
      setLoadingLots(true)
      try {
        // Получаем все лоты и фильтруем избранные
        const response = await fetch('/api/market/feed?limit=100&offset=0', { cache: 'no-store' })
        const data = await response.json()

        if (response.ok && Array.isArray(data.items)) {
          const favoriteItems = data.items.filter((item: FavoriteLot) =>
            favorites.includes(item.id)
          )
          setFavoriteLots(favoriteItems)
        }
      } catch (error) {
        console.error('Error loading favorite lots:', error)
      } finally {
        setLoadingLots(false)
      }
    }

    if (favorites.length > 0) {
      loadFavoriteLots()
    } else {
      setLoadingLots(false)
    }
  }, [favorites])

  const handleRemoveFromFavorites = async (lotId: string) => {
    await removeFromFavorites(lotId)
    setFavoriteLots(prev => prev.filter(lot => lot.id !== lotId))
  }

  const toggleCardExpansion = (lotId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(lotId)) {
        newSet.delete(lotId)
      } else {
        newSet.add(lotId)
      }
      return newSet
    })
  }

  const handleBuyWithTon = async (lotId: string) => {
    try {
      // Демонстрационная сумма 0.1 TON (в нанотонах: 0.1 * 1e9)
      await sendTon('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c', String(0.1 * 1e9))
    } catch (e) {
      console.error('TON payment error', e)
    }
  }

  const formatPrice = (price: number | null) => {
    if (!price) return "Цена не указана"
    return `${price.toLocaleString('ru-RU')} ₽`
  }

  // formatting function declaration
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // removed the invalid import here

  // ... 

  if (loadingLots) {
    return (
      <Page back={true}>
        <div className="hidden md:block"><DesktopHeader /></div>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center md:pt-20">
          <div className="text-center">
            {/* ... */}
          </div>
        </div>
      </Page>
    )
  }

  return (
    <Page back={true}>
      <div className="hidden md:block"><DesktopHeader /></div>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto pt-16 md:pt-24 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Избранное</h1>
            <p className="text-gray-600">
              {favoriteLots.length === 0
                ? 'У вас пока нет избранных заявок'
                : `${favoriteLots.length} заявк${favoriteLots.length === 1 ? 'а' : favoriteLots.length < 5 ? 'и' : ''} в избранном`
              }
            </p>
          </div>

          {favoriteLots.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Избранное пусто</h3>
              <p className="text-gray-600 mb-6">Добавьте заявки в избранное, чтобы они появились здесь</p>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-[#2dc2c6] text-white rounded-xl hover:bg-[#25a8ac] transition-colors"
              >
                Вернуться к заявкам
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {favoriteLots.map((lot) => {
                const isExpanded = expandedCards.has(lot.id)
                return (
                  <div key={lot.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Минимизированная карточка */}
                    <div className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Мини-изображение */}
                        <div className="relative w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0">
                          {lot.cover ? (
                            <Image
                              src={lot.cover}
                              alt={lot.title}
                              fill
                              className="object-cover rounded-xl"
                            />
                          ) : lot.photos && lot.photos.length > 0 ? (
                            <Image
                              src={lot.photos[0]}
                              alt={lot.title}
                              fill
                              className="object-cover rounded-xl"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image
                                src={getPictureUrl('animation_logo2.gif') || '/animation_logo2.gif'}
                                alt="Нет фото"
                                width={24}
                                height={24}
                                className="opacity-50"
                              />
                            </div>
                          )}
                        </div>

                        {/* Основная информация */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                            {lot.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-gray-900">
                              {formatPrice(lot.price)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(lot.date)}
                            </div>
                          </div>
                        </div>

                        {/* Кнопки действий */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRemoveFromFavorites(lot.id)}
                            disabled={loading}
                            className="p-2 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                            title="Удалить из избранного"
                          >
                            <Heart className="w-4 h-4 text-red-500 fill-current" />
                          </button>
                          <button
                            onClick={() => toggleCardExpansion(lot.id)}
                            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                            title={isExpanded ? "Свернуть" : "Подробнее"}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Развернутая информация */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="pt-4 space-y-4">
                          {/* Описание */}
                          {lot.description && (
                            <p className="text-sm text-gray-600">
                              {lot.description}
                            </p>
                          )}

                          {/* Характеристики */}
                          <div className="grid grid-cols-2 gap-3">
                            {lot.model && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Модель</div>
                                <div className="font-semibold text-gray-900 text-sm">{lot.model}</div>
                              </div>
                            )}
                            {lot.storage && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Память</div>
                                <div className="font-semibold text-gray-900 text-sm">{lot.storage}</div>
                              </div>
                            )}
                            {lot.color && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Цвет</div>
                                <div className="font-semibold text-gray-900 text-sm">{lot.color}</div>
                              </div>
                            )}
                            {lot.condition && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Состояние</div>
                                <div className="font-semibold text-gray-900 text-sm">{lot.condition}</div>
                              </div>
                            )}
                          </div>

                          {/* Кнопки покупки */}
                          <div className="flex gap-3">
                            <button className="flex-1 px-4 py-3 bg-[#2dc2c6] hover:bg-[#25a8ac] text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                              <ShoppingCart className="w-4 h-4" />
                              Купить
                            </button>
                            <button
                              onClick={() => handleBuyWithTon(lot.id)}
                              className="flex-1 px-4 py-3 bg-[#2dc2c6] hover:bg-[#25a8ac] text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                className="w-4 h-4"
                                aria-hidden
                              >
                                <path
                                  fill="#FFFFFF"
                                  stroke="#FFFFFF"
                                  strokeOpacity="0.85"
                                  strokeWidth="0.25"
                                  d="M12 2c5.523 0 10 2.477 10 5.533 0 1.42-.88 3.29-2.34 5.384-1.37 1.97-3.24 4.13-5.2 6.11-1.4 1.41-2.79 2.62-3.78 3.34a.99.99 0 0 1-1.36-.2c-.99-.72-2.38-1.93-3.78-3.34-1.96-1.98-3.83-4.14-5.2-6.11C.88 10.823 0 8.953 0 7.533 0 4.477 4.477 2 10 2h2Zm0 2h-2C6.06 4 2 5.57 2 7.533c0 .86.68 2.36 2.02 4.29 1.27 1.82 3.06 3.9 4.96 5.83 1.07 1.06 2.08 1.96 3.02 2.67.94-.71 1.95-1.61 3.02-2.67 1.9-1.93 3.69-4.01 4.96-5.83 1.34-1.93 2.02-3.43 2.02-4.29C22 5.57 17.94 4 14 4h-2Zm0 2 4 6h-3v6h-2v-6H8l4-6Z"
                                />
                              </svg>
                              TON
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Page>
  )
}
