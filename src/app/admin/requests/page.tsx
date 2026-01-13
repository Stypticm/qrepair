'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAppStore } from '@/stores/authStore'
import { Page } from '@/components/Page'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAdminData, assignRequest } from '@/lib/api'
import { Trash2 } from 'lucide-react'
import Image from 'next/image'
import { getPictureUrl } from '@/core/lib/assets'

// Interfaces remain the same
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

export default function AdminRequestsPage() {
  const [accessDenied, setAccessDenied] = useState<boolean | null>(null); // null = проверяем, true = запрещён, false = разрешён
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMaster, setSelectedMaster] = useState<{ [requestId: string]: string }>({});
  const [assigningRequestId, setAssigningRequestId] = useState<string | null>(null);

  const { telegramId } = useAppStore()
  const queryClient = useQueryClient()

  // Check access rights - синхронная проверка
  useEffect(() => {
    const currentTelegramId = telegramId || sessionStorage.getItem('telegramId');
    if (currentTelegramId) {
      const adminIds = ['1', '296925626', '531360988'];
      const isAdmin = adminIds.includes(currentTelegramId);
      setAccessDenied(!isAdmin);
    } else {
      // Если нет telegramId, ждём немного и проверяем снова
      const timer = setTimeout(() => {
        const retryTelegramId = telegramId || sessionStorage.getItem('telegramId');
        if (!retryTelegramId) {
          setAccessDenied(true);
        } else {
          const adminIds = ['1', '296925626', '531360988'];
          const isAdmin = adminIds.includes(retryTelegramId);
          setAccessDenied(!isAdmin);
        }
      }, 500) // Уменьшил время ожидания
      return () => clearTimeout(timer)
    }
  }, [telegramId]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminData', telegramId],
    queryFn: () => fetchAdminData(telegramId!),
    enabled: accessDenied === false && !!telegramId,
  });

  const { requests = [], masters = [] } = data || {};

  const assignMutation = useMutation({
    mutationFn: assignRequest,
    onMutate: (variables) => {
      setAssigningRequestId(variables.requestId);
    },
    onSettled: () => {
      setAssigningRequestId(null);
      queryClient.invalidateQueries({ queryKey: ['adminData', telegramId] });
    },
    onError: (error) => {
      alert(`Failed to assign request: ${error.message}`);
    }
  });

  const handleAssignRequest = (requestId: string) => {
    const masterId = selectedMaster[requestId];
    if (!masterId) {
      alert('Please select a master.');
      return;
    }
    if (telegramId) {
      assignMutation.mutate({ requestId, masterId, adminTelegramId: telegramId });
    }
  };

  // Функция для удаления заявки
  const deleteRequest = async (requestId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) {
      return;
    }
    
    try {
      const response = await fetch('/api/admin/requests/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-id': telegramId || '',
        },
        body: JSON.stringify({ requestId }),
      });
      
      const data = await response.json();
      if (response.ok) {
        alert('Заявка успешно удалена');
        // Обновляем список заявок
        refetch();
      } else {
        alert('Ошибка удаления заявки: ' + data.error);
      }
    } catch (error) {
      alert('Ошибка удаления заявки');
    }
  };

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return requests;
    return requests.filter((req: Request) => req.status === statusFilter);
  }, [requests, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = requests.reduce((acc: { [key: string]: number }, req: Request) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {});
    counts.all = requests.length;
    return counts;
  }, [requests]);

  const statusTranslations: { [key: string]: string } = {
    all: 'Все',
    submitted: 'Отправленные',
    draft: 'Черновики',
    completed: 'Завершенные',
    accepted: 'Принятые',
    // Add other statuses here as they appear
  };

  // Показываем лоадер пока проверяем доступ
  if (accessDenied === null) {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <img
                  src={getPictureUrl('animation_running.gif') || '/animation_running.gif'}
                  alt="Загрузка"
                  width={64}
                  height={64}
                  className="object-contain w-full h-full"
                  style={{ imageRendering: 'auto' }}
                />
              </div>
              <p className="text-gray-600">Проверяем доступ...</p>
            </div>
        </div>
    )
  }

  if (isLoading && accessDenied === false) {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <img
                  src={getPictureUrl('animation_running.gif') || '/animation_running.gif'}
                  alt="Загрузка"
                  width={64}
                  height={64}
                  className="object-contain w-full h-full"
                  style={{ imageRendering: 'auto' }}
                />
              </div>
              <p className="text-gray-600">Загружаем данные...</p>
            </div>
        </div>
    )
  }

  if (accessDenied === true) {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Доступ запрещен</h1>
            </div>
        </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Ошибка: {error.message}</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Попробовать снова</button>
        </div>
      </div>
    )
  }

  return (
    <Page back={true}>
      <div className="w-full h-full bg-gray-50 overflow-y-auto">
        <div className="mx-auto pt-16 px-4 pb-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Управление заявками</h1>
            <div className="flex flex-wrap gap-2">
              {['all', ...Object.keys(statusCounts).filter(s => s !== 'all')].map(status => (
                <button 
                  key={status} 
                  onClick={() => setStatusFilter(status)} 
                  className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${statusFilter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  {statusTranslations[status] || status} ({statusCounts[status] || 0})
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {filteredRequests.map((request: Request) => {
              const isAssigning = assigningRequestId === request.id;
              return (
                <div key={request.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">Заявка #{request.id.substring(0, 8)}...</h3>
                            <p className="text-gray-500 text-sm">{new Date(request.createdAt).toLocaleString('ru-RU')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${request.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                              {request.status}
                          </span>
                          <button
                            onClick={() => deleteRequest(request.id)}
                            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                            title="Удалить заявку"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                        <p><strong>Модель:</strong> {request.modelname}</p>
                        <p><strong>Клиент:</strong> @{request.username}</p>
                        <p><strong>Цена:</strong> {request.price} ₽</p>
                        {request.assignedMaster && <p><strong>Мастер:</strong> {request.assignedMaster.name} (@{request.assignedMaster.username})</p>}
                    </div>

                    {!request.assignedMasterId && (
                      <div className="flex gap-2 items-center">
                        <select 
                          value={selectedMaster[request.id] || ''} 
                          onChange={(e) => setSelectedMaster(prev => ({ ...prev, [request.id]: e.target.value }))} 
                          className="flex-grow p-2 border border-gray-300 rounded-lg text-sm">
                          <option value="" disabled>Выберите мастера</option>
                          {masters.map((master: Master) => (
                            <option key={master.id} value={master.id}>{master.name} (@{master.username})</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => handleAssignRequest(request.id)} 
                          disabled={!selectedMaster[request.id] || assignMutation.isPending}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 w-36">
                          {isAssigning ? 'Назначается...' : 'Назначить'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Page>
  )
}