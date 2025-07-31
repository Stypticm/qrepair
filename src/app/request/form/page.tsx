'use client';
export const dynamic = 'force-dynamic';


import FooterButton from '@/components/FooterButton/FooterButton';
import { Page } from '@/components/Page';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const BrandPage = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const {
    telegramId,
    brandname,
    modelname,
    brandModelText,
    setBrand,
    setModel,
    setBrandModelText,
  } = useStartForm();

  const isValid = (brandname && modelname.trim().length > 0) || brandModelText.trim().length > 0;

  const handleNext = async () => {
    const payload =
      brandModelText.trim().length > 0
        ? { telegramId, brandModelText: brandModelText.trim() }
        : { telegramId, brandname, modelname };

    await fetch('/api/repair/brand', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  };

  return (
    <Page back={true}>
      <main className="h-full flex flex-col justify-between">
        <section className="flex flex-col gap-2">
          <h2 className="text-3xl font-extrabold uppercase text-black tracking-tight mb-2 text-center">
            Отправка заявки
          </h2>
          <div>
            <Label htmlFor="brand" className="text-black text-2xl font-bold">
              Выбор модели
            </Label>
            <Select defaultValue="Apple iPhone 11" onValueChange={setBrand}>
              <SelectTrigger className="w-full !border-slate-700 border-3">
                <SelectValue placeholder="Выберите модель" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup className='text-black'>
                  <SelectItem value="Apple iPhone 11">
                    <span className='text-black font-bold text-xl'>Apple iPhone 11</span>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="condition" className="text-black text-2xl font-bold">
              Состояние
            </Label>
            <div className="flex items-center gap-3">
              <Checkbox id="display" className='flex justify-center items-center !border-slate-700 border-3' />
              <Label htmlFor="terms" className="text-black text-xl font-bold" >Дисплей битый, но работает</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="body" className='flex justify-center items-center !border-slate-700 border-3' />
              <Label htmlFor="terms" className="text-black text-xl font-bold">Корпус целый</Label>
            </div>
          </div>
          <div>
            <Label htmlFor="photos_and_video" className="text-black text-2xl font-bold">
              Фотографии и видео
            </Label>
            <section className="flex flex-row gap-1 justify-center items-end">
              <Image
                src="/photo_phone.png"
                alt="Картинка телефона"
                width={150}
                height={150}
                className="h-full w-full object-cover rounded-lg"
                onClick={() => router.push('/request/photos')}
              />
              <Image
                src="/video_phone.png"
                alt="Видео телефона"
                width={150}
                height={150}
                className="h-full w-full object-cover rounded-lg blur-xs"
                onClick={() => setIsOpen(true)}
              />
            </section>
          </div>

          <div>
            <Label htmlFor="photos_and_video" className="text-black text-2xl font-bold">
              Комментарии (Не обязательно)
            </Label>
            <Textarea
              value={brandModelText}
              onChange={(e) => {
                const value = e.target.value;
                setBrandModelText(value);

                if (value.trim().length > 0) {
                  setBrand(null);
                  setModel('');
                }
              }}
              placeholder="Ваш комментарий"
              className='!border-slate-700 border-3'
            />
          </div>
        </section>
        <section className="mt-2">
          <Button className="w-full bg-green-700 text-2xl font-bold text-black ">Оценить состояние</Button>
        </section>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-[90%] max-h-[90%] p-4 flex flex-col items-center" aria-describedby={undefined}>
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
        {/* <FooterButton nextPath="/repair/crash" isNextDisabled={isValid} onNext={handleNext} /> */}
      </main>
    </Page>
  );
};

export default BrandPage;
