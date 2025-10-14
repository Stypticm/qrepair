'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import { Page } from '@/components/Page';
import { Button } from '@/components/ui/button';
import { getPictureUrl } from '@/core/lib/assets';
import { useAppStore } from '@/stores/authStore';

type EvaluationOption = {
  id: string;
  label: string;
  description: string;
  percentage: number;
  image: string;
  accent: 'mint' | 'sea' | 'amber' | 'rose';
};

const evaluationOptions: EvaluationOption[] = [
  {
    id: 'perfect',
    label: 'Идеальное (как новое)',
    description:
      'Корпус и дисплей без следов использования, полностью как из коробки. Все функции работают безупречно.',
    percentage: 0,
    image: 'display_front_new',
    accent: 'mint',
  },
  {
    id: 'light-wear',
    label: 'Отличное',
    description:
      'Минимальные следы эксплуатации: едва заметные микроцарапины. Все функции работают штатно.',
    percentage: 5,
    image: 'display_front',
    accent: 'mint',
  },
  {
    id: 'moderate',
    label: 'Очень хорошее',
    description:
      'Есть лёгкие потертости или пара царапин по корпусу, при этом технически всё исправно.',
    percentage: 10,
    image: 'display_front',
    accent: 'sea',
  },
  {
    id: 'visible-wear',
    label: 'Хорошее',
    description:
      'Заметные следы износа: локальные царапины или сколы на корпусе, экран целый. Работает стабильно.',
    percentage: 15,
    image: 'display_front_have_scratches',
    accent: 'sea',
  },
  {
    id: 'heavy-wear',
    label: 'Удовлетворительное',
    description:
      'Множественные царапины или сколы. Возможны потертости на рамке и задней панели, но без трещин дисплея.',
    percentage: 25,
    image: 'display_front_scratches',
    accent: 'amber',
  },
  {
    id: 'feature-failure',
    label: 'Проблемы с функциями',
    description:
      'Не работает одна из ключевых функций (Face ID, Touch ID, камера, кнопки) или есть трещина на экране.',
    percentage: 40,
    image: 'display_back_have_scratches',
    accent: 'amber',
  },
  {
    id: 'needs-repair',
    label: 'Требуется ремонт',
    description:
      'Есть несколько неисправностей или серьёзные повреждения корпуса, потребуется замена деталей.',
    percentage: 60,
    image: 'display_back_scratches',
    accent: 'rose',
  },
  {
    id: 'not-working',
    label: 'Не включается',
    description:
      'Устройство не запускается или не реагирует на зарядку, необходима полная диагностика и восстановление.',
    percentage: 80,
    image: 'display_front_scratches',
    accent: 'rose',
  },
];

const accentGradient: Record<EvaluationOption['accent'], string> = {
  mint: 'from-emerald-200/60 via-teal-200/40 to-slate-50/40',
  sea: 'from-cyan-200/60 via-sky-200/40 to-slate-50/40',
  amber: 'from-amber-200/60 via-orange-200/40 to-slate-50/40',
  rose: 'from-rose-200/60 via-pink-200/40 to-slate-50/40',
};

