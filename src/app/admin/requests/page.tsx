'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/stores/authStore'
import { Page } from '@/components/Page'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAdminData, assignRequest } from '@/lib/api'

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
  const [accessDenied, setAccessDenied] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMaster, setSelectedMaster] = useState<{ [requestId: string]: string }>({});
  const [assigningRequestId, setAssigningRequestId] = useState<string | null>(null);

  const { telegramId } = useAppStore()
  const queryClient = useQueryClient()

  // Check access rights
  useState(() => {
    const currentTelegramId = telegramId || sessionStorage.getItem('telegramId');
    if (currentTelegramId) {
      const adminIds = ['1', '296925626', '531360988'];
      const isAdmin = adminIds.includes(currentTelegramId);
      setAccessDenied(!isAdmin);
    } else {
      const timer = setTimeout(() => {
        if (!telegramId && !sessionStorage.getItem('telegramId')) {
            setAccessDenied(true);
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminData', telegramId],
    queryFn: () => fetchAdminData(telegramId!),
    enabled: !accessDenied && !!telegramId,
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

  if (isLoading && !accessDenied) {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загружаем данные...</p>
            </div>
        </div>
    )
  }

  if (accessDenied) {
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
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto pt-16 px-4">
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
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${request.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {request.status}
                        </span>
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