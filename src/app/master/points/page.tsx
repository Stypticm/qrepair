'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/authStore'
import Link from 'next/link'
import { Page } from '@/components/Page'
import { Button } from '@/components/ui/button'
import { QRScanner } from '@/components/QRScanner'

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
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [showQRScanner, setShowQRScanner] = useState(false)

  const { telegramId } = useAppStore()

  useEffect(() => {
    console.log('Master page - telegramId:', telegramId)
    if (telegramId) {
      fetchMasterRequests()
    } else {
      // Если telegramId еще не загружен, ждем немного
      const timer = setTimeout(() => {
        console.log('Master page - timer check, telegramId:', telegramId)
        if (telegramId) {
          fetchMasterRequests()
        } else {
          console.log('Master page - no telegramId, stopping loading')
          setLoading(false)
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [telegramId])

  const fetchMasterRequests = async () => {
    try {
      setLoading(true)

      // Получаем только заявки мастера
      const requestsResponse = await fetch(`/api/master/requests?masterTelegramId=${telegramId}`)
      const requestsData = await requestsResponse.json()

      if (!requestsResponse.ok) {
        throw new Error(requestsData.error || 'Failed to fetch master requests')
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

      console.log('🔍 Master page - requests received:', requestsData.requests.length)
      console.log('🔍 Master page - requests data:', requestsData.requests.map((r: any) => ({ id: r.id, status: r.status, assignedMasterId: r.assignedMasterId })))

      setRequests(requestsData.requests)
      setMasterPoints(pointsData.points)
      setAllPoints(allPointsData.points)

    } catch (error) {
      console.error('Error fetching master requests:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }


  const getPointInfo = (pointId: number) => {
    // Ищем среди всех точек для отображения информации
    return allPoints.find(point => point.id === pointId)
  }

  const addRequestToMaster = async (requestId: string) => {
    try {
      const response = await fetch('/api/master/add-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: requestId,
          masterTelegramId: telegramId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add request to master')
      }

      // Заявка успешно добавлена
      // Обновляем список заявок
      fetchMasterRequests()
    } catch (error) {
      console.error('Error adding request to master:', error)
      console.error('Ошибка при добавлении заявки')
    }
  }

  const handleQRScanSuccess = async (skupkaId: string) => {
    console.log('QR код отсканирован, ID заявки:', skupkaId)
    setShowQRScanner(false)
    await addRequestToMaster(skupkaId)
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
            onClick={fetchMasterRequests}
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
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto pt-16 px-4">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Все заявки</h1>
            <p className="text-gray-600">Сканируйте QR код для добавления заявки</p>
          </div>

          {/* QR Scanner and Manual Input */}
          <div className="mb-8 space-y-4">
            <button
              onClick={() => setShowQRScanner(true)}
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span>Сканировать QR код</span>
            </button>

            <div className="text-center text-gray-500 text-sm">или</div>

            <div className="flex space-x-2 gap-2">
              <input
                type="text"
                placeholder="Введите ID заявки"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={async (e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement
                    const requestId = input.value.trim()
                    if (requestId) {
                      await addRequestToMaster(requestId)
                      input.value = ''
                    }
                  }
                }}
              />
              <button
                onClick={async () => {
                  const input = document.querySelector('input[placeholder="Введите ID заявки"]') as HTMLInputElement
                  const requestId = input?.value.trim()
                  if (requestId) {
                    await addRequestToMaster(requestId)
                    input.value = ''
                  }
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                Добавить
              </button>
            </div>
          </div>

          {/* Заявки мастера */}

          {requests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Мои заявки</h2>
              {requests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-md font-semibold text-gray-900">{request.modelname || 'Не указано'}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${request.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              request.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                          }`}>
                          {request.status === 'submitted' ? 'Новая' :
                            request.status === 'in_progress' ? 'В работе' :
                              request.status === 'completed' ? 'Завершена' :
                                request.status}
                        </span>
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


                   <div className="flex space-x-3 gap-2">
                     {/* Показываем кнопки только если заявка не завершена */}
                     {request.status !== 'completed' && (
                       <>
                         <Link
                           href={`/master/requests/${request.id}`}
                           className="flex-1 bg-blue-600 text-black border-2 border-black px-4 py-2 rounded-md text-center hover:bg-blue-700 transition-colors"
                         >
                           Просмотреть детали
                         </Link>
                         <button
                      onClick={async () => {
                        // Кнопка неактивна для in_progress
                        if (request.status === 'in_progress') return

                        const newStatus = request.status === 'submitted' ? 'in_progress' :
                          request.status === 'inspected' ? 'completed' : 'submitted'

                        setUpdatingStatus(request.id)

                        try {
                          const response = await fetch('/api/master/request-status', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              requestId: request.id,
                              status: newStatus,
                              masterTelegramId: telegramId
                            })
                          })

                          const data = await response.json()

                          if (!response.ok) {
                            throw new Error(data.error || 'Failed to update status')
                          }

                          // Локально обновляем статус заявки
                          setRequests(prevRequests =>
                            prevRequests.map(req =>
                              req.id === request.id
                                ? { ...req, status: newStatus }
                                : req
                            )
                          )
                        } catch (error) {
                          console.error('Error updating request status:', error)
                        } finally {
                          setUpdatingStatus(null)
                        }
                      }}
                      disabled={request.status === 'in_progress' || updatingStatus === request.id}
                      className={`px-4 py-2 rounded-md transition-colors ${request.status === 'in_progress' || updatingStatus === request.id
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                      {updatingStatus === request.id ? 'Обновляем...' :
                        request.status === 'submitted' ? 'Взять в работу' :
                          request.status === 'in_progress' ? 'На проверке' :
                            request.status === 'inspected' ? 'Завершить' :
                              'Сбросить'}
                    </button>
                       </>
                     )}
                     
                     {/* Показываем статус для завершенных заявок */}
                     {request.status === 'completed' && (
                       <div className="w-full bg-green-50 border-2 border-green-200 rounded-lg p-3 text-center">
                         <p className="text-green-700 font-semibold">✅ Заявка завершена</p>
                         <p className="text-sm text-green-600">Все работы выполнены</p>
                         <p className="text-sm text-yellow-600 font-medium mt-1">💰 Деньги переданы клиенту</p>
                       </div>
                     )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Сообщение если нет заявок */}
          {requests.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет заявок</h3>
              <p className="text-gray-500">Сканируйте QR код или введите ID заявки для начала работы</p>
            </div>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScanSuccess={handleQRScanSuccess}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </Page>
  )
}