'use client';
export const dynamic = 'force-dynamic';


import FooterButton from '@/components/FooterButton/FooterButton';
import { Page } from '@/components/Page';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

const BrandPage = () => {
  const router = useRouter();
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
              <SelectTrigger className="w-full">
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
              <Checkbox id="display" />
              <Label htmlFor="terms" className="text-black text-xl font-bold" >Дисплей битый, но работает</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="body" />
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
                className="h-full w-full object-cover rounded-lg"
                onClick={() => {}}
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
            />
          </div>
        </section>
        <Button className="w-full bg-green-700 text-2xl font-bold text-black">Оценить состояние</Button>
        {/* <FooterButton nextPath="/repair/crash" isNextDisabled={isValid} onNext={handleNext} /> */}
      </main>
    </Page>
  );
};

export default BrandPage;
