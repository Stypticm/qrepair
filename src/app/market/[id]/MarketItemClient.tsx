'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, RefreshCcw, ArrowRight } from 'lucide-react';
import { OneClickBuyModal } from '@/components/Market/OneClickBuyModal';
import OptimizedPhoneSelector from '@/components/OptimizedPhoneSelector';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MarketItemClientProps {
  id: string;
  title: string;
  price: number | null;
  coverImage: string;
  photos: string[];
  model: string;
  storage: string;
  color: string;
  condition: string;
  description: string | null;
}

export function MarketItemClient({
  title,
  price,
  coverImage,
  model,
  storage,
  color,
  condition,
  description,
}: MarketItemClientProps) {
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isTradeInModalOpen, setIsTradeInModalOpen] = useState(false);
  const router = useRouter();

  const formattedPrice = price
    ? `${price.toLocaleString('ru-RU')} ₽`
    : 'Цена не указана';

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <div
        className="flex-1 p-6"
        style={{ paddingTop: 'env(--safe-area-top, 60px)' }}
      >
        <div className="w-full max-w-md mx-auto space-y-6 pb-20 md:pb-10">
          <div className="w-full h-60 bg-gradient-to-b from-gray-50 to-gray-100 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden">
            <Image
              src={coverImage}
              alt={title}
              width={320}
              height={240}
              className="object-contain w-full h-full p-6"
            />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-[-0.01em]">
              {title}
            </h1>
            <div className="mt-1 text-lg text-gray-600 font-medium">{formattedPrice}</div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Описание</div>
              <div className="text-sm text-gray-600 leading-relaxed">
                {description || 'Описание отсутствует'}
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Характеристики</div>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between border-b border-gray-50 pb-1">
                  <span className="text-gray-400">Модель</span>
                  <span className="font-medium">{model}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-1">
                  <span className="text-gray-400">Память</span>
                  <span className="font-medium">{storage}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-1">
                  <span className="text-gray-400">Цвет</span>
                  <span className="font-medium">{color}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Состояние</span>
                  <span className="font-medium text-teal-600">{condition}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Button
                onClick={() => setIsBuyModalOpen(true)}
                className="w-full h-14 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-lg shadow-teal-500/20 group transition-all active:scale-[0.98]"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Купить в 1 клик
                <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </Button>

              <Button
                onClick={() => setIsTradeInModalOpen(true)}
                variant="outline"
                className="w-full h-14 rounded-full border-2 border-gray-200 hover:border-teal-100 hover:bg-teal-50/50 text-gray-700 font-semibold text-base transition-all active:scale-[0.98]"
              >
                <RefreshCcw className="w-5 h-5 mr-2 text-teal-600" />
                Оцените по Trade-in
              </Button>
            </div>

            <p className="text-[11px] text-gray-400 text-center px-6 leading-tight">
              При обмене старой техники вы можете получить скидку до 80% на этот товар по программе Trade-in
            </p>
          </div>
        </div>
      </div>

      <OneClickBuyModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        productTitle={title}
        productPrice={price}
      />

      <OptimizedPhoneSelector
        open={isTradeInModalOpen}
        onOpenChange={setIsTradeInModalOpen}
      />
    </div>
  );
}
