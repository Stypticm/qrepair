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
      case 'accepted':
        return 'Принята';
      case 'in_progress':
        return 'На проверке';
      case 'on_the_way':
        return 'В пути';
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
      case 'accepted':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'on_the_way':
        return 'bg-blue-500';
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
      <div className="min-h-screen min-w-screen bg-[#f9ecb8] flex flex-col" style={{ padding: 'env(--safe-area-top, 20px) env(--safe-area-right, 0px) env(--safe-area-bottom, 0px) env(--safe-area-left, 0px)' }}>
        <div className="w-full max-w-md text-center space-y-4">
          <h1 className="text-2xl font-extrabold uppercase text-black text-center leading-tight px-2">
            📋 МОИ<br />УСТРОЙСТВА
          </h1>

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
            <div className="p-2 flex flex-col gap-2">
              {myDevices.map((device: SkupkaRequest) => (
                <Card key={device.id} className="bg-slate-300 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold text-gray-800">
                        📱 {device.modelname ? 
                          (device.modelname.length > 40 ? 
                            device.modelname.substring(0, 40) + '...' : 
                            device.modelname
                          ) : 
                          'Неизвестная модель'
                        }
                      </CardTitle>
                      <Badge className={`${getStatusColor(device.status)} text-white px-3 py-1`}>
                        {getStatusText(device.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-600">ID заявки:</span>
                        <div className="text-gray-800 font-mono">{device.id}</div>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600">Модель:</span>
                        <div className="text-gray-800 break-words">{device.modelname ? device.modelname : '—'}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="!border-gray-500 text-gray-700 hover:bg-gray-50"
                        onClick={() => router.push(`/my-devices/status?status=${device.status}`)}>
                        📊 Проверить статус
                      </Button>

                      {device.status === 'on_the_way' && device.courierUserConfirmed && !device.inspectionCompleted && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => router.push(`/my-devices/inspection?id=${device.id}`)}>
                          🔍 Проверить устройство
                        </Button>
                      )}

                      {device.status === 'accepted' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white">
                          💰 Подтвердить цену
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
    </Page>
  )
}

export default MyDevices