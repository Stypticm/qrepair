'use client'

import { useRouter } from 'next/navigation'
import { Page } from '@/components/Page'
import { useCart } from '@/hooks/useCart'
import { ShoppingCart, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { getPictureUrl } from '@/core/lib/assets'

export default function CartPage() {
  const router = useRouter()
  const { cartItems, removeFromCart, clearCart, loading, getTotalPrice, getTotalItems } = useCart()

  const formatPrice = (price: number | null) => {
    if (!price) return "Цена не указана"
    return `${price.toLocaleString('ru-RU')} ₽`
  }

  const handleCheckout = () => {
    console.log('Checkout clicked, items:', cartItems.length)
    if (cartItems.length > 0) {
      router.push('/cart/checkout')
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
            <p className="text-gray-600 mb-6">Добавьте товары в корзину, <br />чтобы они появились здесь</p>
          </div>
          <button
            onClick={() => router.push('/')}
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
        <div className="mx-auto pt-16 px-4 pb-32">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Корзина</h1>
            <p className="text-gray-600">
              {getTotalItems()} товар{getTotalItems() === 1 ? '' : getTotalItems() < 5 ? 'а' : 'ов'} на сумму {formatPrice(getTotalPrice())}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Мини-изображение */}
                    <div className="relative w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0">
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
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {item.title}
                      </h3>
                      {item.model && (
                        <p className="text-sm text-gray-500 mb-1">
                          {item.model} {item.storage && `· ${item.storage}`} {item.color && `· ${item.color}`}
                        </p>
                      )}
                      <div className="text-xl font-bold text-gray-900">
                        {formatPrice(item.price)}
                      </div>
                    </div>

                    {/* Кнопка удаления */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      disabled={loading}
                      className="p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                      title="Удалить из корзины"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Итого и кнопки */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
            <div className="max-w-md mx-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">Итого:</span>
                <span className="text-2xl font-bold text-gray-900">{formatPrice(getTotalPrice())}</span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                  Оформить заказ
                </button>

                <button
                  onClick={clearCart}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}
