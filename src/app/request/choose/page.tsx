'use client';

import { Page } from '@/components/Page';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

const ChoosePage = () => {
  const router = useRouter();
  const { telegramId, username } = useStartForm();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);

    await fetch('/api/request/choose', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegramId,
        username,
      }),
    });

    router.push('/request/form');
  };

  return (
    <Page back={true}>
      <h2 className="text-3xl font-extrabold uppercase text-black tracking-tight mb-2 text-center">Выберите способ заполнения</h2>
      <section className="flex flex-col gap-4">
        <section className=' rounded-sm border-3 !border-slate-700'>
          <Image
            src="/photo_manual.png"
            alt="Ручное заполнение"
            width={400}
            height={300}
            className="h-full w-full object-cover"
            onClick={handleStart}
          />
        </section>
        <Button
          variant="outline"
          className="w-full bg-background text-black uppercase border-3 !border-slate-700 h-full py-8 rounded-xl blur-xs"
        >
          <span className='text-2xl font-bold disabled'>Оценка с помощью ИИ</span>
        </Button>
      </section>
    </Page>
  );
};

export default ChoosePage;
