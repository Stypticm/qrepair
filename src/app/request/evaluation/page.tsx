"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Page } from "@/components/Page";
import { Button } from "@/components/ui/button";
import { getPictureUrl } from "@/core/lib/assets";
import { useAppStore } from "@/stores/authStore";
import { init, swipeBehavior } from '@telegram-apps/sdk';
import { Carousel_003 } from "@/components/v1/skiper49";
import { calculatePriceRange, DeviceConditions, AdditionalConditions } from "@/core/lib/priceCalculation";

type EvaluationOption = {
  id: string;
  label: string;
  description: string;
  percentage: number;
  image: string;
  accent: "mint" | "sea" | "amber" | "rose";
};

const evaluationOptions: EvaluationOption[] = [
  {
    id: "perfect",
    label: "Идеальное",
    description:
      "Корпус и дисплей без следов использования, полностью как из коробки. Всё работает безупречно.",
    percentage: 0,
    image: "display_front_new",
    accent: "mint",
  },
  {
    id: "light-wear",
    label: "Отличное",
    description:
      "Минимальные следы эксплуатации: едва заметные микроцарапины. Все функции работают штатно.",
    percentage: 5,
    image: "display_front",
    accent: "mint",
  },
  {
    id: "moderate",
    label: "Очень хорошее",
    description:
      "Есть лёгкие потертости или пара царапин по корпусу, при этом технически всё исправно.",
    percentage: 10,
    image: "display_front",
    accent: "sea",
  },
  {
    id: "visible-wear",
    label: "Хорошее",
    description:
      "Заметные следы износа: локальные царапины или сколы на корпусе, экран целый. Работает стабильно.",
    percentage: 15,
    image: "display_front_have_scratches",
    accent: "sea",
  },
  {
    id: "heavy-wear",
    label: "Удовлетворительное",
    description:
      "Множественные царапины или сколы. Возможны потертости на рамке и задней панели, но без трещин дисплея.",
    percentage: 25,
    image: "display_front_scratches",
    accent: "amber",
  },
  {
    id: "feature-failure",
    label: "Функции не работают",
    description:
      "Не работает одна из ключевых функций (Face ID, Touch ID, камера, кнопки) или есть трещина на экране.",
    percentage: 40,
    image: "display_back_have_scratches",
    accent: "amber",
  },
  {
    id: "needs-repair",
    label: "Требуется ремонт",
    description:
      "Есть несколько неисправностей или серьёзные повреждения корпуса, потребуется замена деталей.",
    percentage: 60,
    image: "display_back_scratches",
    accent: "rose",
  },
  {
    id: "not-working",
    label: "Не включается",
    description:
      "Устройство не запускается или не реагирует на зарядку, необходима полная диагностика и восстановление.",
    percentage: 80,
    image: "display_front_scratches",
    accent: "rose",
  },
];

const accentGradient: Record<EvaluationOption["accent"], string> = {
  mint: "from-emerald-200/60 via-teal-200/40 to-slate-50/40",
  sea: "from-cyan-200/60 via-sky-200/40 to-slate-50/40",
  amber: "from-amber-200/60 via-orange-200/40 to-slate-50/40",
  rose: "from-rose-200/60 via-pink-200/40 to-slate-50/40",
};

// Эти функции больше не используются - логика округления перенесена в priceCalculation.ts

const formatMoney = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);

