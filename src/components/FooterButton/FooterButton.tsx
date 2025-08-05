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

  return (
    <div className="flex flex-row justify-center p-2">
      {
        path === '/request/form' && (
          <Button className="bg-green-700 w-full" onClick={handleClick} disabled={!isNextDisabled}>
            Оценить телефон
          </Button>
        )
      }
      {
        path === '/request/photos' && (
          <Button
            className="bg-yellow-400 w-full text-black font-extrabold !text-xl !border-3 !border-black"
            onClick={handleClick}
            disabled={!isNextDisabled}>
            Отправить фото
          </Button>
        )
      }
    </div>
  );
};

export default FooterButton;
