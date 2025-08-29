'use client'

import { Page } from '@/components/Page'
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SkupkaRequest } from '@/core/lib/interfaces';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdaptiveContainer } from '@/components/AdaptiveContainer/AdaptiveContainer';

const MyDevices = () => {
  const { telegramId } = useStartForm();
  const router = useRouter();
  const [myDevices, setMyDevices] = useState<SkupkaRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (telegramId) {
      const getData = async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/my-devices?telegramId=${telegramId}`)
          const data = await res.json()

          setMyDevices(data)
        } catch (e) {
          console.error(e)
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
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'on_the_way':
        return 'bg-blue-600';
      case 'accepted':
        return 'bg-green-500';
      case 'paid':
        return 'bg-emerald-500';
      case 'completed':
        return 'bg-purple-500';
      default:
        return 'bg-gray-600';
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : myDevices.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-600 text-lg mb-2">У вас пока нет устройств</div>
                <div className="text-gray-500">Создайте заявку на выкуп, чтобы начать</div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {myDevices.map((device: SkupkaRequest) => (
                  <Card key={device.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-semibold text-gray-900 pr-4">
                          {device.modelname ? 
                            (device.modelname.length > 50 ? 
                              device.modelname.substring(0, 50) + '...' : 
                              device.modelname
                            ) : 
                            'Неизвестная модель'
                          }
                        </CardTitle>
                        <Badge className={`${getStatusColor(device.status)} text-white px-3 py-1 text-sm font-medium`}>
                          {getStatusText(device.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div>
                          <span className="font-semibold text-gray-600">ID заявки:</span>
                          <div className="text-gray-800 font-mono text-xs bg-gray-100 p-2 rounded-lg">{device.id}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-600">Пользователь:</span>
                          <div className="text-gray-800 bg-gray-50 p-2 rounded-lg">{device.username || '—'}</div>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-600">Модель:</span>
                          <div className="text-gray-800 break-words bg-gray-50 p-2 rounded-lg">{device.modelname ? device.modelname : '—'}</div>
                        </div>
                        {device.comment && (
                          <div>
                            <span className="font-semibold text-gray-600">Комментарий:</span>
                            <div className="text-gray-800 bg-gray-50 p-2 rounded-lg">{device.comment}</div>
                          </div>
                        )}
                        {device.price && (
                          <div>
                            <span className="font-semibold text-gray-600">Цена:</span>
                            <div className="text-green-600 font-semibold bg-green-50 p-2 rounded-lg">{device.price} ₽</div>
                          </div>
                        )}
                        {device.finalPrice && (
                          <div>
                            <span className="font-semibold text-gray-600">Итоговая цена:</span>
                            <div className="text-emerald-600 font-semibold bg-emerald-50 p-2 rounded-lg">{device.finalPrice} ₽</div>
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-gray-600">Дата создания:</span>
                          <div className="text-gray-800 bg-gray-50 p-2 rounded-lg">
                            {new Date(device.createdAt).toLocaleDateString('ru-RU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        {device.submittedAt && (
                          <div>
                            <span className="font-semibold text-gray-600">Дата отправки:</span>
                            <div className="text-gray-800 bg-gray-50 p-2 rounded-lg">
                              {new Date(device.submittedAt).toLocaleDateString('ru-RU', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        )}
                        {device.deviceConditions && (
                          <div>
                            <span className="font-semibold text-gray-600">Состояние устройства:</span>
                            <div className="space-y-2">
                              {device.deviceConditions.front && (
                                <div className="text-gray-800 bg-blue-50 p-2 rounded-lg">
                                  <span className="font-medium">Передняя панель:</span> {device.deviceConditions.front}
                                </div>
                              )}
                              {device.deviceConditions.back && (
                                <div className="text-gray-800 bg-blue-50 p-2 rounded-lg">
                                  <span className="font-medium">Задняя панель:</span> {device.deviceConditions.back}
                                </div>
                              )}
                              {device.deviceConditions.side && (
                                <div className="text-gray-800 bg-blue-50 p-2 rounded-lg">
                                  <span className="font-medium">Боковая панель:</span> {device.deviceConditions.side}
                                </div>
                              )}
                            </div>
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
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-lg"
                          onClick={() => router.push(`/my-devices/status?status=${device.status}`)}>
                          Проверить статус
                        </Button>

                        {device.status === 'on_the_way' && device.courierUserConfirmed && !device.inspectionCompleted && (
                          <Button
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm"
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
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  )
}

export default MyDevices