'use client';

import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Button } from '@/components/ui/button';
import { List } from '@telegram-apps/telegram-ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ChoosePage = () => {
  const router = useRouter();
  const { telegramId, username } = useStartForm();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);

    await fetch('/api/repair/choose', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegramId,
        username,
      }),
    });

    router.push('/repair/brand');
  };

  return (
    <List>
        <Button
          className="bg-slate-700 w-full h-full py-8 rounded-xl"
          onClick={handleStart}
          disabled={loading}
        >
          <span className="text-slate-100 text-3xl font-bold">Заполнить в ручную</span>
        </Button>
        <Button className="bg-slate-700 w-full h-full py-8 rounded-xl disabled">
          <span className="text-slate-100 text-3xl font-bold blur-xs">Оценка с помощью ИИ</span>
        </Button>
    </List>
  );
};

export default ChoosePage;