export default function EvaluationPage() {
  const router = useRouter();
  const { telegramId, setUserEvaluation, setDamagePercent, price, setPrice } = useAppStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [basePrice, setBasePrice] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleOptionSelect = useCallback((option: EvaluationOption) => {
    setSelectedId((previous) => {
      if (previous === option.id) {
        return previous;
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('userEvaluationId', option.id);
        sessionStorage.setItem('userEvaluation', option.label);
        sessionStorage.setItem('damagePercent', String(option.percentage));
      }

      return option.id;
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let hasSelection = false;
    const savedId = sessionStorage.getItem('userEvaluationId');
    const savedLabel = sessionStorage.getItem('userEvaluation');

    if (savedId) {
      const exists = evaluationOptions.some((option) => option.id === savedId);
      if (exists) {
        setSelectedId(savedId);
        hasSelection = true;
      }
    } else if (savedLabel) {
      const matched = evaluationOptions.find((option) => option.label === savedLabel);
      if (matched) {
        setSelectedId(matched.id);
        hasSelection = true;
      }
    }

    if (!hasSelection) {
      handleOptionSelect(evaluationOptions[0]);
    }

    const storedBase = sessionStorage.getItem('basePrice');
    if (storedBase) {
      const parsed = Number(storedBase);
      if (!Number.isNaN(parsed)) {
        setBasePrice(parsed);
      }
    }
  }, [handleOptionSelect]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    sectionRefs.current = sectionRefs.current.slice(0, evaluationOptions.length);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          const index = Number(visible.target.getAttribute('data-index') || 0);
          const option = evaluationOptions[index];
          if (option) {
            handleOptionSelect(option);
          }
        }
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: '-20% 0px -30% 0px' }
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [handleOptionSelect]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  const selectedOption = useMemo(() => {
    return evaluationOptions.find((option) => option.id === selectedId) ?? evaluationOptions[0];
  }, [selectedId]);

  const heroImage = getPictureUrl(`${selectedOption.image}.png`);

  const estimatedPrice = useMemo(() => {
    const source = basePrice ?? price;
    if (!source) return null;

    const discount = selectedOption.percentage / 100;
    const result = Math.max(source * (1 - discount), source * 0.5);

    return Math.round(result);
  }, [basePrice, price, selectedOption]);

  useEffect(() => {
    if (estimatedPrice && estimatedPrice > 0) {
      setPrice(estimatedPrice);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('price', JSON.stringify(estimatedPrice));
      }
    }
  }, [estimatedPrice, setPrice]);

  const handleContinue = async () => {
    if (!selectedOption) return;

    setSubmitting(true);
    setUserEvaluation(selectedOption.label);
    setDamagePercent(selectedOption.percentage);

    try {
      await fetch('/api/request/save-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId,
          userEvaluation: selectedOption.label,
          damagePercent: selectedOption.percentage,
        }),
      });
    } catch (error) {
      console.error('Error saving evaluation:', error);
    } finally {
      setSubmitting(false);
      router.push('/request/submit');
    }
  };

  return (
    <Page back={true}>
      <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="mx-auto flex max-w-4xl flex-col px-4 pb-28 pt-10 md:px-8">
          <div className="sticky top-8 z-20">
            <motion.div
              key={selectedOption.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_40px_90px_-50px_rgba(15,23,42,0.45)] backdrop-blur"
            >
              <div className="flex flex-col gap-6 text-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Сводка</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">
                    {selectedOption.label}
                  </h2>
                  <p className="mt-3 text-sm text-slate-500 md:text-base">
                    {selectedOption.description}
                  </p>
                  <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-400/80">
                    Прокрутите страницу, чтобы выбрать состояние
                  </p>
                </div>

                <div
                  className={`relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-b ${accentGradient[selectedOption.accent]} p-5 shadow-inner md:p-6`}
                >
                  <div className="relative mx-auto aspect-[9/16] w-full max-w-[220px] overflow-hidden rounded-[24px] border border-white/40 bg-white/60 md:max-w-[240px]">
                    <Image
                      src={heroImage}
                      alt={selectedOption.label}
                      width={320}
                      height={560}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>

                <div className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-900">-{selectedOption.percentage}%</span>
                  <span className="mx-2 text-slate-400">/</span>
                  {estimatedPrice ? (
                    <span className="font-semibold text-slate-900">
                      ≈ {estimatedPrice.toLocaleString('ru-RU')} ₽
                    </span>
                  ) : (
                    <span className="text-slate-400">оценка уточняется</span>
                  )}
                </div>

                <div className="mt-auto flex justify-center">
                  <Button
                    type="button"
                    disabled={!selectedOption || submitting}
                    onClick={handleContinue}
                    className="h-12 rounded-full bg-slate-900 px-10 text-sm font-semibold text-white shadow-[0_24px_60px_-25px_rgba(15,23,42,0.65)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    Продолжить
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="relative w-full">
            {evaluationOptions.map((option, index) => (
              <div
                key={option.id}
                data-index={index}
                ref={(el) => { sectionRefs.current[index] = el; }}
                className="pointer-events-none select-none"
                style={{ height: '120vh' }}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
}
