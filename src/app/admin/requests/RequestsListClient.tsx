'use client';

import { Trash2 } from 'lucide-react';
import { useAppStore } from '@/stores/authStore';
import { useMutation } from '@tanstack/react-query';
import { assignRequest } from '@/lib/api';
import { useState } from 'react';
import { useMasters } from './MastersProvider';

interface Request {
  id: string;
  modelname: string | null;
  price: number | null;
  username: string;
  status: string;
  createdAt: Date | string;
  pickupPoint: string | null;
  assignedMasterId: string | null;
  assignedMaster: {
    id: string;
    name: string | null;
    username: string;
  } | null;
}

interface RequestsListClientProps {
  requests: Request[];
}

export function RequestsListClient({ requests }: RequestsListClientProps) {
  const { telegramId } = useAppStore();
  const { masters } = useMasters();
  const [selectedMaster, setSelectedMaster] = useState<{
    [requestId: string]: string;
  }>({});
  const [assigningRequestId, setAssigningRequestId] = useState<string | null>(
    null
  );

  const assignMutation = useMutation({
    mutationFn: assignRequest,
    onMutate: (variables) => {
      setAssigningRequestId(variables.requestId);
    },
    onSettled: () => {
      setAssigningRequestId(null);
      window.location.reload();
    },
    onError: (error) => {
      alert(`Ошибка назначения: ${error.message}`);
    },
  });

  const handleAssignRequest = (requestId: string) => {
    const masterId = selectedMaster[requestId];
    if (!masterId) {
      alert('Пожалуйста, выберите мастера.');
      return;
    }
    const currentTelegramId =
      telegramId ||
      (typeof window !== 'undefined' ? sessionStorage.getItem('telegramId') : null);

    if (!currentTelegramId) {
      alert('Ошибка: не найден Telegram ID');
      return;
    }

    assignMutation.mutate({
      requestId,
      masterId,
      adminTelegramId: currentTelegramId,
    });
  };

  const deleteRequest = async (requestId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) {
      return;
    }

    try {
      const currentTelegramId =
        telegramId ||
        (typeof window !== 'undefined' ? sessionStorage.getItem('telegramId') : null);

      const response = await fetch('/api/admin/requests/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-id': currentTelegramId || '',
        },
        body: JSON.stringify({ requestId }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Заявка успешно удалена');
        window.location.reload();
      } else {
        alert('Ошибка удаления заявки: ' + data.error);
      }
    } catch (error) {
      alert('Ошибка удаления заявки');
    }
  };

  return (
    <div className="space-y-6">
      {requests.map((request) => {
        const isAssigning = assigningRequestId === request.id;
        return (
          <div
            key={request.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Заявка #{request.id.substring(0, 8)}...
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {new Date(request.createdAt).toLocaleString('ru-RU')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      request.status === 'submitted'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
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
                <p>
                  <strong>Модель:</strong> {request.modelname || '—'}
                </p>
                <p>
                  <strong>Клиент:</strong> @{request.username}
                </p>
                <p>
                  <strong>Цена:</strong> {request.price || 0} ₽
                </p>
                {request.assignedMaster && (
                  <p>
                    <strong>Мастер:</strong> {request.assignedMaster.name} (
                    @{request.assignedMaster.username})
                  </p>
                )}
              </div>

              {!request.assignedMasterId && (
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedMaster[request.id] || ''}
                    onChange={(e) =>
                      setSelectedMaster((prev) => ({
                        ...prev,
                        [request.id]: e.target.value,
                      }))
                    }
                    className="flex-grow p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="" disabled>
                      Выберите мастера
                    </option>
                    {masters.map((master) => (
                      <option key={master.id} value={master.id}>
                        {master.name} (@{master.username})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssignRequest(request.id)}
                    disabled={
                      !selectedMaster[request.id] || assignMutation.isPending
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 w-36"
                  >
                    {isAssigning ? 'Назначается...' : 'Назначить'}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
