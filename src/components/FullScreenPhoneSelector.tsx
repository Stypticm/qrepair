'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring, PanInfo } from 'framer-motion';
import { ChevronUp, ChevronDown, Smartphone, Check } from 'lucide-react';
import { useAppStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Типы данных
interface PhoneModel {
  id: string;
  name: string;
  displayName: string;
  image: string;
  basePrice: number;
  year: number;
}

interface StorageOption {
  id: string;
  size: string;
  price: number;
}

interface ColorOption {
  id: string;
  name: string;
  hex: string;
  price: number;
}

// Данные моделей iPhone
const IPHONE_MODELS: PhoneModel[] = [
  { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', displayName: '15 Pro Max', image: '/iphone-15-pro-max.png', basePrice: 120000, year: 2023 },
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', displayName: '15 Pro', image: '/iphone-15-pro.png', basePrice: 100000, year: 2023 },
  { id: 'iphone-15-plus', name: 'iPhone 15 Plus', displayName: '15 Plus', image: '/iphone-15-plus.png', basePrice: 90000, year: 2023 },
  { id: 'iphone-15', name: 'iPhone 15', displayName: '15', image: '/iphone-15.png', basePrice: 80000, year: 2023 },
  { id: 'iphone-14-pro-max', name: 'iPhone 14 Pro Max', displayName: '14 Pro Max', image: '/iphone-14-pro-max.png', basePrice: 110000, year: 2022 },
  { id: 'iphone-14-pro', name: 'iPhone 14 Pro', displayName: '14 Pro', image: '/iphone-14-pro.png', basePrice: 95000, year: 2022 },
  { id: 'iphone-14-plus', name: 'iPhone 14 Plus', displayName: '14 Plus', image: '/iphone-14-plus.png', basePrice: 85000, year: 2022 },
  { id: 'iphone-14', name: 'iPhone 14', displayName: '14', image: '/iphone-14.png', basePrice: 75000, year: 2022 },
  { id: 'iphone-13-pro-max', name: 'iPhone 13 Pro Max', displayName: '13 Pro Max', image: '/iphone-13-pro-max.png', basePrice: 100000, year: 2021 },
  { id: 'iphone-13-pro', name: 'iPhone 13 Pro', displayName: '13 Pro', image: '/iphone-13-pro.png', basePrice: 90000, year: 2021 },
  { id: 'iphone-13', name: 'iPhone 13', displayName: '13', image: '/iphone-13.png', basePrice: 70000, year: 2021 },
  { id: 'iphone-12-pro-max', name: 'iPhone 12 Pro Max', displayName: '12 Pro Max', image: '/iphone-12-pro-max.png', basePrice: 90000, year: 2020 },
];

const STORAGE_OPTIONS: StorageOption[] = [
  { id: '128gb', size: '128 ГБ', price: 0 },
  { id: '256gb', size: '256 ГБ', price: 10000 },
  { id: '512gb', size: '512 ГБ', price: 20000 },
  { id: '1tb', size: '1 ТБ', price: 30000 },
];

const COLOR_OPTIONS: ColorOption[] = [
  { id: 'space-black', name: 'Космический чёрный', hex: '#1C1C1E', price: 0 },
  { id: 'natural-titanium', name: 'Натуральный титан', hex: '#8E8E93', price: 0 },
  { id: 'white-titanium', name: 'Белый титан', hex: '#F2F2F7', price: 0 },
  { id: 'blue-titanium', name: 'Синий титан', hex: '#007AFF', price: 0 },
  { id: 'gold', name: 'Золотой', hex: '#FFD700', price: 0 },
  { id: 'silver', name: 'Серебряный', hex: '#C0C0C0', price: 0 },
];

// Полноэкранный вертикальный селектор моделей
interface FullScreenModelSelectorProps {
  models: PhoneModel[];
  selectedModel: PhoneModel;
  onModelChange: (model: PhoneModel) => void;
}

function FullScreenModelSelector({ models, selectedModel, onModelChange }: FullScreenModelSelectorProps) {
  const y = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [velocity, setVelocity] = useState(0);

  const selectedIndex = models.findIndex(model => model.id === selectedModel.id);
  const itemHeight = 120;
  
  const springY = useSpring(y, { 
    stiffness: 300, 
    damping: 30,
    mass: 0.8
  });

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDrag = useCallback((event: any, info: PanInfo) => {
    setVelocity(info.velocity.y);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    
    const momentum = velocity * 0.1;
    const currentY = y.get();
    const targetY = currentY + momentum;
    
    const maxY = 0;
    const minY = -(models.length - 1) * itemHeight;
    const clampedY = Math.max(minY, Math.min(maxY, targetY));
    
    const targetIndex = Math.round(-clampedY / itemHeight);
    const finalIndex = Math.max(0, Math.min(models.length - 1, targetIndex));
    
    const finalY = -finalIndex * itemHeight;
    
    springY.set(finalY);
    onModelChange(models[finalIndex]);
  }, [velocity, y, springY, models, onModelChange, itemHeight]);

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Градиентные маски */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
      
      <motion.div
        ref={containerRef}
        className="flex flex-col items-center justify-center py-32"
        style={{ y: springY }}
        drag="y"
        dragConstraints={{ top: -(models.length - 1) * itemHeight, bottom: 0 }}
        dragElastic={0.05}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        dragMomentum={false}
      >
        {models.map((model, index) => {
          const distance = Math.abs(index - selectedIndex);
          const opacity = distance === 0 ? 1 : Math.max(0.3, 1 - distance * 0.3);
          const scale = distance === 0 ? 1.05 : Math.max(0.85, 1 - distance * 0.1);
          
          return (
            <motion.div
              key={model.id}
              className="flex items-center justify-center w-full h-28 cursor-pointer px-6"
              style={{ opacity, scale }}
              animate={{ opacity, scale }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="flex items-center space-x-6 w-full max-w-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-[#2dc2c6] to-[#4fd1d5] rounded-3xl flex items-center justify-center shadow-lg">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xl font-bold text-gray-900">
                    {model.displayName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {model.year}
                  </div>
                </div>
                {distance === 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      
      {/* Центральные индикаторы */}
      <div className="absolute top-1/2 left-8 transform -translate-y-1/2 w-1 h-16 bg-[#2dc2c6] rounded-full opacity-60" />
      <div className="absolute top-1/2 right-8 transform -translate-y-1/2 w-1 h-16 bg-[#2dc2c6] rounded-full opacity-60" />
      
      {/* Инструкция */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-gray-500 text-sm">Прокручивайте для выбора модели</div>
        <div className="flex justify-center mt-2 space-x-1">
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  );
}

// Горизонтальный селектор для вариантов
interface HorizontalOptionSelectorProps {
  options: StorageOption[] | ColorOption[];
  selectedOption: StorageOption | ColorOption;
  onOptionChange: (option: StorageOption | ColorOption) => void;
  type: 'storage' | 'color';
}

function HorizontalOptionSelector({ options, selectedOption, onOptionChange, type }: HorizontalOptionSelectorProps) {
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const selectedIndex = options.findIndex(option => option.id === selectedOption.id);
  const itemWidth = 120;
  
  const springX = useSpring(x, { 
    stiffness: 300, 
    damping: 30,
    mass: 0.8
  });

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    
    const currentX = x.get();
    const targetIndex = Math.round(-currentX / itemWidth);
    const finalIndex = Math.max(0, Math.min(options.length - 1, targetIndex));
    
    const finalX = -finalIndex * itemWidth;
    
    springX.set(finalX);
    onOptionChange(options[finalIndex]);
  }, [x, springX, options, onOptionChange, itemWidth]);

  return (
    <div className="relative w-full h-48 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Градиентные маски */}
      <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      
      <motion.div
        ref={containerRef}
        className="flex items-center justify-center py-8 px-16"
        style={{ x: springX }}
        drag="x"
        dragConstraints={{ left: -(options.length - 1) * itemWidth, right: 0 }}
        dragElastic={0.05}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        dragMomentum={false}
      >
        {options.map((option, index) => {
          const distance = Math.abs(index - selectedIndex);
          const opacity = distance === 0 ? 1 : Math.max(0.4, 1 - distance * 0.3);
          const scale = distance === 0 ? 1.1 : Math.max(0.8, 1 - distance * 0.15);
          
          return (
            <motion.div
              key={option.id}
              className="flex items-center justify-center w-28 h-32 cursor-pointer mx-2"
              style={{ opacity, scale }}
              animate={{ opacity, scale }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={() => onOptionChange(option)}
            >
              <div className="flex flex-col items-center justify-center w-full h-full">
                {type === 'storage' ? (
                  <>
                    <div className="w-16 h-16 bg-gradient-to-br from-[#2dc2c6] to-[#4fd1d5] rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                      <div className="text-white text-lg font-bold">
                        {(option as StorageOption).size.split(' ')[0]}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 text-center">
                      {(option as StorageOption).size}
                    </div>
                  </>
                ) : (
                  <>
                    <div 
                      className="w-16 h-16 rounded-2xl mb-3 shadow-lg border-4 border-white"
                      style={{ backgroundColor: (option as ColorOption).hex }}
                    />
                    <div className="text-sm font-semibold text-gray-900 text-center">
                      {(option as ColorOption).name}
                    </div>
                  </>
                )}
                {distance === 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      
      {/* Инструкция */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-gray-500 text-sm">
          {type === 'storage' ? 'Прокручивайте для выбора памяти' : 'Прокручивайте для выбора цвета'}
        </div>
      </div>
    </div>
  );
}

// Главный компонент
export default function FullScreenPhoneSelector() {
  const router = useRouter();
  const { setModel, setPrice } = useAppStore();
  const [selectedModel, setSelectedModel] = useState(IPHONE_MODELS[0]);
  const [selectedStorage, setSelectedStorage] = useState(STORAGE_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [currentStep, setCurrentStep] = useState<'model' | 'storage' | 'color'>('model');
  const [isLoading, setIsLoading] = useState(false);

  const totalPrice = selectedModel.basePrice + selectedStorage.price + selectedColor.price;

  useEffect(() => {
    setModel(selectedModel.name);
    setPrice(totalPrice);
  }, [selectedModel, selectedStorage, selectedColor, totalPrice, setModel, setPrice]);

  const handleContinue = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Небольшая задержка для плавности
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Переходим к следующему шагу
      router.push('/request/evaluation');
    } catch (error) {
      console.error('Ошибка при переходе:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'model':
        return (
          <FullScreenModelSelector
            models={IPHONE_MODELS}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        );
      case 'storage':
        return (
          <HorizontalOptionSelector
            options={STORAGE_OPTIONS}
            selectedOption={selectedStorage}
            onOptionChange={(option) => setSelectedStorage(option as StorageOption)}
            type="storage"
          />
        );
      case 'color':
        return (
          <HorizontalOptionSelector
            options={COLOR_OPTIONS}
            selectedOption={selectedColor}
            onOptionChange={(option) => setSelectedColor(option as ColorOption)}
            type="color"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Заголовок */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 text-center">iPhone</h1>
          <motion.div 
            className="text-gray-500 text-sm text-center mt-1"
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 'model' && 'Выберите модель'}
            {currentStep === 'storage' && 'Объём памяти'}
            {currentStep === 'color' && 'Цвет'}
          </motion.div>
        </div>
      </div>

      {/* Контент */}
      <div className="pt-20">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {renderCurrentStep()}
        </motion.div>
      </div>

      {/* Навигация */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-3 bg-white/80 backdrop-blur-md rounded-full px-6 py-3 shadow-lg border border-gray-200">
          {(['model', 'storage', 'color'] as const).map((step) => (
            <motion.button
              key={step}
              onClick={() => setCurrentStep(step)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentStep === step ? 'bg-[#2dc2c6]' : 'bg-gray-300'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>

      {/* Цена (только в конце) */}
      {currentStep === 'color' && (
        <motion.div 
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl px-6 py-3 shadow-lg border border-gray-200">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {totalPrice.toLocaleString()}₽
              </div>
              <div className="text-sm text-gray-500">
                Итоговая стоимость
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Кнопка продолжения */}
      {currentStep === 'color' && (
        <motion.div 
          className="fixed bottom-8 left-4 right-4 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Button
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full h-14 bg-gradient-to-r from-[#2dc2c6] to-[#4fd1d5] hover:from-[#25a8ac] hover:to-[#39c4c8] text-white font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Переходим...</span>
              </div>
            ) : (
              'Продолжить оценку'
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