export default function EvaluationPage() {
  const router = useRouter();
  const { telegramId, modelname, setUserEvaluation, setDamagePercent, price, setPrice, setCurrentStep } = useAppStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [basePrice, setBasePrice] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const wheelLockRef = useRef<boolean>(false);
  const lastWheelTsRef = useRef<number>(0);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const gestureAxisRef = useRef<'x' | 'y' | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Disable vertical swipes using Telegram Apps SDK swipe behavior (per docs)
  useEffect(() => {
    let destroy: (() => void) | undefined
    try {
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        init();
        const manager = swipeBehavior;
        try { manager?.mount?.(); } catch {}
        try {
          manager?.disableVertical?.();
          try { (window as any).Telegram.WebApp.expand(); } catch {}
          try { (window as any).Telegram.WebApp.enableClosingConfirmation(); } catch {}
          destroy = () => {
            try { manager?.enableVertical?.(); } catch {}
            try { manager?.unmount?.(); } catch {}
          }
        } catch {}
      }
    } catch {}
    // Hard UI fallback to reduce vertical gestures: constrain to horizontal pan on this page
    const prevTouchAction = document.body.style.touchAction
    const prevOverscrollY = (document.body.style as any).overscrollBehaviorY
    const prevHtmlOverscrollY = (document.documentElement.style as any).overscrollBehaviorY
    const prevOverflow = document.body.style.overflow
    const prevHeight = document.body.style.height
    document.body.style.touchAction = 'pan-x'
    ;(document.body.style as any).overscrollBehaviorY = 'contain'
    ;(document.documentElement.style as any).overscrollBehaviorY = 'contain'
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100dvh'
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        touchStartYRef.current = e.touches[0].clientY;
        touchStartXRef.current = e.touches[0].clientX;
      }
    }
    const onTouchMove = (e: TouchEvent) => {
      if (touchStartXRef.current == null) return;
      const dx = e.touches[0].clientX - touchStartXRef.current;
      const dy = e.touches[0].clientY - (touchStartYRef.current ?? e.touches[0].clientY);
      if (Math.abs(dy) > Math.abs(dx)) {
        // prevent vertical swipe-to-dismiss in Telegram shell
        e.preventDefault();
      }
    }
    document.addEventListener('touchstart', onTouchStart, { passive: false })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      try { destroy?.(); } catch {}
      document.body.style.touchAction = prevTouchAction
      ;(document.body.style as any).overscrollBehaviorY = prevOverscrollY
      ;(document.documentElement.style as any).overscrollBehaviorY = prevHtmlOverscrollY
      document.body.style.overflow = prevOverflow
      document.body.style.height = prevHeight
      document.removeEventListener('touchstart', onTouchStart as any)
      document.removeEventListener('touchmove', onTouchMove as any)
    };
  }, []);

  // Локальная блокировка вертикального свайпа поверх карусели
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    let sx: number | null = null;
    let sy: number | null = null;
    const onStart = (e: TouchEvent) => {
      if (!e.touches?.length) return;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    };
    const onMove = (e: TouchEvent) => {
      if (sx == null || sy == null) return;
      const dx = e.touches[0].clientX - sx;
      const dy = e.touches[0].clientY - sy;
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) {
        e.preventDefault();
      }
    };
    el.addEventListener('touchstart', onStart, { passive: false });
    el.addEventListener('touchmove', onMove, { passive: false });
    return () => {
      el.removeEventListener('touchstart', onStart as any);
      el.removeEventListener('touchmove', onMove as any);
    };
  }, []);

  // Ensure store knows we're on the evaluation step for correct back navigation
  useEffect(() => {
    try { setCurrentStep('evaluation'); sessionStorage.setItem('currentStep', 'evaluation'); } catch {}
  }, [setCurrentStep]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedBase = sessionStorage.getItem("basePrice");
    if (storedBase) {
      const parsed = Number(storedBase);
      if (!Number.isNaN(parsed)) {
        setBasePrice(parsed);
      }
    }

    const storedSelection = sessionStorage.getItem("userEvaluationId");
    if (storedSelection) {
      setSelectedId(storedSelection);
    }

    // First visit onboarding overlay (shown once per device)
    setShowOnboarding(true);
  }, []);

  // Автоскрытие подсказки скролла через несколько секунд
  useEffect(() => {
    const timer = setTimeout(() => setShowScrollHint(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const selectedOption = useMemo(() => {
    return evaluationOptions.find((option) => option.id === selectedId) ?? evaluationOptions[0];
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedId(evaluationOptions[0].id);
    }
  }, [selectedId]);

  // Keep preview in sync when selection/options change
  useEffect(() => {
    if (selectedOption) {
      setPreviewId((prev) => prev ?? selectedOption.id);
      const idx = evaluationOptions.findIndex((o) => o.id === selectedOption.id);
      if (idx >= 0) setCurrentIndex(idx);
    }
  }, [selectedOption]);

  const handleOptionSelect = useCallback((option: EvaluationOption) => {
    setSelectedId(option.id);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("userEvaluationId", option.id);
      sessionStorage.setItem("userEvaluation", option.label);
      sessionStorage.setItem("damagePercent", String(option.percentage));
    }
  }, []);

  const priceRange = useMemo(() => {
    const base = basePrice ?? price;
    if (!base) return null;

    // Получаем данные о состоянии устройства из sessionStorage
    const deviceConditionsData = sessionStorage.getItem('deviceConditions');
    const additionalConditionsData = sessionStorage.getItem('additionalConditions');
    
    let deviceConditions: DeviceConditions = {};
    let additionalConditions: AdditionalConditions = {};
    
    if (deviceConditionsData) {
      try {
        deviceConditions = JSON.parse(deviceConditionsData);
      } catch (e) {
        console.error('Ошибка парсинга deviceConditions:', e);
      }
    }
    
    if (additionalConditionsData) {
      try {
        additionalConditions = JSON.parse(additionalConditionsData);
      } catch (e) {
        console.error('Ошибка парсинга additionalConditions:', e);
      }
    }

    // Используем новую формулу расчёта диапазона цен
    const modelName = modelname; // Модель всегда валидна из БД
    const range = calculatePriceRange(base, modelName, deviceConditions, additionalConditions);
    
    return range;
  }, [basePrice, price, selectedOption, previewId, modelname]);

  useEffect(() => {
    if (!priceRange) return;
    setPrice(priceRange.midpoint);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("price", JSON.stringify(priceRange.midpoint));
      sessionStorage.setItem("priceRange", JSON.stringify(priceRange));
    }
  }, [priceRange, setPrice]);

  useEffect(() => {
    const opt = evaluationOptions.find((o) => o.id === previewId) ?? selectedOption;
    if (opt) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("userEvaluation", opt.label);
        sessionStorage.setItem("damagePercent", String(opt.percentage));
      }
    }
  }, [previewId, selectedOption]);

  // Swiper will handle gestures; keep index/preview in sync via callbacks

  const previewOption = useMemo(() => {
    return evaluationOptions.find((o) => o.id === previewId) ?? selectedOption;
  }, [previewId, selectedOption]);

  const handleContinue = async () => {
    const opt = evaluationOptions.find((o) => o.id === previewId) ?? selectedOption;
    if (!opt || !priceRange) return;

    setSubmitting(true);
    setUserEvaluation(opt.label);
    setDamagePercent(opt.percentage);

    try {
      await fetch("/api/request/save-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId,
          userEvaluation: opt.label,
          damagePercent: opt.percentage,
          price: priceRange.midpoint,
          priceRange,
        }),
      });
    } catch (error) {
      console.error("Error saving evaluation:", error);
    } finally {
      setSubmitting(false);
      router.push("/request/submit");
    }
  };

  return (
    <Page back={true}>
      <div className="min-h-screen overflow-hidden flex items-center">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pb-6 pt-6 md:px-6">
          {showOnboarding && (
            <div
              className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
              onClick={() => { setShowOnboarding(false); try { localStorage.setItem("seenEvalOnboarding", "1"); } catch {} }}
              onTouchStart={() => { setShowOnboarding(false); try { localStorage.setItem("seenEvalOnboarding", "1"); } catch {} }}
              onWheel={() => { setShowOnboarding(false); try { localStorage.setItem("seenEvalOnboarding", "1"); } catch {} }}
            >
              <div className="mx-6 w-full max-w-sm rounded-2xl bg-white/95 p-5 text-center shadow-xl">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">↕️</div>
                <div className="text-base font-semibold text-slate-900">Выберите состояние</div>
                <div className="mt-1 text-sm text-slate-600">Свайпайте влево/вправо, чтобы листать варианты по кругу, затем нажмите «Продолжить»</div>
                <div className="mt-4 text-xs text-slate-400">Начните свайпать</div>
              </div>
            </div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-[32px] border border-white/70 bg-white/80 p-4 md:p-6 shadow-[0_40px_90px_-50px_rgba(15,23,42,0.45)] backdrop-blur"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="text-center md:text-left h-[100px] md:h-[112px] flex flex-col justify-start overflow-hidden">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Состояние</p>
                <h2 className="mt-1 text-3xl font-semibold text-slate-900 truncate">{previewOption.label}</h2>
              </div>

              <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-transparent p-3 md:p-4">
                <div ref={carouselRef} className="relative mx-auto w-full max-w-none touch-pan-x select-none">
                  <Carousel_003
                    className="mx-auto"
                    images={evaluationOptions.map(o => ({ src: getPictureUrl(`${o.image}.png`), alt: o.label }))}
                    showPagination
                    loop
                    autoplay={false}
                    spaceBetween={0}
                    initialIndex={currentIndex}
                    heightPx={400}
                    heightPxMd={480}
                    slideWidthPx={300}
                    slideWidthPxMd={360}
                    onIndexChange={(idx) => {
                      const option = evaluationOptions[idx];
                      if (!option) return;
                      if (showOnboarding) {
                        setShowOnboarding(false);
                        try { localStorage.setItem("seenEvalOnboarding", "1"); } catch {}
                      }
                      if (showScrollHint) setShowScrollHint(false);
                      setCurrentIndex(idx);
                      setPreviewId(option.id);
                    }}
                  />
                </div>
              </div>

              <div className="mt-2 text-sm text-slate-600 md:text-base text-center md:text-left px-1 min-h-[64px] md:min-h-[80px] overflow-hidden">
                {previewOption.description}
              </div>

              <div className="flex flex-col items-center justify-between gap-3 md:flex-row mt-2">
                <div className="flex flex-col items-center gap-1 md:items-start">
                  <div className="text-sm text-slate-500">
                    <span className="font-semibold text-slate-900">-{previewOption.percentage}%</span>
                    <span className="mx-2 text-slate-400">/</span>
                    {priceRange ? (
                      <span className="font-semibold text-slate-900">
                        {formatMoney(priceRange.min)} — {formatMoney(priceRange.max)}
                      </span>
                    ) : (
                      <span className="text-slate-400">диапазон уточняется</span>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  disabled={!priceRange || submitting}
                  onClick={handleContinue}
                  className="h-11 md:h-12 w-full md:w-auto rounded-full bg-slate-900 px-8 md:px-10 text-sm font-semibold text-white shadow-[0_24px_60px_-25px_rgba(15,23,42,0.65)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  Продолжить
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Page>
  );
}
