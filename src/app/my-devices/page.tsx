'use client'

// Принудительно делаем страницу динамической для обхода кэширования
export const dynamic = 'force-dynamic';

import { Page } from '@/components/Page'
import { useAppStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SkupkaRequest } from '@/core/lib/interfaces';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { ChevronDown, ChevronUp, QrCode, Calendar, User, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';

const MyDevices = () => {
  const { telegramId, setTelegramId } = useAppStore();
  const router = useRouter();
  const [myDevices, setMyDevices] = useState<SkupkaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Функция для переключения раскрытия карточки
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

  // Восстанавливаем telegramId из sessionStorage при загрузке страницы
  useEffect(() => {
    if (typeof window !== 'undefined' && !telegramId) {
      const savedTelegramId = sessionStorage.getItem('telegramId');
      if (savedTelegramId) {
        setTelegramId(savedTelegramId);
      }
    }
  }, [telegramId, setTelegramId]);

  useEffect(() => {
    if (telegramId) {
      const getData = async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/my-devices?telegramId=${telegramId}`)
          const data = await res.json()
          setMyDevices(data)
        } catch (e) {
          console.error('Ошибка при загрузке данных:', e)
        } finally {
          setLoading(false);
        }
      }
      getData()
    }
  }, [telegramId])

  // Функция для получения статуса на русском
  const getStatusText = (status: string | undefined) => {
    if (!status) return 'Неизвестно';

    switch (status) {
      case 'draft':
        return 'Черновик';
      case 'submitted':
        return 'Отправлена';
      case 'in_progress':
        return 'На проверке';
      case 'on_the_way':
        return 'В пути';
      case 'accepted':
        return 'Принята';
      case 'paid':
        return 'Оплачено';
      case 'completed':
        return 'Завершено';
      default:
        return status;
    }
  };

  // Функция для получения цвета статуса
  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-600';
    
    switch (status) {
      case 'draft':
        return 'bg-gray-500';
      case 'submitted':
        return 'bg-[#2dc2c6]';
      case 'accepted':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'on_the_way':
        return 'bg-[#2dc2c6]';
      case 'paid':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusHoverColor = (status: string | undefined) => {
    if (!status) return 'hover:bg-gray-700';
    
    switch (status) {
      case 'draft':
        return 'hover:bg-gray-600';
      case 'submitted':
        return 'hover:bg-[#25a8ac]';
      case 'accepted':
        return 'hover:bg-green-600';
      case 'in_progress':
        return 'hover:bg-yellow-600';
      case 'on_the_way':
        return 'hover:bg-[#25a8ac]';
      case 'paid':
        return 'hover:bg-emerald-600';
      default:
        return 'hover:bg-gray-700';
    }
  };

  return (
    <Page back={true}>
      <div className="w-full min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar admin-masters-scroll" style={{ height: 'calc(100vh - 120px)', overflowY: 'scroll', paddingTop: 'env(--safe-area-top, 60px)' }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 mt-12">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">Мои устройства</h1>
              {!loading && myDevices.length > 0 && (
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                  Всего устройств: {myDevices.length}
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
            ) : myDevices.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-600 text-lg mb-2">У вас пока нет устройств</div>
                <div className="text-gray-500">Создайте заявку на выкуп, чтобы начать</div>
              </div>
            ) : (
              <div className="space-y-4">
                {myDevices.map((device: SkupkaRequest) => {
                  const isExpanded = expandedCards.has(device.id);
                  return (
                    <Card key={device.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
                      {/* Заголовок карточки - всегда видимый */}
                      <CardHeader 
                        className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => toggleCard(device.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-4">
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              {device.modelname ? 
                                (device.modelname.length > 50 ? 
                                  device.modelname.substring(0, 50) + '...' : 
                                  device.modelname
                                ) : 
                                'Неизвестная модель'
                              }
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

                      {/* Раскрывающийся контент */}
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
                              <div className="grid grid-cols-1 gap-3 text-sm">
                                {/* Основная информация */}
                                <div className="space-y-3 mb-4">
                                  <div className="flex items-center gap-2">
                                    <Smartphone className="w-4 h-4 text-gray-500" />
                                    <span className="font-semibold text-gray-600">ID заявки:</span>
                                    <span className="font-mono text-gray-800">#{device.id}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="font-semibold text-gray-600">Дата:</span>
                                    <span className="text-gray-800">{new Date(device.createdAt).toLocaleDateString('ru-RU')}</span>
                                  </div>
                                </div>

                                {device.price && (
                                  <div className="bg-green-50 p-3 rounded-lg">
                                    <span className="font-semibold text-gray-600">Цена:</span>
                                    <div className="text-green-600 font-semibold text-lg">{device.price} ₽</div>
                                  </div>
                                )}

                                <div>
                                  <span className="font-semibold text-gray-600">Полная модель:</span>
                                  <div className="text-gray-800 break-words bg-gray-50 p-2 rounded-lg">{device.modelname || '—'}</div>
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


                                {device.courierTelegramId && (
                                  <div>
                                    <span className="font-semibold text-gray-600">Курьер:</span>
                                    <div className="text-gray-800 bg-orange-50 p-2 rounded-lg">
                                      ID: {device.courierTelegramId}
                                      {device.courierTimeSlot && (
                                        <div className="text-sm text-orange-700 mt-1">
                                          Время: {device.courierTimeSlot}
                                        </div>
                                      )}
                                      {device.courierScheduledAt && (
                                        <div className="text-sm text-orange-700">
                                          Дата: {new Date(device.courierScheduledAt).toLocaleDateString('ru-RU')}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* QR-код для мастера */}
                                {device.status === 'submitted' && (
                                  <div className="border-t pt-4">
                                    <div className="text-center">
                                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center justify-center gap-2">
                                        <QrCode className="w-5 h-5 text-teal-500" />
                                        QR-код для мастера
                                      </h4>
                                      <p className="text-sm text-gray-600 mb-4">
                                        Покажите этот QR-код мастеру при сдаче устройства
                                      </p>
                                      <QRCodeGenerator skupkaId={parseInt(device.id) || 0} pointId={1} />
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2 pt-2 border-t">
                                {device.status === 'on_the_way' && device.courierUserConfirmed && !device.inspectionCompleted && (
                                  <Button
                                    size="sm"
                                    className="bg-[#2dc2c6] hover:bg-[#25a8ac] text-white rounded-lg shadow-sm"
                                    onClick={() => router.push(`/my-devices/inspection?id=${device.id}`)}>
                                    Проверить устройство
                                  </Button>
                                )}

                                {device.status === 'accepted' && (
                                  <Button
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-sm">
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
            )}
          </div>
        </div>
      </div>
    </Page>
  )
}

export default MyDevices