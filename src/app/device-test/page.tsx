'use client';

import { useSafeArea } from '@/hooks/useSafeArea';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DeviceTestPage() {
  const { isTelegram, isReady, safeAreaInsets } = useSafeArea();
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">🧪 Тест устройства</h1>
        <p className="text-lg text-gray-600">
          Эта страница показывает, как приложение адаптируется к разным устройствам
        </p>
      </div>

      {/* Информация об устройстве */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Режим работы</h3>
          <div className="space-y-1 text-sm">
            <div>Telegram: <span className="font-mono">{isTelegram ? 'Да' : 'Нет'}</span></div>
            <div>Готов: <span className="font-mono">{isReady ? 'Да' : 'Нет'}</span></div>
            <div>Платформа: <span className="font-mono">{typeof window !== 'undefined' && window.Telegram?.WebApp?.platform || 'Неизвестно'}</span></div>
          </div>
        </div>

        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Safe Area</h3>
          <div className="space-y-1 text-sm">
            <div>Top: <span className="font-mono">{safeAreaInsets.top}px</span></div>
            <div>Right: <span className="font-mono">{safeAreaInsets.right}px</span></div>
            <div>Bottom: <span className="font-mono">{safeAreaInsets.bottom}px</span></div>
            <div>Left: <span className="font-mono">{safeAreaInsets.left}px</span></div>
          </div>
        </div>
      </div>

      {/* Информация о браузере */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Информация о браузере</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <div>User Agent: <span className="font-mono text-xs break-all">{typeof window !== 'undefined' ? navigator.userAgent : 'Недоступно'}</span></div>
          <div>Ширина экрана: <span className="font-mono">{typeof window !== 'undefined' ? window.screen.width : 'Недоступно'}</span></div>
          <div>Высота экрана: <span className="font-mono">{typeof window !== 'undefined' ? window.screen.height : 'Недоступно'}</span></div>
          <div>Ширина viewport: <span className="font-mono">{typeof window !== 'undefined' ? window.innerWidth : 'Недоступно'}</span></div>
          <div>Высота viewport: <span className="font-mono">{typeof window !== 'undefined' ? window.innerHeight : 'Недоступно'}</span></div>
          <div>Плотность пикселей: <span className="font-mono">{typeof window !== 'undefined' ? window.devicePixelRatio : 'Недоступно'}</span></div>
        </div>
      </div>

      {/* Тестовые элементы */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Тестовые элементы</h3>
        
        <div className="bg-yellow-100 p-4 rounded-lg">
          <p className="text-yellow-800">
            Этот блок должен корректно отображаться на всех устройствах
          </p>
        </div>

        <div className="bg-red-100 p-4 rounded-lg">
          <p className="text-red-800">
            Проверьте, как выглядит приложение на разных устройствах
          </p>
        </div>

        <div className="bg-purple-100 p-4 rounded-lg">
          <p className="text-purple-800">
            В Telegram приложение должно использовать safe area
          </p>
        </div>
      </div>

      {/* Кнопки навигации */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={() => router.push('/')} variant="outline">
          🏠 Главная
        </Button>
        <Button onClick={() => router.push('/safe-area-test')} variant="outline">
          📱 Safe Area Test
        </Button>
        <Button onClick={() => window.history.back()} variant="outline">
          ⬅️ Назад
        </Button>
      </div>

      {/* Инструкции */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">Как тестировать:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Откройте в браузере - должно быть центрировано с ограниченной шириной</li>
          <li>• Откройте в Telegram - должно использовать safe area</li>
          <li>• На мобильном браузере - должно быть адаптировано под экран</li>
          <li>• На десктопе - должно быть в &quot;карточке&quot; с тенью</li>
        </ul>
      </div>
    </div>
  );
}
