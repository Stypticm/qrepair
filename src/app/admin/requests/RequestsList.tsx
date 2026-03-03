'use client';

import { useState, useMemo } from 'react';
import { RequestsListClient } from './RequestsListClient';
import { RequestsSkeleton } from './RequestsSkeleton';

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
  assignedCourier: {
    id: string;
    telegramId: string;
  } | null;
}

interface RequestsListProps {
  requests: Request[];
}

export function RequestsList({ requests }: RequestsListProps) {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return requests;
    return requests.filter((req) => req.status === statusFilter);
  }, [requests, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = requests.reduce(
      (acc: { [key: string]: number }, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
      },
      {}
    );
    counts.all = requests.length;
    return counts;
  }, [requests]);

  const statusTranslations: { [key: string]: string } = {
    all: 'Все',
    submitted: 'Отправленные',
    draft: 'Черновики',
    completed: 'Завершенные',
    accepted: 'Принятые',
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', ...Object.keys(statusCounts).filter((s) => s !== 'all')].map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {statusTranslations[status] || status} ({statusCounts[status] || 0})
            </button>
          )
        )}
      </div>
      <RequestsListClient requests={filteredRequests} />
    </>
  );
}
