'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/stores/authStore'
import Link from 'next/link'
import { Page } from '@/components/Page'
import { Button } from '@/components/ui/button'

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
  const { telegramId } = useAppStore()
  const urlTelegramId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('telegramId') : null
  const effectiveTelegramId = (typeof window !== 'undefined'
    ? (telegramId || urlTelegramId || sessionStorage.getItem('telegramId'))
    : telegramId) as string | null

  const [requests, setRequests] = useState<Request[]>([])
  const [masterPoints, setMasterPoints] = useState<Point[]>([])
  const [allPoints, setAllPoints] = useState<Point[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [typedId, setTypedId] = useState('')

  const loadData = useCallback(async () => {
      if (!effectiveTelegramId) {
          console.warn('No effectiveTelegramId, skipping loadData');
          setLoading(false);
          return;
      }
      setLoading(true);
      setError(null);
      try {
          const res = await fetch(`/api/master/dashboard?telegramId=${effectiveTelegramId}`);
          if (!res.ok) {
              const json = await res.json();
              throw new Error(json?.error || `HTTP ${res.status}`);
          }
          const json = await res.json();
          setRequests(json.requests || []);
          setMasterPoints(json.points || []);
          setAllPoints(json.allPoints || json.points || []);
      } catch (e) {
          console.error('Dashboard fetch error:', e instanceof Error ? e.message : String(e));
          setError(e instanceof Error ? e.message : 'Failed to load data');
      } finally {
          setLoading(false);
      }
  }, [effectiveTelegramId]);

  useEffect(() => {
    if (effectiveTelegramId) {
      loadData()
    }
  }, [effectiveTelegramId, loadData])

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
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add request to master')
      }
      await loadData()
    } catch (error) {
      console.error('Error adding request to master:', error)
    }
  }

  if (!effectiveTelegramId) {
    return (
      <Page back={true}>
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center text-sm text-gray-600">
            Нет telegramId. Откройте приложение из Telegram или перезапустите.
          </div>
        </div>
      </Page>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Ошибка: {String(error)}</p>
          <button
            onClick={() => loadData()}
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
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Все заявки</h1>
          </div>

          <div className="mb-8 space-y-4">
            {/* QR scanning hidden. Keep only manual ID input. */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Введите ID заявки"
                value={typedId}
                onChange={(e) => setTypedId(e.target.value.replace(/\s+/g, '').trim())}
                inputMode="numeric"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={async (e) => {
                  if (e.key === 'Enter') {
                    const newId = typedId.trim()
                    if (newId) {
                      await addRequestToMaster(newId)
                      setTypedId('')
                    }
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText()
                    if (text) setTypedId(text.replace(/\s+/g, '').trim())
                  } catch (e) {
                    alert('Нет доступа к буферу обмена. Скопируйте ID вручную.')
                  }
                }}
                className="whitespace-nowrap"
              >
                Вставить
              </Button>
              <Button
                onClick={async () => {
                  const newId = typedId.trim()
                  if (newId) {
                    await addRequestToMaster(newId)
                    setTypedId('')
                  }
                }}
                disabled={!typedId.trim()}
              >
                Добавить
              </Button>
            </div>
            <p className="text-xs text-gray-500">Подсказка: нажмите «Вставить», чтобы взять ID из буфера обмена, и затем «Добавить».</p>
          </div>

          {loading ? (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Мои заявки</h2>
              <div className="w-full flex items-center justify-center py-6">
                <div className="inline-block h-8 w-8 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
              </div>
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Мои заявки</h2>
              {requests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-md font-semibold text-gray-900">{request.modelname || 'Не указано'}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${request.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                          {request.status === 'submitted' ? 'Новая' : request.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1"><strong>Клиент:</strong> @{request.username}</p>
                      <p className="text-sm text-gray-600 mb-1"><strong>Цена:</strong> {request.price ? `${request.price.toLocaleString()} ₽` : 'Не указана'}</p>
                      <p className="text-sm text-gray-600"><strong>Дата:</strong> {new Date(request.createdAt).toLocaleDateString('ru-RU')}</p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Link
                      href={`/master/requests/${request.id}`}
                      className="bg-blue-600 text-black border-2 border-black px-4 py-2 rounded-md text-center hover:bg-blue-700 transition-colors"
                    >
                      Просмотреть детали
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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

        {/* QRScanner modal removed */}
      </div>
    </Page>
  )
}
