'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/authStore';
import { Page } from '@/components/Page';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const evaluationOptions = [
  { label: 'Идеальное (Как новый)', description: 'Телефон в идеальном состоянии, без царапин и следов использования. Все функции работают.', percentage: 0 },
  { label: 'Отличное', description: 'Минимальные следы использования, почти незаметные царапины. Все функции работают.', percentage: 5 },
  { label: 'Очень хорошее', description: 'Небольшие, но заметные царапины на корпусе или экране. Все функции работают.', percentage: 10 },
  { label: 'Хорошее', description: 'Заметные царапины, возможно небольшие сколы на корпусе. Экран без трещин. Все функции работают.', percentage: 15 },
  { label: 'Удовлетворительное', description: 'Множественные царапины и/или сколы. Возможны небольшие трещины на задней панели. Экран целый. Все функции работают.', percentage: 25 },
  { label: 'Проблемное', description: 'Есть проблемы с одной из функций (например, Face ID, Touch ID, камера) ИЛИ есть трещины на экране.', percentage: 40 },
  { label: 'Плохое', description: 'Множественные проблемы с функциями И/ИЛИ серьезные повреждения (разбитый экран и задняя панель).', percentage: 60 },
  { label: 'Нерабочее', description: 'Телефон не включается или не функционирует.', percentage: 80 },
];

export default function EvaluationPage() {
  const router = useRouter();
  const { telegramId, setUserEvaluation, setDamagePercent } = useAppStore();
  const [submitting, setSubmitting] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('userEvaluation');
      if (saved) setSelectedLabel(saved);
    }
  }, []);

  const handleSelectOption = async (option: typeof evaluationOptions[0]) => {
    setSubmitting(true);
    setUserEvaluation(option.label);
    setDamagePercent(option.percentage);
    setSelectedLabel(option.label);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('userEvaluation', option.label);
      sessionStorage.setItem('damagePercent', String(option.percentage));
    }

    try {
      await fetch('/api/request/save-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId,
          userEvaluation: option.label,
          damagePercent: option.percentage,
        }),
      });
    } catch (error) {
      console.error('Error saving evaluation:', error);
    } finally {
      router.push('/request/submit');
    }
  };

  return (
    <Page back={true}>
      <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 flex flex-col pt-24">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Оценка состояния</h2>
          <p className="text-sm text-gray-600">Как бы вы оценили состояние вашего телефона?</p>
        </div>
        <div className="flex-1 p-2 pt-2 flex flex-col items-center gap-2 overflow-y-auto">
          {evaluationOptions.map((option, index) => (
            <motion.div
              key={option.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="w-full max-w-md"
            >
              <Button
                variant={selectedLabel === option.label ? 'default' : 'outline'}
                className={`w-full h-auto p-2 text-left flex flex-col items-start ${selectedLabel === option.label ? 'bg-[#2dc2c6] text-white hover:bg-[#25a8ac] border-transparent' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                onClick={() => handleSelectOption(option)}
                disabled={submitting}
              >
                <p className={`font-semibold text-sm ${selectedLabel === option.label ? 'text-white' : 'text-gray-900'}`}>{option.label}</p>
                <p className={`text-xs ${selectedLabel === option.label ? 'text-white/90' : 'text-gray-600'} text-wrap`}>{option.description}</p>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </Page>
  );
}
