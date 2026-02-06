'use client';

export const dynamic = 'force-dynamic';

import { Page } from '@/components/Page';
import { useAppStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SkupkaRequest } from '@/core/lib/interfaces';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { ChevronDown, ChevronUp, Smartphone, Calendar, ShoppingBag, Package, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';
import { OrderStatusTracker } from '@/components/OrderStatusTracker';

type TabType = 'selling' | 'bought'

interface Order {
  id: string
  userId: string
  deliveryMethod: string
  deliveryAddress?: string
  pickupPointId?: number
  pickupPoint?: {
    id: number
    address: string
    name: string
    workingHours: string
  }
  status: 'pending' | 'confirmed' | 'in_delivery' | 'completed' | 'cancelled'
  totalPrice: number
  createdAt: string
  updatedAt: string
  confirmedAt?: string
  inDeliveryAt?: string
  completedAt?: string
  courierName?: string
  courierPhone?: string
  trackingNotes?: string
  items: Array<{
    id: string
    title: string
    price: number
    lot: {
      id: string
      title: string
      model?: string
      storage?: string
      color?: string
      photos: string[]
    }
  }>
}

const MyDevices = () => {
  const { telegramId, setTelegramId } = useAppStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('selling')
  const [myDevices, setMyDevices] = useState<SkupkaRequest[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (deviceId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deviceId)) {
        newSet.delete(deviceId);
      } else {
        newSet.add(deviceId);
      }
      return newSet;
    });
  };

  // Загрузка Skupka (Продаю)
  useEffect(() => {
    if (telegramId && activeTab === 'selling') {
      const getData = async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/my-devices?telegramId=${telegramId}`);
          const data = await res.json();
          setMyDevices(data);
        } catch (e) {
          console.error('Ошибка при загрузке данных:', e);
        } finally {
          setLoading(false);
        }
      };
      getData();
    }
  }, [telegramId, activeTab]);

  // Загрузка Orders (Купил)
  useEffect(() => {
    if (telegramId && activeTab === 'bought') {
      const getData = async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/orders/my`);
          const data = await res.json();
          setMyOrders(data.orders || []);
        } catch (e) {
          console.error('Ошибка при загрузке заказов:', e);
        } finally {
          setLoading(false);
        }
      };
      getData();
    }
  }, [telegramId, activeTab]);

  const getStatusText = (status: string | undefined) => {
    if (!status) return 'Неизвестно';
    switch (status) {
      case 'draft': return 'Черновик';
      case 'submitted': return 'Отправлена';
      case 'in_progress': return 'На проверке';
      case 'on_the_way': return 'В пути';
      case 'accepted': return 'Принята';
      case 'paid': return 'Оплачено';
      case 'completed': return 'Завершено';
      default: return status;
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-600';
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'submitted': return 'bg-[#2dc2c6]';
      case 'accepted': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'on_the_way': return 'bg-[#2dc2c6]';
      case 'paid': return 'bg-emerald-500';
      default: return 'bg-gray-600';
    }
  };

  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₽`

  return (
    <Page back={true}>
      <div className="w-full h-full flex flex-col mx-auto bg-white">
        <div className="h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent bg-white">
          <div className="w-full max-w-md mx-auto px-2 bg-white">
            <div className="mb-6 mt-16 px-2">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/')}
                  className="p-2 hover:bg-gray-100 rounded-full h-10 w-10 flex-shrink-0"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-700" />
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Мои устройства</h1>
              </div>

              {/* Вкладки */}
              <div className="flex gap-2 justify-center mb-4">
                <button
                  onClick={() => setActiveTab('selling')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'selling'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <Package className="w-5 h-5" />
                  Продаю
                </button>
                <button
                  onClick={() => setActiveTab('bought')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'bought'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Купил
                </button>
              </div>

              {!loading && activeTab === 'selling' && myDevices.length > 0 && (
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Всего устройств: {myDevices.length}
                </div>
              )}

              {!loading && activeTab === 'bought' && myOrders.length > 0 && (
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Всего заказов: {myOrders.length}
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Image
                  src={getPictureUrl('animation_running.gif') || '/animation_running.gif'}
                  alt="Загрузка"
                  width={96}
                  height={96}
                  className="object-contain"
                />
              </div>
            ) : activeTab === 'selling' ? (
              /* Вкладка "Продаю" (Skupka) */
              myDevices.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-600 text-lg mb-2">У вас пока нет устройств</div>
                  <div className="text-gray-500">Создайте заявку на выкуп, чтобы начать</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {myDevices.map((device: SkupkaRequest) => {
                    const isExpanded = expandedCards.has(device.id);
                    return (
                      <Card key={device.id} className="bg-white border border-gray-200 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300">
                        <CardHeader
                          className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => toggleCard(device.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                              <CardTitle className="text-base font-semibold text-gray-900">
                                {device.modelname
                                  ? (device.modelname.length > 50
                                    ? device.modelname.substring(0, 50) + '...'
                                    : device.modelname)
                                  : 'Неизвестная модель'}
                              </CardTitle>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={`${getStatusColor(device.status)} text-white px-3 py-1 text-sm font-medium`}>
                                {getStatusText(device.status)}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-8 w-8"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <CardContent className="pt-0 space-y-2">
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                  <div className="bg-green-50 p-2.5 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <div className="text-green-800 font-bold text-base">
                                        Цена:
                                        {device.price != null ? (
                                          <span className="ml-1">
                                            {Math.round(device.price * 0.95)}–{Math.round(device.price * 1.05)} ₽
                                          </span>
                                        ) : (
                                          <span className="ml-1 text-green-700 font-semibold">Диапазон недоступен</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="mt-1 text-xs text-gray-600">
                                      ID: <span className="font-mono font-semibold text-gray-800">#{device.id}</span>
                                    </div>
                                  </div>

                                  {device.comment && (
                                    <div>
                                      <span className="font-semibold text-gray-600">Комментарий:</span>
                                      <div className="text-gray-800 bg-gray-50 p-2 rounded-lg">{device.comment}</div>
                                    </div>
                                  )}

                                  {device.finalPrice && (
                                    <div>
                                      <span className="font-semibold text-gray-600">Итоговая цена:</span>
                                      <div className="text-emerald-600 font-semibold bg-emerald-50 p-2 rounded-lg">{device.finalPrice} ₽</div>
                                    </div>
                                  )}

                                  {((device as any).courier || {}).telegramId && (
                                    <div>
                                      <span className="font-semibold text-gray-600">Курьер:</span>
                                      <div className="text-gray-800 bg-orange-50 p-2 rounded-lg">
                                        ID: {(((device as any).courier || {}).telegramId)}
                                        {(((device as any).courier || {}).timeSlot) && (
                                          <div className="text-sm text-orange-700 mt-1">
                                            Время: {(((device as any).courier || {}).timeSlot)}
                                          </div>
                                        )}
                                        {(((device as any).courier || {}).scheduledAt) && (
                                          <div className="text-sm text-orange-700">
                                            Дата: {new Date((((device as any).courier || {}).scheduledAt)).toLocaleDateString('ru-RU')}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {device.status === 'submitted' && (
                                    <div className="border-t pt-4">
                                      <div className="text-center">
                                        <QRCodeGenerator skupkaId={device.id} pointId={1} showHeader={false} showId={false} />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2 border-t">
                                  {device.status === 'on_the_way' && device.courierUserConfirmed && !device.inspectionCompleted && (
                                    <Button
                                      size="sm"
                                      className="bg-[#2dc2c6] hover:bg-[#25a8ac] text-white rounded-lg shadow-sm"
                                      onClick={() => router.push(`/my-devices/inspection?id=${device.id}`)}
                                    >
                                      Проверить устройство
                                    </Button>
                                  )}

                                  {device.status === 'accepted' && (
                                    <Button
                                      size="sm"
                                      className="bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-sm"
                                    >
                                      Подтвердить цену
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    );
                  })}
                </div>
              )
            ) : (
              /* Вкладка "Купил" (Orders) */
              myOrders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-600 text-lg mb-2">У вас пока нет заказов</div>
                  <div className="text-gray-500">Купите товары в магазине</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((order) => {
                    const isExpanded = expandedCards.has(order.id);
                    return (
                      <Card key={order.id} className="bg-white border border-gray-200 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300">
                        <CardHeader
                          className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => toggleCard(order.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                              <CardTitle className="text-base font-semibold text-gray-900">
                                Заказ #{order.id.slice(0, 8)}
                              </CardTitle>
                              <p className="text-sm text-gray-600 mt-1">
                                {order.items.length} товар{order.items.length === 1 ? '' : order.items.length < 5 ? 'а' : 'ов'} · {formatPrice(order.totalPrice)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-8 w-8"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <CardContent className="pt-0 space-y-4">
                                {/* Order Status Tracker */}
                                <OrderStatusTracker
                                  status={order.status}
                                  createdAt={new Date(order.createdAt)}
                                  confirmedAt={order.confirmedAt ? new Date(order.confirmedAt) : null}
                                  inDeliveryAt={order.inDeliveryAt ? new Date(order.inDeliveryAt) : null}
                                  completedAt={order.completedAt ? new Date(order.completedAt) : null}
                                />

                                {/* Товары */}
                                <div className="border-t pt-4">
                                  <p className="text-sm font-semibold text-gray-700 mb-2">Товары:</p>
                                  <div className="space-y-2">
                                    {order.items.map((item) => (
                                      <div key={item.id} className="bg-gray-50 p-3 rounded-lg">
                                        <p className="font-semibold text-gray-900">{item.title}</p>
                                        <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Доставка */}
                                <div className="border-t pt-4">
                                  <p className="text-sm font-semibold text-gray-700 mb-2">Способ получения:</p>
                                  {order.deliveryMethod === 'pickup' && order.pickupPoint ? (
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                      <div className="flex items-start gap-2">
                                        <span className="text-xl">🏪</span>
                                        <div>
                                          <p className="font-semibold text-gray-900">{order.pickupPoint.name}</p>
                                          <p className="text-sm text-gray-600">{order.pickupPoint.address}</p>
                                          <p className="text-sm text-gray-600">🕒 {order.pickupPoint.workingHours}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                      <p className="text-gray-900">Курьерская доставка</p>
                                      {order.deliveryAddress && (
                                        <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                                      )}
                                      {order.courierName && (
                                        <p className="text-sm text-gray-600">Курьер: {order.courierName}</p>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Заметки админа */}
                                {order.trackingNotes && (
                                  <div className="border-t pt-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Заметки:</p>
                                    <div className="bg-yellow-50 p-3 rounded-lg">
                                      <p className="text-sm text-gray-800">{order.trackingNotes}</p>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </Page>
  );
};

export default MyDevices;