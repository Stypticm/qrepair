'use client'

import { usePathname } from 'next/navigation';
import FooterButton from '@/components/FooterButton/FooterButton';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { modelname } = useStartForm();

  // Определяем настройки кнопки в зависимости от страницы
  const getButtonConfig = () => {
    switch (path) {
      case '/request/submit':
        return {
          nextPath: '/',
          isNextDisabled: false,
          text: 'Отправить заявку'
        };
      default:
        return {
          nextPath: '/',
          isNextDisabled: false,
          text: 'Далее'
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="min-h-screen min-w-screen flex flex-col" style={{ padding: 'env(--safe-area-top, 0px) env(--safe-area-right, 0px) env(--safe-area-bottom, 0px) env(--safe-area-left, 0px)' }}>
      {/* Заголовок - только для страниц формы */}
      {path !== '/request/choose' && (
        <div className="text-center py-6">

          {/* Заголовок страницы */}
          {/* {path === '/request/submit' && (
              <h2 className="text-2xl font-extrabold text-gray-800 mt-4">
                  📱 Заявка
              </h2>
          )} */}
        </div>
      )}

      {/* Основной контент */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {children}
      </div>

      {/* Кнопка внизу - только для страниц формы, кроме тех, где есть автоматический переход */}
      {path !== '/request/submit' && path !== '/request/choose' && path !== '/request/form' && path !== '/request/condition' && path !== '/request/additional-condition' && (
        <div className="p-4 relative z-50">

          <FooterButton
            nextPath={buttonConfig.nextPath}
            isNextDisabled={buttonConfig.isNextDisabled}
          />
        </div>
      )}
    </div>
  );
}
