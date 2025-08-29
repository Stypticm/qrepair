'use client'

import { usePathname } from 'next/navigation';
import FooterButton from '@/components/FooterButton/FooterButton';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { modelname, answers } = useStartForm();

  // Определяем настройки кнопки в зависимости от страницы
  const getButtonConfig = () => {
    switch (path) {
      case '/request/display_scratches':
        return {
          nextPath: '/request/display_cracks',
          isNextDisabled: !answers || answers.length === 0 || answers[0] === undefined || answers[0] === null,
          text: 'Далее'
        };
      case '/request/display_cracks':
        return {
          nextPath: '/request/cracks',
          isNextDisabled: !answers || answers.length < 2 || answers[1] === undefined || answers[1] === null,
          text: 'Далее'
        };
      case '/request/cracks':
        return {
          nextPath: '/request/submit',
          isNextDisabled: !answers || answers.length < 2 || answers[1] === undefined || answers[1] === null,
          text: 'Далее'
        };
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
          {/* {path === '/request/form' && (
            <h2 className="text-2xl font-extrabold text-gray-800 mt-4">
              Выбери<br />свой iPhone
            </h2>
          )} */}
          {path === '/request/display_scratches' && (
            <h2 className="text-2xl font-extrabold text-gray-800 mt-4">
              📱 Царапины<br /> на экране
            </h2>
          )}
          {path === '/request/display_cracks' && (
            <h2 className="text-2xl font-extrabold text-gray-800 mt-4">
              💥 Трещины<br /> на экране
            </h2>
          )}
          {path === '/request/submit' && (
            <h2 className="text-2xl font-extrabold text-gray-800 mt-4">
              📱 Отправка<br /> заявки
            </h2>
          )}
        </div>
      )}

      {/* Основной контент */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {children}
      </div>

      {/* Кнопка внизу - только для страниц формы, кроме /request/form */}
      {path !== '/request/submit' && path !== '/request/choose' && path !== '/request/form' && (
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
