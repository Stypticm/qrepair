'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/authStore'
import { useNotifications } from '@/hooks/useNotifications'
import { useMasterNotifications } from '@/hooks/useMasterNotifications'
import Link from 'next/link'
import { Page } from '@/components/Page'

interface Request {
  id: string
  modelname: string
  price: number
  username: string
  status: string
  createdAt: string
  sn?: string
  pickupPoint?: string
  assignedMaster?: {
    id: string
    name: string
  }
}

interface Point {
  id: number
  name: string
  address: string
}

export default function MasterPointsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [masterPoints, setMasterPoints] = useState<Point[]>([])
  const [allPoints, setAllPoints] = useState<Point[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPoints, setExpandedPoints] = useState<Set<number>>(new Set())
  
  const { telegramId } = useAppStore()
  const { showNotification } = useNotifications()
  
  // Включаем уведомления для мастеров
  useMasterNotifications()
  
  useEffect(() => {
    if (telegramId) {
      fetchAllRequests()
    }
  }, [telegramId])
  
  const fetchAllRequests = async () => {
    try {
      setLoading(true)
      
      // Получаем заявки
      const requestsResponse = await fetch(`/api/admin/requests?adminTelegramId=${telegramId}`)
      const requestsData = await requestsResponse.json()
      
      if (!requestsResponse.ok) {
        throw new Error(requestsData.error || 'Failed to fetch requests')
      }
      
      // Получаем точки мастера
      const pointsResponse = await fetch(`/api/master/points?telegramId=${telegramId}`)
      const pointsData = await pointsResponse.json()
      
      if (!pointsResponse.ok) {
        throw new Error(pointsData.error || 'Failed to fetch master points')
      }
      
      // Получаем все точки для отображения информации
      const allPointsResponse = await fetch(`/api/admin/points?adminTelegramId=${telegramId}`)
      const allPointsData = await allPointsResponse.json()
      
      if (!allPointsResponse.ok) {
        throw new Error(allPointsData.error || 'Failed to fetch all points')
      }
      
      setRequests(requestsData.requests)
      setMasterPoints(pointsData.points)
      setAllPoints(allPointsData.points)
      showNotification('Заявки загружены успешно', 'success')
    } catch (error) {
      console.error('Error fetching data:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }
  
  const togglePointExpansion = (pointId: number) => {
    const newExpanded = new Set(expandedPoints)
    if (newExpanded.has(pointId)) {
      newExpanded.delete(pointId)
    } else {
      newExpanded.add(pointId)
    }
    setExpandedPoints(newExpanded)
  }
  
  const groupRequestsByPoint = () => {
    const grouped: { [key: number]: Request[] } = {}
    
    requests.forEach(request => {
      const pointId = parseInt(request.pickupPoint || '0')
      if (!grouped[pointId]) {
        grouped[pointId] = []
      }
      grouped[pointId].push(request)
    })
    
    return grouped
  }
  
  const isRequestActive = (request: Request) => {
    const pointId = parseInt(request.pickupPoint || '0')
    return masterPoints.some(point => point.id === pointId)
  }
  
  const getPointInfo = (pointId: number) => {
    // Ищем среди всех точек для отображения информации
    return allPoints.find(point => point.id === pointId)
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загружаем заявки...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Ошибка: {error}</p>
          <button 
            onClick={fetchAllRequests}
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
        <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Все заявки</h1>
          <p className="text-gray-600">Управляйте всеми заявками в системе</p>
          {masterPoints.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">
                Ваша точка: {masterPoints.map(point => point.address).join(', ')}
              </p>
            </div>
          )}
        </div>
        
        {requests.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет заявок</h3>
            <p className="text-gray-500">В системе пока нет заявок</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupRequestsByPoint()).map(([pointId, pointRequests]) => {
              const isMyPoint = masterPoints.some(point => point.id === parseInt(pointId))
              const isExpanded = expandedPoints.has(parseInt(pointId))
              const pointInfo = getPointInfo(parseInt(pointId))
              
              return (
                <div key={pointId} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Заголовок точки */}
                  <div 
                    className={`p-4 ${isMyPoint ? 'cursor-pointer hover:bg-gray-50 transition-colors' : 'cursor-not-allowed'} ${
                      isMyPoint ? 'bg-green-50 border-l-4 border-green-500' : 'bg-gray-50 border-l-4 border-gray-300'
                    }`}
                    onClick={() => isMyPoint && togglePointExpansion(parseInt(pointId))}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${isMyPoint ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {pointInfo ? pointInfo.address : `Точка #${pointId}`}
                          </h3>
                          {pointInfo && pointInfo.name && (
                            <p className="text-sm text-gray-600">{pointInfo.name}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          isMyPoint ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {pointRequests.length} заявок
                        </span>
                        {!isMyPoint && (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            Недоступно
                          </span>
                        )}
                      </div>
                      {isMyPoint && (
                        <svg 
                          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  {/* Заявки точки */}
                  {isExpanded && (
                    <div className="border-t border-gray-200">
                      {pointRequests.map((request) => {
                        const isActive = isRequestActive(request)
                        
                        return (
                          <div 
                            key={request.id} 
                            className={`p-4 border-b border-gray-100 last:border-b-0 ${
                              isActive ? 'hover:bg-gray-50' : 'opacity-60 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="text-md font-semibold text-gray-900">{request.modelname || 'Не указано'}</h4>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    request.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                                    request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    request.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {request.status === 'submitted' ? 'Новая' :
                                     request.status === 'in_progress' ? 'В работе' :
                                     request.status === 'completed' ? 'Завершена' :
                                     request.status}
                                  </span>
                                  {!isActive && (
                                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                      Недоступно
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>Клиент:</strong> @{request.username}
                                </p>
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>Цена:</strong> {request.price ? `${request.price.toLocaleString()} ₽` : 'Не указана'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <strong>Дата:</strong> {new Date(request.createdAt).toLocaleDateString('ru-RU')}
                                </p>
                              </div>
                            </div>
                            
                            {isActive && (
                              <div className="flex space-x-3">
                                <Link
                                  href={`/master/requests/${request.id}`}
                                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-center hover:bg-blue-700 transition-colors"
                                >
                                  Просмотреть детали
                                </Link>
                                <button
                                  onClick={() => {
                                    const newStatus = request.status === 'submitted' ? 'in_progress' : 
                                                     request.status === 'in_progress' ? 'completed' : 'submitted'
                                    // Здесь можно добавить логику обновления статуса
                                  }}
                                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                >
                                  {request.status === 'submitted' ? 'Взять в работу' :
                                   request.status === 'in_progress' ? 'Завершить' :
                                   'Сбросить'}
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
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