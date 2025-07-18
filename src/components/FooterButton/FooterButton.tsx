'use client';

import { Button } from '@/components/ui/button';
import { repairSteps } from '@/core/lib/constants';
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

  let step = repairSteps.findIndex((value) => path.startsWith(value.path));
  if (step === -1) step = 0;

  return (
    <section className="flex flex-row justify-between p-4">
      {
        path === '/repair/brand' ? (
          <Button variant={'destructive'} onClick={() => router.push('/repair/choose')}>
            Начать заново
          </Button>
        ) : (
          <Button variant={'destructive'} onClick={() => router.push(repairSteps[step - 1].path)}>
            Назад
          </Button>
        )
      }
      {
        path !== '/repair/summary' ? (
          <Button className="bg-green-700" onClick={handleClick} disabled={!isNextDisabled}>
            Далее
          </Button>
        ) : (
          <Button className="bg-green-700" onClick={handleClick}>
            Отправить заявку
          </Button>
        )
      }
    </section>
  );
};

export default FooterButton;
