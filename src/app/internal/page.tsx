'use client';

import { Page } from '@/components/Page';
import { Button } from '@/components/ui/button';
import { useAppStore, isMaster, useFeatureFlags } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function InternalPage() {
  const { userId, role, debugInfo, telegramId, username } = useAppStore();
  const { isAdmin } = useFeatureFlags();
  const router = useRouter();

  useEffect(() => {
    if (!isMaster(userId)) {
      router.replace('/');
    }
  }, [userId, router]);

  if (!isMaster(userId)) return null;

  return (
    <Page back={true}>
      <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 flex flex-col">
        <div className="flex-1 p-6" style={{ paddingTop: 'env(--safe-area-top, 60px)' }}>
          <div className="w-full max-w-md mx-auto space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900 text-center">Служебный раздел</h1>

            <div className="grid grid-cols-1 gap-3">
              {/* Мастерам видно только их раздел */}
              <Button
                variant="outline"
                className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white font-medium text-base rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => router.push('/master/points')}
              >
                Для мастеров
              </Button>

              {/* Админские кнопки — только если isAdmin() */}
              {isAdmin() && (
                <>
                  <Button
                    variant="outline"
                    className="w-full h-14 bg-purple-500 hover:bg-purple-600 text-white font-medium text-base rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-200"
                    onClick={() => router.push('/admin')}
                  >
                    Админ панель
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-12 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium text-sm rounded-xl border border-yellow-300 shadow-sm hover:shadow-md transition-all duration-200"
                    onClick={() => router.push('/debug')}
                  >
                    Показать отладку Telegram
                  </Button>
                </>
              )}
            </div>

            <div className="mt-2 p-4 bg-gray-100 rounded-lg border border-gray-300">
              <div className="text-sm font-semibold text-gray-700 mb-2">🔍 Отладочная информация Telegram</div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {debugInfo.length === 0 ? (
                  <div className="text-gray-500 text-xs">Нет отладочной информации</div>
                ) : (
                  debugInfo.map((info, index) => (
                    <div key={index} className="text-xs text-gray-600 font-mono">{info}</div>
                  ))
                )}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <div>telegramId: {telegramId || 'НЕТ'}</div>
                <div>username: {username || 'НЕТ'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}


