'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Page } from '@/components/Page';
import { useStepNavigation } from '@/hooks/useStepNavigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Navigation
} from 'lucide-react';
import { useAppStore } from '@/stores/authStore';

// Адрес самовывоза (заглушка)
const PICKUP_ADDRESS = {
  address: 'ул. Тверская, 12, Москва',
  coordinates: '55.803661,37.800755',
  phone: '+7 (495) 123-45-67',
  hours: 'Пн-Пт: 10:00-20:00, Сб-Вс: 11:00-18:00'
};

export default function PickupPage() {
  const router = useRouter();
  const { goBack } = useStepNavigation();
  const { setCurrentStep } = useAppStore();
  
  // Получаем выбранный способ доставки из sessionStorage
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'courier' | null>(null);
  const [courierAddress, setCourierAddress] = useState('');
  const [courierPhone, setCourierPhone] = useState('');
  const [courierComment, setCourierComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Загружаем выбранный способ доставки при монтировании
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDeliveryOptions = sessionStorage.getItem('deliveryOptionsData');
      if (savedDeliveryOptions) {
        try {
          const parsed = JSON.parse(savedDeliveryOptions);
          setDeliveryMethod(parsed.selectedOption);
        } catch (e) {
          console.error('Ошибка при загрузке способа доставки:', e);
        }
      }
    }
  }, []);

  const handleContinue = useCallback(async () => {
    if (!deliveryMethod) return;
    
    setIsLoading(true);
    
    try {
      // Сохраняем данные доставки
      const deliveryData = {
        type: deliveryMethod,
        ...(deliveryMethod === 'pickup' ? {
          address: PICKUP_ADDRESS.address,
          coordinates: PICKUP_ADDRESS.coordinates,
          phone: PICKUP_ADDRESS.phone,
          hours: PICKUP_ADDRESS.hours
        } : {
          address: courierAddress,
          phone: courierPhone,
          comment: courierComment
        })
      };
      
      // Сохраняем в sessionStorage
      sessionStorage.setItem('deliveryData', JSON.stringify(deliveryData));
      
      // Переходим к финальному шагу
      setCurrentStep('final');
      router.push('/request/final');
      
    } catch (error) {
      console.error('Ошибка при сохранении данных доставки:', error);
    } finally {
      setIsLoading(false);
    }
  }, [deliveryMethod, courierAddress, courierPhone, courierComment, setCurrentStep, router]);

  const openInYandexMaps = useCallback(() => {
    const validGeoLink = `https://yandex.com/maps/?ll=${PICKUP_ADDRESS.coordinates.split(',')[1]},${PICKUP_ADDRESS.coordinates.split(',')[0]}&z=15`;
    window.open(validGeoLink, '_blank');
  }, []);

  const canContinue = deliveryMethod === 'pickup' || 
    (deliveryMethod === 'courier' && courierAddress.trim() && courierPhone.trim());

  // Если способ доставки не определен, показываем загрузку
  if (!deliveryMethod) {
    return (
      <Page back={goBack}>
        <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col pt-4 overflow-hidden">
          <div className="flex-1 p-3 pt-2 flex items-center justify-center">
            <div className="w-full max-w-md mx-auto flex flex-col gap-6 pb-4 items-center text-center">
              <div className="text-gray-600">Загрузка...</div>
            </div>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page back={goBack}>
      <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col pt-4 overflow-hidden">
        <div className="flex-1 p-3 pt-2 flex items-center justify-center">
          <div className="w-full max-w-md mx-auto flex flex-col gap-6 pb-4 items-center text-center">
            {/* Заголовок */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {deliveryMethod === 'pickup' ? 'Принести в точку' : 'Курьер заберет'}
              </h2>
              <p className="text-gray-600">
                {deliveryMethod === 'pickup' 
                  ? 'Принесите устройство в нашу точку' 
                  : 'Курьер заберет устройство у вас домой'
                }
              </p>
            </motion.div>

            {/* Контент в зависимости от способа доставки */}
            {deliveryMethod === 'pickup' ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="w-full bg-white rounded-2xl p-4 border border-gray-200 shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Наш адрес
                      </h4>
                      <p className="text-sm text-gray-600">
                        {PICKUP_ADDRESS.address}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Часы работы
                      </h4>
                      <p className="text-sm text-gray-600">
                        {PICKUP_ADDRESS.hours}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Телефон
                      </h4>
                      <p className="text-sm text-gray-600">
                        {PICKUP_ADDRESS.phone}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={openInYandexMaps}
                    className="w-full h-12 bg-white hover:bg-gray-50 text-gray-800 hover:text-gray-900 rounded-2xl text-lg font-semibold shadow-xl border-2 border-gray-200 hover:border-gray-300"
                  >
                    <Navigation className="w-5 h-5 mr-2" />
                    Открыть в Яндекс Картах
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="w-full bg-white rounded-2xl p-4 border border-gray-200 shadow-sm"
              >
                <div className="space-y-4">
                  <div>
                    <input
                      value={courierAddress}
                      onChange={(e) => setCourierAddress(e.target.value)}
                      placeholder="📍 Адрес где забрать устройство"
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 font-medium bg-white"
                    />
                  </div>
                  
                  <div>
                    <input
                      value={courierPhone}
                      onChange={(e) => setCourierPhone(e.target.value)}
                      placeholder="📞 Телефон для связи с курьером"
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 font-medium bg-white"
                    />
                  </div>
                  
                  <div>
                    <textarea
                      value={courierComment}
                      onChange={(e) => setCourierComment(e.target.value)}
                      placeholder="💬 Дополнительная информация для курьера"
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 font-medium resize-none bg-white"
                      rows={2}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Кнопка продолжения */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Button
                onClick={handleContinue}
                disabled={!canContinue || isLoading}
                className="w-full h-16 bg-white hover:bg-gray-50 text-gray-800 hover:text-gray-900 rounded-2xl text-lg font-semibold shadow-xl border-2 border-gray-200 hover:border-gray-300 disabled:opacity-50"
              >
                {isLoading ? 'Сохраняем...' : 'Продолжить'}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </Page>
  );
}
