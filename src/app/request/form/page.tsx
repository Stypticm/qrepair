'use client';

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
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const {
    telegramId,
    modelname,
    comment,
    photoUrls,
    showQuestionsSuccess,
    price,
    setModel,
    setComment,
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
      }
    })();
    return () => controller.abort();
  }, [telegramId, setModel, setPhotoUrls, setPrice, setShowQuestionsSuccess]);

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
          <Button onClick={handleTransferToQuestions}>
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
            value={comment || ''}
            readOnly
            onClick={handleCommentDialogOpen}
            placeholder="Нажмите для ввода комментария"
            className="!border-slate-700 border-3 text-black font-bold h-24"
          />
          <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
            <DialogContent className="p-4 flex flex-col items-center top-0 transform translate-y-0 fixed w-full max-w-md rounded-b-none">
              <DialogTitle className="text-lg text-black font-bold mb-2">Введите комментарий</DialogTitle>
              <Textarea
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
