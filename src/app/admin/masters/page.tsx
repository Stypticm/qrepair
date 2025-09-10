'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/authStore'

interface Master {
  id: string
  telegramId: string
  username: string
  name: string
  isActive: boolean
  pointId: number | null
  point?: {
    id: number
    address: string
    workingHours: string
  }
}

interface Point {
  id: number
  address: string
  workingHours: string
}

export default function AdminMastersPage() {
  const [masters, setMasters] = useState<Master[]>([])
  const [points, setPoints] = useState<Point[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { telegramId } = useAppStore()
  
  // Проверяем доступ только для админов
  const isAdmin = telegramId === '1' || telegramId === '531360988'
  
  useEffect(() => {
    if (telegramId && isAdmin) {
      fetchData()
    }
  }, [telegramId, isAdmin])
  
  const fetchData = async () => {
    try {
      setLoading(true)
      
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
  }
  
  const assignMasterToPoint = async (masterId: string, pointId: number) => {
    try {
      const response = await fetch('/api/admin/assign-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterId,
          pointId,
          adminTelegramId: telegramId
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign master')
      }
      
      // Показываем уведомление об успехе с деталями
      const master = masters.find(m => m.id.toString() === masterId)
      const point = points.find(p => p.id === pointId)
      
      if (master && point) {
        alert(`✅ Мастер ${master.name} успешно назначен на точку "${point.address}"\n\nМастер получит уведомление в Telegram.`)
      } else {
        alert('✅ Мастер успешно назначен на точку')
      }
      
      fetchData() // Обновляем данные
    } catch (error) {
      console.error('Error assigning master:', error)
      alert('❌ Ошибка при назначении мастера на точку')
    }
  }
  
  // Проверяем доступ
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Доступ запрещен</h1>
          <p className="text-gray-600">У вас нет прав для доступа к этой странице</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загружаем данные...</p>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление мастерами</h1>
          <p className="text-gray-600">Назначайте мастеров на точки и управляйте их статусом</p>
        </div>
        
        <div className="space-y-6">
          {masters.map((master) => (
            <div key={master.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {master.name || 'Без имени'}
                      </h3>
                      <p className="text-gray-500 text-sm">Мастер</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    master.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {master.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H8z" />
                    </svg>
                    <div>
                      <p className="text-gray-700 font-medium">{master.telegramId}</p>
                      <p className="text-gray-500 text-sm">Telegram ID</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <p className="text-gray-700 font-medium">@{master.username}</p>
                      <p className="text-gray-500 text-sm">Username</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-gray-700 font-medium">
                        {master.point ? master.point.address : 'Не назначена'}
                      </p>
                      <p className="text-gray-500 text-sm">Текущая точка</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Назначить на точку:
                  </label>
                  <select 
                    onChange={(e) => assignMasterToPoint(master.id, parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Выберите точку</option>
                    {points.map((point) => (
                      <option key={point.id} value={point.id}>
                        {point.address} ({point.workingHours})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}