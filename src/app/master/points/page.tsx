'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/authStore'
import { useNotifications } from '@/hooks/useNotifications'
import { useMasterNotifications } from '@/hooks/useMasterNotifications'
import Link from 'next/link'

interface Point {
  id: number
  address: string
  workingHours: string
}

export default function MasterPointsPage() {
  const [points, setPoints] = useState<Point[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { telegramId } = useAppStore()
  const { showNotification } = useNotifications()
  
  // Включаем уведомления для мастеров
  useMasterNotifications()
  
  useEffect(() => {
    if (telegramId) {
      fetchMasterPoints()
    }
  }, [telegramId])
  
  const fetchMasterPoints = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/master/points?telegramId=${telegramId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch points')
      }
      
      setPoints(data.points)
      showNotification('Точки загружены успешно', 'success')
    } catch (error) {
      console.error('Error fetching points:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загружаем ваши точки...</p>
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
            onClick={fetchMasterPoints}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Мои точки</h1>
          <p className="text-gray-600">Управляйте заявками на ваших точках</p>
        </div>
        
        {points.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет назначенных точек</h3>
            <p className="text-gray-500 mb-6">Обратитесь к администратору для назначения на точку</p>
            <button 
              onClick={fetchMasterPoints}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Обновить
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {points.map((point) => (
              <div key={point.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Точка #{point.id}
                        </h2>
                        <p className="text-gray-500 text-sm">Рабочая точка</p>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-gray-700">{point.address}</p>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-700">{point.workingHours}</p>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/master/points/${point.id}`}
                    className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Посмотреть заявки
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
