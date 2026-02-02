'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useAppStore } from '@/stores/authStore';
import { isAdminTelegramId } from '@/core/lib/admin';
import { useRouter } from 'next/navigation';

interface AdminRequestsClientProps {
  children: ReactNode;
}

export function AdminRequestsClient({
  children,
}: AdminRequestsClientProps) {
  const { telegramId } = useAppStore();
  const [accessDenied, setAccessDenied] = useState<boolean | null>(null);
  const router = useRouter();

  // Проверяем права доступа
  useEffect(() => {
    const checkAccess = () => {
      const currentTelegramId =
        telegramId ||
        (typeof window !== 'undefined'
          ? sessionStorage.getItem('telegramId')
          : null);

      if (currentTelegramId) {
        const isAdmin = isAdminTelegramId(currentTelegramId);
        setAccessDenied(!isAdmin);
        return true;
      }
      return false;
    };

    if (checkAccess()) {
      return;
    }

    const timer = setTimeout(() => {
      if (!checkAccess()) {
        setAccessDenied(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [telegramId]);

  if (accessDenied === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверяем доступ...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Доступ запрещен
          </h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 overflow-y-auto">
      <div className="mx-auto pt-16 px-4 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Управление заявками
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
