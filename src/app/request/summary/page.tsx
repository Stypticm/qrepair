'use client';

import FooterButton from '@/components/FooterButton/FooterButton';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { SkupkaRequest } from '@/core/lib/interfaces';
import { List } from '@telegram-apps/telegram-ui';
import React, { useEffect, useState } from 'react';

const SummaryPage = () => {
  const { telegramId } = useStartForm();
  const [data, setData] = useState<SkupkaRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [webhookSecret, setWebhookSecret] = useState<string>('');

  useEffect(() => {
    const fetchSummary = async () => {
      if (!telegramId) return;

      try {
        const res = await fetch(`/api/request/summary?telegramId=${telegramId}`);
        if (res.ok) {
          const json = await res.json();
          console.log(json);
          setData(json);
          setLoading(false);
        }
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchWebhookSecret = async () => {
      try {
        const res = await fetch('/api/telegram/secret');
        if (res.ok) {
          const { secret } = await res.json();
          setWebhookSecret(secret);
        }
      } catch (error) {
        console.error('Ошибка при получении секретного токена:', error);
      }
    };

    fetchSummary();
    fetchWebhookSecret();
  }, [telegramId]);

  const handleNext = async () => {
    if (!telegramId) return;

    try {
      const submitResponse = await fetch('/api/request/summary', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId }),
      });

      if (!submitResponse.ok) {
        throw new Error('Failed to submit repair request');
      }

      const statusResponse = await fetch('/api/telegram/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Bot-Api-Secret-Token': webhookSecret,
        },
        body: JSON.stringify({
          callback_query: {
            from: { id: telegramId },
            data: 'check_status',
          },
        }),
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to send status command');
      }
    } catch (error) {
      console.error('Ошибка при отправке:', error);
    }
  };

  if (loading) return <p className="text-center mt-8">Загрузка...</p>;
  if (!data) return <p className="text-center mt-8 text-red-500">Заявка не найдена</p>;

  return (
    <List>
      <main className="p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center">Ваша заявка</h2>

        {/* <section>

          <strong>Бренд:</strong>{' '}
          {data.brandname && data.modelname
            ? `${data.brandname} ${data.modelname}`
            : data.brandModelText}
        </section>
        <section className="flex flex-row gap-2">
          <strong>Фото:</strong>
          {!data.photoUrls || data.photoUrls.length === 0 ? (
            <p className="italic text-gray-500">Фото не прикреплены</p>
          ) : (
            <div className="flex gap-4">
              {data.photoUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  width={64}
                  height={64}
                  alt={`Фото ${i + 1}`}
                  className="max-h-24 rounded shadow"
                />
              ))}
            </div>
          )}
        </section>
        <section className="flex flex-row gap-2">
          <strong>Описание поломок:</strong>
          {(Array.isArray(data.crash) ? data.crash : [data.crash])
            .map((value) => {
              const found = crashOptions.find((option) => option.value === value);
              return found ? found.label : value;
            })
            .join(', ')}
        </section> */}

        <FooterButton onNext={handleNext} nextPath="/" isNextDisabled={false} />
      </main>
    </List>
  );
};

export default SummaryPage;
