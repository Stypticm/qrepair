'use client';
export const dynamic = 'force-dynamic';


import FooterButton from '@/components/FooterButton/FooterButton';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';
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
import { List } from '@telegram-apps/telegram-ui';

const BrandPage = () => {
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
    <List>
      <main className="h-full flex flex-col justify-between">
        <section className="flex flex-col gap-8">
          <h2 className="text-slate-700 text-3xl font-bold text-center">
            Выберите бренд и модель телефона
          </h2>
          <div>
            <Label htmlFor="brand" className="text-slate-700 text-xl font-bold">
              Выберите бренд
            </Label>
            <Select value={brandname || ''} onValueChange={setBrand}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Выберите бренд" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Apple">Apple</SelectItem>
                  <SelectItem value="Samsung">Samsung</SelectItem>
                  <SelectItem value="Xiaomi">Xiaomi</SelectItem>
                  <SelectItem value="Motorola">Motorola</SelectItem>
                  <SelectItem value="Huawei">Huawei</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="model" className="text-slate-700 text-xl font-bold">
              Модель телефона
            </Label>
            <Textarea
              value={modelname}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Введите модель телефона..."
            />
          </div>
          <div>
            <Label htmlFor="brand_model" className="text-slate-700 text-xl font-bold">
              Введите бренд и модель
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
              placeholder="Если в списке не нашли бренд и модель, то напишите его здесь..."
            />
          </div>
        </section>
        <FooterButton nextPath="/repair/crash" isNextDisabled={isValid} onNext={handleNext} />
      </main>
    </List>
  );
};

export default BrandPage;
