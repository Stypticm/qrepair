'use client';

import FooterButton from '@/components/FooterButton/FooterButton';
import { Page } from '@/components/Page';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { SuccessPopup } from '@/components/SuccessPopup/SuccessPopup';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { getPictureUrl } from '@/core/lib/assets';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const deviceCatalog= {
  'Apple Iphone 13': { name: 'Apple Iphone 13', basePrice: 48000 },
  'Apple Iphone 13 Pro': { name: 'Apple Iphone 13 Pro', basePrice: 56000 },
  'Apple Iphone 13 Pro Max': { name: 'Apple Iphone 13 Pro Max', basePrice: 64000 },
  'Apple Iphone 14': { name: 'Apple Iphone 14', basePrice: 56000 },
  'Apple Iphone 14 Pro': { name: 'Apple Iphone 14 Pro', basePrice: 72000 },
  'Apple Iphone 14 Pro Max': { name: 'Apple Iphone 14 Pro Max', basePrice: 80000 },
} as const;

const BrandPage = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showPhotoSuccess, setShowPhotoSuccess] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const {
    telegramId,
    modelname,
    imei,
    photoUrls,
    showQuestionsSuccess,
    price,
    setModel,
    setImei,
    setPhotoUrls,
    setPrice,
    setShowQuestionsSuccess
  } = useStartForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!telegramId) return;
    const controller = new AbortController();
    (async () => {
      const res = await fetch(`/api/request/form?telegramId=${telegramId}`, { signal: controller.signal })
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.draft) {
        setModel(data.draft.modelname)
        setPhotoUrls(data.draft.photoUrls);
        setPrice(data.draft.price);
        setShowQuestionsSuccess(Boolean(data.draft.questionsAnswered));
        if (data.draft.imei) setImei(data.draft.imei)
      }
    })();
    return () => controller.abort();
  }, [telegramId, setModel, setPhotoUrls, setPrice, setShowQuestionsSuccess]);

  // Prefetch questions data and block the button until loaded
  useEffect(() => {
    if (!telegramId) return;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/api/questions?telegramId=${telegramId}`, { signal: controller.signal })
        // Regardless of result, we consider loading finished
        await res.text().catch(() => {})
      } catch (_) {
        // ignore
      } finally {
        setQuestionsLoading(false);
      }
    })();
    return () => controller.abort();
  }, [telegramId]);

  const firstPhoto = photoUrls.find(Boolean) as string | undefined;
  const isPhotoAdded = photoUrls.some(Boolean);
  const isValid = !!modelname && isPhotoAdded && showQuestionsSuccess;

  const handleNext = async () => {
    if (submitting) return;
    setSubmitting(true);
    const payload = {
      telegramId,
      modelname,
      price,
      imei,
    };
    try {
      const saveResponse = await fetch('/api/request/form', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save form');
      }

      setShowPhotoSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferToQuestions = () => {
    router.push('/request/questions');
  }

  const handleModelChange = async (value: string) => {
    setModel(value);
    if (!telegramId) return;

    await fetch('/api/request/model', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramId, modelname: value }),
    });
  };

  return (
    <Page back={true}>
      <section className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold uppercase text-black tracking-tight mb-2 text-center">
          Отправка заявки
        </h2>
        <div>
          <Label htmlFor="brand" className="text-black text-2xl font-bold">
            Выбор модели
          </Label>
          <Select value={modelname ?? ''} onValueChange={handleModelChange}>
            <SelectTrigger className="w-full !border-slate-700 border-3">
              <SelectValue placeholder="Выберите модель" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup className='text-black'>
                {
                  Object.entries(deviceCatalog).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      <span className='text-black font-bold'>{value.name}</span>
                    </SelectItem>
                  ))
                }

              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="condition" className="text-black text-2xl font-bold">
            Состояние
          </Label>
          <Button onClick={handleTransferToQuestions} disabled={questionsLoading}>
            <span className="font-bold">Ответить на вопросы</span>
          </Button>
          {showQuestionsSuccess && (
            <Badge variant="secondary" className="bg-green-600 text-center">
              Вы ответили на все вопросы
            </Badge>
          )}
        </div>
        <div>
          <Label htmlFor="photos_and_video" className="text-black text-2xl font-bold">
            Фотографии и видео
          </Label>
          <section className="flex flex-row gap-1 justify-center items-end">
            <section className="flex flex-col gap-1">
              <Image
                src={getPictureUrl('photo_phone.png') || '/photo_phone.png'}
                alt="Картинка телефона"
                width={150}
                height={150}
                className="object-cover rounded-lg"
                onClick={() => router.push('/request/photos')}
              />
              {isPhotoAdded && (
                <Badge variant="secondary" className='bg-green-600'>Добавлено</Badge>
              )}
            </section>
            <Image
              src={getPictureUrl('video_phone.png') || '/video_phone.png'}
              alt="Видео телефона"
              width={150}
              height={150}
              className="object-cover rounded-lg blur-xs"
              onClick={() => setIsOpen(true)}
            />
          </section>
        </div>

        <div>
          <Label htmlFor="imei" className="text-black text-2xl font-bold mb-2">
            IMEI (не обязательно)
          </Label>
          <input
            id="imei"
            value={imei || ''}
            onChange={(e) => setImei(e.target.value)}
            placeholder="Введите IMEI"
            className="w-full rounded px-2 py-2 text-black !border-slate-700 border-3"
          />
        </div>
      </section>
      <FooterButton isNextDisabled={isValid && !submitting} onNext={handleNext} preventRedirect={true} />
      <section className="h-full">
        {showPhotoSuccess && (
          <SuccessPopup
            text="Ваш заявка принята"
            phoneModel={modelname}
            phoneImage={(firstPhoto as string) || '/photo_phone.png'}
            basePrice={deviceCatalog[modelname as keyof typeof deviceCatalog]?.basePrice ?? 0}
            finalPrice={price as number}
            redirectTo="/"
            onClose={() => setShowPhotoSuccess(false)}
          />
        )}
      </section>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="p-4 flex flex-col items-center">
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
    </Page>
  );
};

export default BrandPage;
