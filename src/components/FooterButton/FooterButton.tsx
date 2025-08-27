'use client';

import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';

const FooterButton = ({
  nextPath,
  isNextDisabled,
  onNext,
  onClick,
  preventRedirect = false
}: {
  nextPath?: string;
  isNextDisabled: boolean;
  onNext?: () => Promise<void>;
  onClick?: () => void;
  preventRedirect?: boolean;
}) => {
  const path = usePathname();
  const router = useRouter();

  const handleClick = async () => {
    if (onNext) await onNext();
    if (!preventRedirect) {
      router.push(nextPath || path);
    }
  };

  // Определяем текст и стили кнопки в зависимости от пути
  const getButtonConfig = () => {
    switch (path) {
      case '/request/form':
        return {
          text: 'Далее',
          className: 'bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-4 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
        };
      case '/request/display_scratches':
        return {
          text: 'Далее',
          className: 'bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-4 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
        };
      case '/request/display_cracks':
        return {
          text: 'Далее',
          className: 'bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-4 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
        };
      case '/request/photos':
        return {
          text: 'Отправить фото',
          className: 'bg-yellow-400 w-full text-black font-extrabold !text-xl !border-3 !border-black'
        };
      default:
        return {
          text: 'Далее',
          className: 'bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-4 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="flex justify-center w-full">
      <Button 
        className={buttonConfig.className}
        onClick={handleClick} 
        disabled={isNextDisabled}
      >
        {buttonConfig.text}
      </Button>
    </div>
  );
};

export default FooterButton;
