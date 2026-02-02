'use client';

import Image from 'next/image';

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
  photos,
  model,
  storage,
  color,
  condition,
  description,
}: MarketItemClientProps) {
  const formattedPrice = price
    ? `${price.toLocaleString('ru-RU')} ₽`
    : 'Цена не указана';

  return (
    <div className="w-full h-full bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <div
        className="flex-1 p-6"
        style={{ paddingTop: 'env(--safe-area-top, 60px)' }}
      >
        <div className="w-full max-w-md mx-auto space-y-6">
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
            <div className="mt-1 text-lg text-gray-600">{formattedPrice}</div>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-white rounded-2xl border border-gray-100">
              <div className="text-sm text-gray-700">Описание</div>
              <div className="mt-1 text-sm text-gray-500 leading-relaxed">
                {description || 'Описание отсутствует'}
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-100">
              <div className="text-sm text-gray-700 mb-2">Характеристики</div>
              <div className="space-y-1 text-sm text-gray-600">
                {model && <div>Модель: {model}</div>}
                {storage && <div>Память: {storage}</div>}
                {color && <div>Цвет: {color}</div>}
                {condition && <div>Состояние: {condition}</div>}
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-100">
              <div className="text-sm text-gray-700 mb-2">Бейджи</div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 h-7 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  Новый
                </span>
                <span className="inline-flex items-center px-2.5 h-7 rounded-full text-[11px] font-medium bg-pink-50 text-pink-700 border border-pink-100">
                  Хит
                </span>
                <span className="inline-flex items-center px-2.5 h-7 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-100">
                  Скидка
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
