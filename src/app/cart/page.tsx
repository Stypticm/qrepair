'use client'

import { useState } from 'react'
import { Page } from '@/components/Page'
import { useCart } from '@/hooks/useCart'
import { ShoppingCart, Trash2, Plus, Minus, CreditCard } from 'lucide-react'
import Image from 'next/image'
import { getPictureUrl } from '@/core/lib/assets'
import { sendTon } from '@/core/ton/tonconnect'

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, loading, getTotalPrice, getTotalItems } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const formatPrice = (price: number | null) => {
    if (!price) return "Цена не указана"
    return `${price.toLocaleString('ru-RU')} ₽`
  }

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    try {
      // Демонстрационная сумма (общая стоимость корзины в TON)
      const totalPriceInTon = getTotalPrice() / 100 // Предполагаем курс 1 TON = 100₽
      await sendTon('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c', String(totalPriceInTon * 1e9))

      // После успешной оплаты очищаем корзину
      await clearCart()
    } catch (e) {
      console.error('Checkout error', e)
    } finally {
      setIsCheckingOut(false)
    }
  }

  const handleBuyAllWithTon = async () => {
    setIsCheckingOut(true)
    try {
      // Демонстрационная сумма (общая стоимость корзины в TON)
      const totalPriceInTon = getTotalPrice() / 100 // Предполагаем курс 1 TON = 100₽
      await sendTon('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c', String(totalPriceInTon * 1e9))

      // После успешной оплаты очищаем корзину
      await clearCart()
    } catch (e) {
      console.error('TON payment error', e)
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <Page back={true}>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Корзина пуста</h3>
            <p className="text-gray-600 mb-6">Добавьте заявки в корзину, чтобы они появились здесь</p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-[#2dc2c6] text-white rounded-xl hover:bg-[#25a8ac] transition-colors font-semibold flex items-center justify-center gap-2 mx-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            На главную
          </button>
        </div>
      </Page>
    )
  }

  return (
    <Page back={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto pt-16 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Корзина</h1>
            <p className="text-gray-600">
              {getTotalItems()} заявк{getTotalItems() === 1 ? 'а' : getTotalItems() < 5 ? 'и' : ''} на сумму {formatPrice(getTotalPrice())}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Мини-изображение */}
                    <div className="relative w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0">
                      {item.cover ? (
                        <Image
                          src={item.cover}
                          alt={item.title}
                          fill
                          className="object-cover rounded-xl"
                        />
                      ) : item.photos && item.photos.length > 0 ? (
                        <Image
                          src={item.photos[0]}
                          alt={item.title}
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
                        {item.title}
                      </h3>
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(item.price)}
                      </div>
                    </div>

                    {/* Управление количеством */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={loading}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="px-3 py-1 bg-gray-50 rounded-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={loading}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>

                    {/* Кнопка удаления */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      disabled={loading}
                      className="p-2 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                      title="Удалить из корзины"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Итого и кнопки */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-semibold text-gray-900">Итого:</span>
              <span className="text-2xl font-bold text-gray-900">{formatPrice(getTotalPrice())}</span>
            </div>

            <div className="space-y-6 flex flex-col gap-2">
              <button
                onClick={handleCheckout}
                disabled={loading || isCheckingOut}
                className="w-full px-6 py-4 bg-[#2dc2c6] hover:bg-[#25a8ac] text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CreditCard className="w-5 h-5" />
                {isCheckingOut ? 'Обработка...' : 'Оформить заказ'}
              </button>

              <button
                onClick={handleBuyAllWithTon}
                disabled={loading || isCheckingOut}
                className="w-full px-6 py-4 bg-[#2dc2c6] hover:bg-[#25a8ac] text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
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
                Оплатить TON
              </button>

              <button
                onClick={clearCart}
                disabled={loading}
                className="w-full px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 border border-red-200 hover:border-red-300 disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                Очистить корзину
              </button>

              <button
                onClick={() => window.history.back()}
                className="w-full px-6 py-3 bg-[#2dc2c6] hover:bg-[#25a8ac] text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Вернуться к заявкам
              </button>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}
