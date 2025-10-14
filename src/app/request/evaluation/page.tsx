"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Page } from "@/components/Page";
import { Button } from "@/components/ui/button";
import { getPictureUrl } from "@/core/lib/assets";
import { useAppStore } from "@/stores/authStore";

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

const floorToHundreds = (value: number) => Math.max(0, Math.floor(value / 100) * 100);
const ceilToHundreds = (value: number) => Math.max(0, Math.ceil(value / 100) * 100);
const roundToHundreds = (value: number) => Math.max(0, Math.round(value / 100) * 100);

const formatMoney = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);

export default function EvaluationPage() {
  const router = useRouter();
  const { telegramId, setUserEvaluation, setDamagePercent, price, setPrice } = useAppStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [basePrice, setBasePrice] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const wheelLockRef = useRef<boolean>(false);
  const lastWheelTsRef = useRef<number>(0);
  const touchStartYRef = useRef<number | null>(null);

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

    const discount = (evaluationOptions.find((o) => o.id === previewId)?.percentage ?? selectedOption.percentage) / 100;
    const anchor = Math.max(base * (1 - discount), base * 0.5);
    const rawMax = Math.min(anchor * 0.97, base * 0.95);
    const rawMin = Math.max(anchor * 0.82, base * 0.55);
    const absoluteFloor = floorToHundreds(base * 0.45);
    const absoluteMinFallback = floorToHundreds(base * 0.35);
    const absoluteCeil = ceilToHundreds(base * 0.95);

    let min = floorToHundreds(rawMin);
    let max = ceilToHundreds(rawMax);

    if (min < absoluteFloor) {
      min = absoluteFloor;
    }

    if (max > absoluteCeil) {
      max = absoluteCeil;
    }

    if (max - min < 1000) {
      min = floorToHundreds(Math.max(absoluteFloor, max - 1000));
    }

    if (max - min < 1000) {
      max = Math.min(absoluteCeil, ceilToHundreds(min + 1000));
    }

    if (max - min < 1000) {
      min = floorToHundreds(Math.max(absoluteFloor, max - 1000));
    }

    if (max <= min) {
      max = ceilToHundreds(min + 1000);
    }

    if (max > absoluteCeil) {
      max = absoluteCeil;
      if (max - min < 1000) {
        min = floorToHundreds(Math.max(absoluteFloor, max - 1000));
      }
    }

    if (max - min < 1000) {
      min = floorToHundreds(Math.max(absoluteMinFallback, max - 1000));
    }

    const midpoint = roundToHundreds((min + max) / 2);

    return { min, max, midpoint };
  }, [basePrice, price, selectedOption, previewId]);

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

  // Virtual scroll handlers (wheel/touch) to cycle through options without real page scroll
  const clampIndex = useCallback((i: number) => {
    if (i < 0) return 0;
    if (i >= evaluationOptions.length) return evaluationOptions.length - 1;
    return i;
  }, []);

  useEffect(() => {
    const container = document;
    const wheelHandler = (e: WheelEvent) => {
      const now = Date.now();
      if (wheelLockRef.current && now - lastWheelTsRef.current < 350) {
        e.preventDefault();
        return;
      }
      if (Math.abs(e.deltaY) < 24) return; // ignore tiny deltas
      e.preventDefault();
      wheelLockRef.current = true;
      lastWheelTsRef.current = now;
      const dir = e.deltaY > 0 ? 1 : -1;
      setCurrentIndex((prev) => {
        const next = clampIndex(prev + dir);
        setPreviewId(evaluationOptions[next].id);
        return next;
      });
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 320);
    };

    const touchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        touchStartYRef.current = e.touches[0].clientY;
      }
    };
    const touchMove = (e: TouchEvent) => {
      if (touchStartYRef.current == null) return;
      const delta = touchStartYRef.current - e.touches[0].clientY;
      if (Math.abs(delta) < 30) return;
      e.preventDefault();
      const dir = delta > 0 ? 1 : -1;
      touchStartYRef.current = e.touches[0].clientY; // step-by-step swipe
      setCurrentIndex((prev) => {
        const next = clampIndex(prev + dir);
        setPreviewId(evaluationOptions[next].id);
        return next;
      });
    };
    const touchEnd = () => {
      touchStartYRef.current = null;
    };

    // Add non-passive listeners to allow preventDefault
    container.addEventListener('wheel', wheelHandler, { passive: false });
    container.addEventListener('touchstart', touchStart, { passive: false });
    container.addEventListener('touchmove', touchMove, { passive: false });
    container.addEventListener('touchend', touchEnd, { passive: false });

    return () => {
      container.removeEventListener('wheel', wheelHandler as any);
      container.removeEventListener('touchstart', touchStart as any);
      container.removeEventListener('touchmove', touchMove as any);
      container.removeEventListener('touchend', touchEnd as any);
    };
  }, [clampIndex]);

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
      <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="mx-auto flex h-full max-w-4xl flex-col gap-8 px-4 pb-10 pt-10 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_40px_90px_-50px_rgba(15,23,42,0.45)] backdrop-blur"
          >
            <div className="flex flex-col gap-6">
              <div className="text-center md:text-left">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Сводка</p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">{previewOption.label}</h1>
                <p className="mt-3 text-sm text-slate-500 md:text-base">{previewOption.description}</p>
              </div>

              <div className={`relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-b ${accentGradient[previewOption.accent]} p-5 shadow-inner md:p-6`}>
                <div className="relative mx-auto aspect-[9/16] w-full max-w-[220px] overflow-hidden rounded-[24px] border border-white/40 bg-white/60 md:max-w-[240px]">
                  <Image
                    src={getPictureUrl(`${previewOption.image}.png`)}
                    alt={previewOption.label}
                    width={320}
                    height={560}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
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
                  className="h-12 w-full rounded-full bg-slate-900 px-10 text-sm font-semibold text-white shadow-[0_24px_60px_-25px_rgba(15,23,42,0.65)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 md:w-auto"
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
