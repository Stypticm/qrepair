'use client';

import { useAppStore } from '@/stores/authStore';

export default function TestPage() {
  const { telegramId, userId, role } = useAppStore();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Тестовая страница</h1>
      <p>Если вы видите эту страницу, приложение работает!</p>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold">Zustand Store Test:</h2>
        <p>Telegram ID: {telegramId || 'null'}</p>
        <p>User ID: {userId || 'null'}</p>
        <p>Role: {role || 'null'}</p>
      </div>
    </div>
  );
}
