'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/authStore'
import { useMasterNotifications } from '@/hooks/useMasterNotifications'
import Link from 'next/link'

interface Request {
  id: string
  modelname: string
  price: number
  username: string
  status: string
  createdAt: string
  sn?: string
  deviceConditions?: any
  additionalConditions?: any
  aiAnalysis?: any
  photoUrls?: string[]
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function MasterRequestPage({ params }: PageProps) {
  const [request, setRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  
  const { telegramId } = useAppStore()
  
  // Включаем уведомления для мастеров
  useMasterNotifications()
  
  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      setRequestId(resolvedParams.id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (requestId) {
      fetchRequest()
    }
  }, [requestId])
  
  const fetchRequest = async () => {
    if (!requestId) return
    
    try {
      setLoading(true)
      // Здесь нужно создать API для получения конкретной заявки
      // Пока что используем заглушку
      const mockRequest: Request = {
        id: requestId,
        modelname: 'iPhone 15 Pro',
        price: 50000,
        username: 'test_user',
        status: 'submitted',
        createdAt: new Date().toISOString(),
        sn: 'ABC123456789',
        deviceConditions: {
          front: 'good',
          back: 'excellent',
          side: 'new'
        },
        additionalConditions: {
          faceId: true,
          touchId: true,
          backCamera: true,
          battery: 95
        }
      }
      
      setRequest(mockRequest)
    } catch (error) {
      console.error('Error fetching request:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }
  
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0]
    if (file) {
      const newPhotos = [...photos]
      newPhotos[index] = file
      setPhotos(newPhotos)
    }
  }
  
  const analyzeDevice = async () => {
    if (photos.length < 3) {
      alert('Пожалуйста, загрузите все 3 фото')
      return
    }
    
    try {
      setAnalyzing(true)
      
      // Загружаем фото в Supabase
      const photoUrls: string[] = []
      for (let i = 0; i < photos.length; i++) {
        const formData = new FormData()
        formData.append('photo', photos[i])
        formData.append('requestId', requestId!)
        
        const uploadResponse = await fetch('/api/admin/upload-master-photo', {
          method: 'POST',
          body: formData
        })
        
        const uploadData = await uploadResponse.json()
        
        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || 'Failed to upload photo')
        }
        
        photoUrls.push(uploadData.photoUrl)
      }
      
      const response = await fetch('/api/ai/evaluate-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          photos: photoUrls,
          telegramId: telegramId
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze device')
      }
      
      setAnalysisResult(data.analysis)
    } catch (error) {
      console.error('Error analyzing device:', error)
      alert('Ошибка при анализе устройства')
    } finally {
      setAnalyzing(false)
    }
  }
  
  const updateRequestStatus = async (status: string) => {
    try {
      const response = await fetch('/api/master/request-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          status,
          telegramId: telegramId
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status')
      }
      
      alert(`Заявка ${status === 'accepted' ? 'принята' : 'отклонена'}`)
      fetchRequest() // Обновляем данные
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Ошибка при обновлении статуса')
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загружаем заявку...</p>
        </div>
      </div>
    )
  }
  
  if (error || !request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Ошибка: {error || 'Заявка не найдена'}</p>
          <Link 
            href="/master/points"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Назад к точкам
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Заявка #{request.id}</h1>
            <p className="text-gray-600">Обработка заявки клиента</p>
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
        
        <div className="space-y-6">
          {/* Информация о заявке */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Информация о заявке</h2>
                  <p className="text-gray-500 text-sm">Детали заявки клиента</p>
                </div>
              </div>
              
              <div className="space-y-4">
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
            </div>
          </div>
          
          {/* ИИ-анализ */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">ИИ-анализ устройства</h2>
                  <p className="text-gray-500 text-sm">Анализ состояния устройства</p>
                </div>
              </div>
              
              {!analysisResult ? (
                <div>
                  <div className="space-y-6 mb-8">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          <span className="flex items-center">
                            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">1</span>
                            Фото передней части
                          </span>
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, 0)}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          <span className="flex items-center">
                            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">2</span>
                            Фото задней панели
                          </span>
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, 1)}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          <span className="flex items-center">
                            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2">3</span>
                            Фото боковой грани
                          </span>
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, 2)}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={analyzeDevice}
                    disabled={photos.length < 3 || analyzing}
                    className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                  >
                    {analyzing ? (
                      <>
                        <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Анализируем...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Анализировать устройство
                      </>
                    )}
                  </button>
                  
                  {analyzing && (
                    <div className="mt-6">
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div className="bg-blue-600 h-3 rounded-full animate-pulse transition-all duration-1000" style={{ width: '75%' }}></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-3 text-center">Анализируем устройство с помощью ИИ...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-green-800">Передняя часть</span>
                    </div>
                    <p className="text-green-700">{analysisResult.front.condition} (-{analysisResult.front.damagePercent}%)</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-green-800">Задняя панель</span>
                    </div>
                    <p className="text-green-700">{analysisResult.back.condition} (-{analysisResult.back.damagePercent}%)</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-green-800">Боковая грань</span>
                    </div>
                    <p className="text-green-700">{analysisResult.side.condition} (-{analysisResult.side.damagePercent}%)</p>
                  </div>
                  
                  <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <div className="text-center">
                      <p className="text-sm text-blue-600 mb-2">Финальная цена</p>
                      <p className="text-3xl font-bold text-blue-900">{analysisResult.finalPrice} ₽</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Действия с заявкой */}
          {analysisResult && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Действия с заявкой</h2>
                    <p className="text-gray-500 text-sm">Выберите действие после анализа</p>
                  </div>
                </div>
                
                <div className="grid gap-3 sm:grid-cols-3">
                  <button
                    onClick={() => updateRequestStatus('accepted')}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Принять заявку
                  </button>
                  
                  <button
                    onClick={() => updateRequestStatus('rejected')}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Отклонить заявку
                  </button>
                  
                  <button
                    onClick={() => alert('Функция запроса дополнительных фото будет добавлена')}
                    className="px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Запросить доп. фото
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
