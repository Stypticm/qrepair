'use client'

import { useState } from 'react'
import { useAppStore } from '@/stores/authStore'
import Link from 'next/link'
import { Page } from '@/components/Page'
import { Button } from '@/components/ui/button'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchMasterDashboard, transferMasterRequest } from '@/lib/api'

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

export default function MasterPointsPage() {
  const { telegramId } = useAppStore()
  const queryClient = useQueryClient()
  const [mutatingRequestId, setMutatingRequestId] = useState<string | null>(null);

  const effectiveTelegramId = (typeof window !== 'undefined' ? (telegramId || new URLSearchParams(window.location.search).get('telegramId') || sessionStorage.getItem('telegramId')) : telegramId) as string | null

  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ['masterDashboard', effectiveTelegramId],
    queryFn: () => fetchMasterDashboard(effectiveTelegramId!),
    enabled: !!effectiveTelegramId,
  })

  const transferRequestMutation = useMutation({
    mutationFn: transferMasterRequest,
    onMutate: (requestId) => {
      setMutatingRequestId(requestId);
    },
    onSettled: () => {
      setMutatingRequestId(null);
      queryClient.invalidateQueries({ queryKey: ['masterDashboard', effectiveTelegramId] })
      // Note: Invalidation for availableRequests is removed as it's no longer displayed
    },
    onError: (error) => {
      console.error('Error transferring request:', error)
      alert(`Error: ${error.message}`)
    }
  })

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
          <p className="text-red-600 mb-4">Ошибка: {error.message}</p>
          <button
            onClick={() => refetch()}
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Панель мастера</h1>
          </div>

          {isLoading ? (
            <div className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Мои заявки</h2>
                <div className="w-full flex items-center justify-center py-6">
                    <div className="inline-block h-8 w-8 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
                </div>
            </div>
          ) : dashboardData?.requests?.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Мои заявки</h2>
              {dashboardData.requests.map((request: Request) => {
                const isTransferring = transferRequestMutation.isPending && mutatingRequestId === request.id;
                return (
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
                    <div className="flex flex-col items-center space-y-2">
                      <Button variant='outline' asChild className="w-full text-green-600 px-4 py-2 rounded-md text-center hover:bg-green-800 transition-colors">
                        <Link href={`/master/requests/${request.id}`}>
                          Просмотреть детали
                        </Link>
                      </Button>
                      <Button
                        onClick={() => transferRequestMutation.mutate(request.id)}
                        disabled={transferRequestMutation.isPending}
                        variant="outline"
                        className="w-full text-slate-500 px-4 py-2 rounded-md text-center hover:bg-slate-700 transition-colors"
                      >
                        {isTransferring ? 'Передача...' : 'Передать заявку'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет назначенных заявок</h3>
              <p className="text-gray-500">Ожидайте назначения новых заявок от администратора</p>
            </div>
          )}
        </div>
      </div>
    </Page>
  )
}
