'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/stores/authStore'
import { Page } from '@/components/Page'

interface Request {
  id: string
  modelname: string
  price: number
  username: string
  status: string
  createdAt: string
  pickupPoint: string
  assignedMasterId?: string
  assignedMaster?: {
    id: string
    name: string
    username: string
  }
}

interface Master {
  id: string
  name: string
  username: string
  pointId: number | null
}

interface Point {
  id: number
  address: string
  workingHours: string
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [masters, setMasters] = useState<Master[]>([])
  const [points, setPoints] = useState<Point[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accessDenied, setAccessDenied] = useState(false)
  const [selectedPoints, setSelectedPoints] = useState<{ [requestId: string]: number }>({})

  const { telegramId } = useAppStore()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      // Получаем все заявки
      const requestsResponse = await fetch(`/api/admin/requests?adminTelegramId=${telegramId}`)
      const requestsData = await requestsResponse.json()

      if (!requestsResponse.ok) {
        throw new Error(requestsData.error || 'Failed to fetch requests')
      }

      setRequests(requestsData.requests)

      // Получаем всех мастеров
      const mastersResponse = await fetch(`/api/admin/masters?adminTelegramId=${telegramId}`)
      const mastersData = await mastersResponse.json()

      if (!mastersResponse.ok) {
        throw new Error(mastersData.error || 'Failed to fetch masters')
      }

      setMasters(mastersData.masters)

      // Получаем все точки
      const pointsResponse = await fetch(`/api/admin/points?adminTelegramId=${telegramId}`)
      const pointsData = await pointsResponse.json()

      if (!pointsResponse.ok) {
        throw new Error(pointsData.error || 'Failed to fetch points')
      }

      setPoints(pointsData.points)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [telegramId])

  // Проверяем права доступа
  useEffect(() => {
    console.log('Admin requests page - telegramId:', telegramId);
    
    const checkAccess = () => {
      // Проверяем telegramId из store или sessionStorage
      const currentTelegramId = telegramId || sessionStorage.getItem('telegramId');
      
      if (currentTelegramId) {
        const adminIds = ['1', '296925626', '531360988'];
        const isAdmin = adminIds.includes(currentTelegramId);
        
        console.log('Admin requests page - isAdmin:', isAdmin, 'telegramId:', currentTelegramId);
        
        if (isAdmin) {
          setAccessDenied(false);
          fetchData();
        } else {
          setAccessDenied(true);
          setLoading(false);
        }
        return true;
      }
      return false;
    };

    if (checkAccess()) {
      return;
    }

    // Если telegramId еще не загружен, ждем дольше
    const timer = setTimeout(() => {
      console.log('Admin requests page - timeout, checking sessionStorage');
      if (!checkAccess()) {
        setAccessDenied(true);
        setLoading(false);
      }
    }, 5000); // Увеличиваем до 5 секунд
    
    return () => clearTimeout(timer);
  }, [telegramId, fetchData]);

  const handlePointSelect = (requestId: string, pointId: number) => {
    setSelectedPoints(prev => ({
      ...prev,
      [requestId]: pointId
    }))
  }

  const getMastersForPoint = (pointId: number) => {
    return masters.filter(master => master.pointId === pointId)
  }

  const handleMasterSelect = async (requestId: string, masterId: string) => {
    const selectedPointId = selectedPoints[requestId]
    if (!selectedPointId) {
      alert('Сначала выберите точку')
      return
    }

    try {
      const response = await fetch('/api/admin/transfer-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          newPointId: selectedPointId,
          newMasterId: masterId,
          adminTelegramId: telegramId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to transfer request')
      }

      alert('Заявка передана')
      // Очищаем выбор для этой заявки
      setSelectedPoints(prev => {
        const newSelected = { ...prev }
        delete newSelected[requestId]
        return newSelected
      })
      fetchData() // Обновляем данные
    } catch (error) {
      console.error('Error transferring request:', error)
      alert('Ошибка при передаче заявки')
    }
  }

  const transferRequest = async (requestId: string, newPointId: number, newMasterId: string) => {
    // Старая функция для совместимости, теперь не используется
    try {
      const response = await fetch('/api/admin/transfer-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          newPointId,
          newMasterId,
          adminTelegramId: telegramId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to transfer request')
      }

      alert('Заявка передана')
      fetchData() // Обновляем данные
    } catch (error) {
      console.error('Error transferring request:', error)
      alert('Ошибка при передаче заявки')
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Page back={true}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загружаем данные...</p>
            </div>
          </div>
        </Page>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-white">
        <Page back={true}>
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Доступ запрещен</h1>
              <p className="text-gray-600 mb-4">У вас нет прав для доступа к этой странице</p>
              <button 
                onClick={() => window.history.back()} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Назад
              </button>
            </div>
          </div>
        </Page>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Ошибка: {error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <Page back={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto pt-16 px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление заявками</h1>
            {/* <p className="text-gray-600">Перемещайте заявки между точками и назначайте мастеров</p> */}
          </div>

          <div className="space-y-6">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Заявка #{request.id}
                        </h3>
                        <p className="text-gray-500 text-sm">Заявка клиента</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${request.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          request.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                            request.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                      }`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-gray-700 font-medium">{request.modelname}</p>
                        <p className="text-gray-500 text-sm">Модель устройства</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <div>
                        <p className="text-gray-700 font-medium">{request.price} ₽</p>
                        <p className="text-gray-500 text-sm">Предварительная цена</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div>
                        <p className="text-gray-700 font-medium">@{request.username}</p>
                        <p className="text-gray-500 text-sm">Клиент</p>
                      </div>
                    </div>

                    {request.assignedMaster && (
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                        <div>
                          <p className="text-gray-700 font-medium">{request.assignedMaster.name} (@{request.assignedMaster.username})</p>
                          <p className="text-gray-500 text-sm">Назначенный мастер</p>
                        </div>
                      </div>
                    )}


                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-gray-700 font-medium">{new Date(request.createdAt).toLocaleString('ru-RU')}</p>
                        <p className="text-gray-500 text-sm">Время создания</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  )
}