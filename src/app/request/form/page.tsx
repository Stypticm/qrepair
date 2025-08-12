'use client';
export const dynamic = 'force-dynamic';

import FooterButton from '@/components/FooterButton/FooterButton';
import { Page } from '@/components/Page';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { SuccessPopup } from '@/components/SuccessPopup/SuccessPopup';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const models = [
  { id: '1', name: 'Apple Iphone 13' },
  { id: '2', name: 'Apple Iphone 13 Pro' },
  { id: '3', name: 'Apple Iphone 13 Pro Max' },
  { id: '4', name: 'Apple Iphone 14' },
  { id: '5', name: 'Apple Iphone 14 Pro' },
  { id: '6', name: 'Apple Iphone 14 Pro Max' },
]

const basePrices: Record<string, number> = {
  'Apple Iphone 13': 48000,
  'Apple Iphone 13 Pro': 56000,
  'Apple Iphone 13 Pro Max': 64000,
  'Apple Iphone 14': 56000,
  'Apple Iphone 14 Pro': 72000,
  'Apple Iphone 14 Pro Max': 80000,
};

const BrandPage = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showPhotoSuccess, setShowPhotoSuccess] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [showQuestionsSuccess, setShowQuestionsSuccess] = useState(true);
  const {
    telegramId,
    modelname,
    comment,
    photoUrls,
    answers,
    price,
    setTelegramId,
    setModel,
    setComment,
    setPhotoUrls,
    setPrice,
  } = useStartForm();
  const [webhookSecret, setWebhookSecret] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`/api/request/form?telegramId=${telegramId}`)
        if (!res.ok) {
          console.error("Fetch error:", res.status, await res.text());
          return;
        }
        const data = await res.json();
        if (data && data.draft) {
          setModel(data.draft.modelname)
          setPhotoUrls(data.draft.photoUrls);
        }
      } catch (e) {
        console.error(e)
      }
    }
    if (telegramId === null) {
      setTelegramId('1');
      getData();
    } else {
      getData();
    }
  }, [telegramId, setTelegramId, setModel, setPhotoUrls]);

  useEffect(() => {
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
    fetchWebhookSecret();
  }, [telegramId]);

  const isPhotoAdded = photoUrls.some((url) => url !== null);
  const isValid = !!modelname && isPhotoAdded && showQuestionsSuccess;

  const calculatePrice = () => {
    const basePrice = basePrices[modelname] || 0;
    const discountPercentage = answers.reduce((sum, val) => sum + val, 0) * 5; // 5% за каждый "Да"
    let finalPrice = basePrice * (1 - discountPercentage / 100);
    return Math.floor(finalPrice / 100) * 100;
  };

  const handleNext = async () => {
    const calculatedPrice = calculatePrice();
    setPrice(calculatedPrice);

    const payload = {
      telegramId,
      modelname,
      price: calculatedPrice,
    };

    await fetch('/api/request/form', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

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

    setShowPhotoSuccess(true);
  };

  const handleCommentDialogOpen = () => {
    setIsCommentDialogOpen(true);
  };

  const handleCommentSave = (value: string) => {
    setComment(value);
    setIsCommentDialogOpen(false);
  };

  const handleCommentCancel = () => {
    setIsCommentDialogOpen(false);
  };

  const handleTransferToQuestions = () => {
    router.push('/request/questions');
    // setShowQuestionsSuccess(true);
  }

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
          <Select defaultValue={modelname} onValueChange={setModel}>
            <SelectTrigger className="w-full !border-slate-700 border-3">
              <SelectValue placeholder="Выберите модель" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup className='text-black'>
                {
                  models.map((model) => (
                    <SelectItem key={model.id} value={model.name}>
                      <span className='text-black font-bold'>{model.name}</span>
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
          <Button onClick={handleTransferToQuestions}>
            <span className="font-bold">Ответить на вопросы</span>
          </Button>
          {showQuestionsSuccess && (
            <Badge variant="secondary" className="bg-green-600 text-center">
              Идеальное состояние
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
                src="/photo_phone.png"
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
              src="/video_phone.png"
              alt="Видео телефона"
              width={150}
              height={150}
              className="object-cover rounded-lg blur-xs"
              onClick={() => setIsOpen(true)}
            />
          </section>
        </div>

        <div>
          <Label htmlFor="comment" className="text-black text-2xl font-bold mb-2">
            Комментарии (Не обязательно)
          </Label>
          <Textarea
            ref={textareaRef}
            value={comment || ''}
            readOnly
            onClick={handleCommentDialogOpen}
            placeholder="Нажмите для ввода комментария"
            className="!border-slate-700 border-3 text-black font-bold h-24"
          />
          <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
            <DialogContent className="p-4 flex flex-col items-center top-0 transform translate-y-0 fixed w-full max-w-md rounded-b-none" aria-describedby='modal-description'>
              <DialogTitle className="text-lg text-black font-bold mb-2">Введите комментарий</DialogTitle>
              <Textarea
                ref={textareaRef}
                value={comment || ''}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ваш комментарий"
                className="!border-slate-700 border-3 text-black font-bold h-40"
              />
              <DialogFooter className="mt-4 flex flex-row gap-2">
                <Button onClick={() => handleCommentSave(comment || '')}>OK</Button>
                <Button variant="outline" onClick={handleCommentCancel}>Отмена</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>
      <FooterButton isNextDisabled={isValid} onNext={handleNext} preventRedirect={true} />
      {showPhotoSuccess && (
        <SuccessPopup
          text="Ваш заявка принята"
          phoneModel={modelname}
          phoneImage={photoUrls[0] as string}
          redirectTo="/"
          priceNewPhone={basePrices[modelname]}
          onClose={() => setShowPhotoSuccess(false)}
        />
      )}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="p-4 flex flex-col items-center" aria-describedby={undefined}>
          <DialogTitle className="text-lg text-black font-bold mb-2">Не работает же, очевидно</DialogTitle>
          <Image
            src="/banan.gif"
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
