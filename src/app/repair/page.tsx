'use client';

import React from 'react';
import { Page } from '@/components/Page';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RepairPage() {
  const router = useRouter();

  return (
    <Page back={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Заголовок */}
        <div className="bg-white border-b border-gray-200 px-4 py-6 pt-16 text-center">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full bg-gray-400"
          >
            <ArrowRight className="w-10 h-10" />
          </Button>
          <div className="flex items-center gap-3">
            <div className='flex flex-col items-center justify-center w-full'>
              <h1 className="text-2xl font-bold text-gray-900">Ремонт</h1>
              <p className="text-gray-600 text-sm">Профессиональный ремонт устройств</p>
            </div>
          </div>
        </div>

        {/* Контент */}
        <div className="px-4 py-8">
          <div className="max-w-md mx-auto">
            {/* Заглушка */}
            <div className="bg-slate-400 rounded-3xl p-8 shadow-lg text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#ff6b6b] to-[#ff8e8e] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Wrench className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Здесь будет ремонт
              </h2>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Мы работаем над созданием удобного сервиса для заказа ремонта ваших устройств.
                Скоро здесь появится возможность выбрать тип ремонта и оформить заявку.
              </p>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Что будет доступно:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Выбор типа ремонта</li>
                  <li>• Оценка стоимости</li>
                  <li>• Запись на ремонт</li>
                  <li>• Отслеживание статуса</li>
                </ul>
              </div>

              {/* <Button
                onClick={() => router.back()}
                className="w-full bg-gradient-to-r from-[#ff6b6b] to-[#ff8e8e] hover:from-[#ff5252] hover:to-[#ff7979] text-white font-semibold py-3 rounded-2xl transition-all duration-200"
              >
                Вернуться назад
              </Button> */}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
