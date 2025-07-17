'use client';

import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';

const FooterButton = ({
  nextPath,
  isNextDisabled,
  onNext,
}: {
  nextPath: string;
  isNextDisabled: boolean;
  onNext?: () => Promise<void>;
}) => {
  const path = usePathname();
  const router = useRouter();

  const handleClick = async () => {
    if (onNext) await onNext();
    router.push(nextPath);
  };

  return (
    <section className="flex flex-row justify-between p-4">
      <Button variant={'destructive'} onClick={() => router.back()}>
        Назад
      </Button>
      {path !== '/repair/summary' ? (
        <Button className="bg-green-700" onClick={handleClick} disabled={!isNextDisabled}>
          Далее
        </Button>
      ) : (
        <Button className="bg-green-700" onClick={handleClick}>
          Отправить заявку
        </Button>
      )}
    </section>
  );
};

export default FooterButton;
