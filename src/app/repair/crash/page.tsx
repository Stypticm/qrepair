'use client';
export const dynamic = 'force-dynamic';

import FooterButton from '@/components/FooterButton/FooterButton';
import { useStartForm } from '@/components/StartFormContext/StartFormContext';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { crashOptions } from '@/core/lib/constants';
import { List } from '@telegram-apps/telegram-ui';

const CrashPage = () => {
  const { telegramId, crash, crashDescription, setCrash, setCrashDescription } = useStartForm();

  const isNextDisabled = crash?.length === 0 && crashDescription.trim().length === 0;

  const handleNext = async () => {
    const payload =
      crashDescription.trim().length > 0 ? { telegramId, crashDescription } : { telegramId, crash };

    await fetch('/api/repair/crash', {
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
        <section className="flex flex-col gap-2">
          <h2 className="text-slate-700 text-3xl font-bold text-center">Выберите вашу поломку</h2>
          <div>
            <Label htmlFor="brand" className="text-slate-700 text-xl font-bold">
              Выберите поломку
            </Label>
            {crashOptions.map((option) => {
              const isChecked = crash.includes(option.value);

              return (
                <Label
                  className="hover:bg-accent/50 flex items-start gap-3 mb-2 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
                  key={option.value}
                >
                  <Checkbox
                    id={option.value}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCrash([...(crash || []), option.value]);
                        setCrashDescription('');
                      } else {
                        setCrash(crash.filter((val: string) => val !== option.value));
                      }
                    }}
                    className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                  />
                  <p className="text-muted-foreground text-sm">{option.label}</p>
                </Label>
              );
            })}
          </div>
          <div>
            <Label htmlFor="brand_model" className="text-slate-700 text-xl font-bold">
              Опишите поломку
            </Label>
            <Textarea
              value={crashDescription}
              onChange={(e) => {
                const value = e.target.value;
                setCrashDescription(value);

                if (value.trim().length > 0) {
                  setCrash([]);
                }
              }}
              placeholder="Если в списке вы не нашли свою поломку, то опишите её здесь..."
            />
          </div>
        </section>
        <FooterButton
          nextPath="/repair/photos"
          isNextDisabled={!isNextDisabled}
          onNext={handleNext}
        />
      </main>
    </List>
  );
};

export default CrashPage;
