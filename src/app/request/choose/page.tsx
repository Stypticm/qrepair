'use client';

import { Page } from '@/components/Page';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const ChoosePage = () => {
  const router = useRouter();
  const { telegramId, username } = useStartForm();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
      <section className="w-full h-full flex flex-col gap-2 p-2">
        <h1 className="text-2xl font-extrabold uppercase text-black text-center leading-tight px-2">
          Выберите<br />способ<br />заполнения
        </h1>
        <section className="flex flex-col gap-4">
          <section className=' rounded-sm border-3 !border-slate-700'>
            <Image
              src={getPictureUrl('photo_manual.png') || '/photo_manual.png'}
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
            onClick={() => setIsOpen(true)}
          >
            <span className='text-2xl font-bold disabled'>Оценка с помощью ИИ</span>
          </Button>
        </section>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-[90%] max-h-[90%] p-4 flex flex-col items-center" aria-describedby={undefined}>
            <DialogTitle className="text-lg text-black font-bold mb-2">Не работает же, очевидно</DialogTitle>
            <Image
              src={getPictureUrl('banan.gif') || '/banan.gif'}
              alt="Banan"
              width={400}
              height={300}
              className="w-16 h-16 rounded-full"
            />
          </DialogContent>
        </Dialog>
      </section>
    </Page>
  );
};

export default ChoosePage;
