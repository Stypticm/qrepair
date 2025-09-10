'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/authStore'
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
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function MasterPointRequestsPage({ params }: PageProps) {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pointId, setPointId] = useState<string | null>(null)
  
  const { telegramId } = useAppStore()
  
  // Включаем уведомления для мастеров
  useMasterNotifications()
  
  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      setPointId(resolvedParams.id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (telegramId && pointId) {
      fetchRequests()
    }
  }, [telegramId, pointId])
  
  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/master/requests?telegramId=${telegramId}&pointId=${pointId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch requests')
      }
      
      setRequests(data.requests)
    } catch (error) {
      console.error('Error fetching requests:', error)
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
            onClick={fetchRequests}
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Заявки точки #{pointId}</h1>
            <p className="text-gray-600">Обрабатывайте заявки клиентов</p>
          </div>
          <Link 
            href="/master/points"
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад к точкам
          </Link>
        </div>
        
        {requests.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет новых заявок</h3>
            <p className="text-gray-500 mb-6">Заявки появятся здесь, когда клиенты выберут вашу точку</p>
            <button 
              onClick={fetchRequests}
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
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Заявка #{request.id}
                        </h3>
                        <p className="text-gray-500 text-sm">Новая заявка</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      {request.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
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
                    
                    {request.sn && (
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-gray-700 font-medium">{request.sn}</p>
                          <p className="text-gray-500 text-sm">Серийный номер</p>
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
                  
                  <Link 
                    href={`/master/requests/${request.id}`}
                    className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Обработать заявку
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </Page>
  )
}
