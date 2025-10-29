'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bot, DollarSign, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatPanel } from '@/components/ChatPanel';
import { useAppStore } from '@/stores/authStore';
import { Page } from '@/components/Page';
import { ModeCard } from '@/components/evaluation/ModeCard';
import { SectionHeader } from '@/components/evaluation/SectionHeader';

/**
 * Evaluation Mode Page — единый экран без свайпов
 * Apple/Telegram Mini App стиль: чисто, понятно, крупные цели.
 */

const SECTIONS = {
  'ai-evaluation': {
    title: 'ИИ Оценка',
    subtitle: 'Автоматическая оценка по фото',
    accent: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  'ai-buyout': {
    title: 'ИИ Скупка',
    subtitle: 'Быстрая скупка устройства',
    accent: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  'repair': {
    title: 'Ремонт',
    subtitle: 'Пошаговая оценка для ремонта',
    accent: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
  },
} as const;

export default function EvaluationModePage() {
  const router = useRouter();
  const { setCurrentStep, telegramId, username } = useAppStore();

  const [isLoading, setIsLoading] = useState<null | 'ai-evaluation' | 'ai-buyout' | 'repair'>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [loadingText, setLoadingText] = useState<string>('');
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);

  // Инициализация заявки
  useEffect(() => {
    const createInitialRequest = async () => {
      if (!telegramId) return;

      try {
        const response = await fetch('/api/request/saveDraft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegramId,
            username: username || telegramId,
            currentStep: 'evaluation-mode',
          }),
        });

        if (response.ok) {
          console.log('✅ Initial request created for evaluation-mode');
        }
      } catch (error) {
        console.error('❌ Error creating initial request:', error);
      } finally {}
    };

    createInitialRequest();
  }, [telegramId, username]);

  // Перехват системной кнопки браузера "назад" → на главную (секция Выбор)
  useEffect(() => {
    const handlePopState = () => {
      window.location.replace('/?section=choice');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Навигация клавишами (ПК): ArrowDown → к секции Выбор
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e as any).isComposing) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        window.location.href = '/?section=choice';
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Свайп вниз → к секции Выбор
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };
  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const dx = touchStartRef.current.x - touchEndRef.current.x;
    const dy = touchStartRef.current.y - touchEndRef.current.y;
    const min = 40;
    const vertical = Math.abs(dy) > Math.abs(dx);
    if (vertical && Math.abs(dy) > min) {
      if (dy < 0) {
        // свайп вниз
        window.location.href = '/?section=choice';
      }
    }
    touchStartRef.current = null; touchEndRef.current = null;
  };

  const handleBack = () => {
    window.location.href = '/?section=choice';
  };

  const handleAction = async (mode: 'ai-evaluation' | 'ai-buyout' | 'repair') => {
    setIsLoading(mode);
    if (mode === 'ai-evaluation') setLoadingText('Производится оценка...');
    if (mode === 'ai-buyout') setLoadingText('Производится скупка...');
    if (mode === 'repair') setLoadingText('Выбирается степень поломки...');

    setCurrentStep('delivery-options');
    setTimeout(() => {
      router.push('/request/delivery-options');
    }, 1200);
  };

  // Нет блокирующей инициализации — черновик сохраняется в фоне

  return (
    <Page back={handleBack}>
      <div className="min-h-[100dvh] bg-white" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <SectionHeader title="Выберите режим" subtitle="Все на одном экране. Быстро и просто." />

        <div className="px-5 sm:px-6 pb-8">
          <div className="mx-auto max-w-md space-y-4">
            <ModeCard
              title={SECTIONS['ai-evaluation'].title}
              subtitle={SECTIONS['ai-evaluation'].subtitle}
              accentClassName={SECTIONS['ai-evaluation'].accent}
              icon={<Bot className={`h-6 w-6 ${SECTIONS['ai-evaluation'].iconColor}`} />}
            >
              <div className="space-y-4">
                <ChatPanel />
                <Button
                  onClick={() => handleAction('ai-evaluation')}
                  disabled={!!isLoading}
                  className="h-11 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  {isLoading === 'ai-evaluation' ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {loadingText || 'Производится оценка...'}
                    </span>
                  ) : (
                    'Начать оценку'
                  )}
                </Button>
              </div>
            </ModeCard>

            <ModeCard
              title={SECTIONS['ai-buyout'].title}
              subtitle={SECTIONS['ai-buyout'].subtitle}
              accentClassName={SECTIONS['ai-buyout'].accent}
              icon={<DollarSign className={`h-6 w-6 ${SECTIONS['ai-buyout'].iconColor}`} />}
            >
              <div className="space-y-4">
                <Button
                  onClick={() => handleAction('ai-buyout')}
                  disabled={!!isLoading}
                  className="h-11 w-full rounded-xl bg-green-600 text-white hover:bg-green-700"
                >
                  {isLoading === 'ai-buyout' ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {loadingText || 'Производится скупка...'}
                    </span>
                  ) : (
                    'Начать скупку'
                  )}
                </Button>
              </div>
            </ModeCard>

            {/* Карточку "Ремонт" убрали по новой навигации (перемещено на главную влево) */}
          </div>
        </div>
      </div>
    </Page>
  );
}
