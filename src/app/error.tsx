'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        {/* Иконка ошибки */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-3xl">⚠️</span>
        </div>
        
        {/* Заголовок */}
        <h1 className="text-3xl font-semibold text-gray-900">
          Что-то пошло не так
        </h1>
        
        {/* Описание */}
        <p className="text-lg text-gray-600">
          Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернуться назад.
        </p>
        
        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => reset()}
            className="px-6 py-3 bg-[#2dc2c6] hover:bg-[#25a8ac] text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            Попробовать снова
          </Button>
          
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            Назад
          </button>
        </div>
        
        {/* Дополнительная информация */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Детали ошибки (только для разработчиков)
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs text-gray-700 overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
