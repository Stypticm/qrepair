'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ChevronUp, ChevronDown, Smartphone } from 'lucide-react';
import { useAppStore } from '@/stores/authStore';

// Типы данных
interface PhoneModel {
  id: string;
  name: string;
  displayName: string;
  image: string;
  basePrice: number;
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
  { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', displayName: '15 Pro Max', image: '/iphone-15-pro-max.png', basePrice: 120000 },
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', displayName: '15 Pro', image: '/iphone-15-pro.png', basePrice: 100000 },
  { id: 'iphone-15-plus', name: 'iPhone 15 Plus', displayName: '15 Plus', image: '/iphone-15-plus.png', basePrice: 90000 },
  { id: 'iphone-15', name: 'iPhone 15', displayName: '15', image: '/iphone-15.png', basePrice: 80000 },
  { id: 'iphone-14-pro-max', name: 'iPhone 14 Pro Max', displayName: '14 Pro Max', image: '/iphone-14-pro-max.png', basePrice: 110000 },
  { id: 'iphone-14-pro', name: 'iPhone 14 Pro', displayName: '14 Pro', image: '/iphone-14-pro.png', basePrice: 95000 },
  { id: 'iphone-14-plus', name: 'iPhone 14 Plus', displayName: '14 Plus', image: '/iphone-14-plus.png', basePrice: 85000 },
  { id: 'iphone-14', name: 'iPhone 14', displayName: '14', image: '/iphone-14.png', basePrice: 75000 },
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
];

// Компонент вертикального селектора моделей
interface VerticalModelSelectorProps {
  models: PhoneModel[];
  selectedModel: PhoneModel;
  onModelChange: (model: PhoneModel) => void;
}

function VerticalModelSelector({ models, selectedModel, onModelChange }: VerticalModelSelectorProps) {
  const y = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Вычисляем индекс выбранной модели
  const selectedIndex = models.findIndex(model => model.id === selectedModel.id);
  
  // Трансформируем Y в индекс модели
  const modelIndex = useTransform(y, (value) => {
    const itemHeight = 80; // Высота одного элемента
    const centerOffset = (containerRef.current?.clientHeight || 0) / 2;
    return Math.round((centerOffset - value) / itemHeight);
  });

  // Пружинящая анимация
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    const currentIndex = Math.max(0, Math.min(models.length - 1, Math.round(modelIndex.get())));
    const targetY = (containerRef.current?.clientHeight || 0) / 2 - currentIndex * 80;
    springY.set(targetY);
    onModelChange(models[currentIndex]);
  }, [models, modelIndex, springY, onModelChange]);

  return (
    <div className="relative h-80 overflow-hidden">
      <motion.div
        ref={containerRef}
        className="flex flex-col items-center justify-center"
        style={{ y: springY }}
        drag="y"
        dragConstraints={{ top: -(models.length - 1) * 80, bottom: 0 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
      >
        {models.map((model, index) => {
          const distance = Math.abs(index - selectedIndex);
          const opacity = distance === 0 ? 1 : Math.max(0.3, 1 - distance * 0.3);
          const scale = distance === 0 ? 1 : Math.max(0.8, 1 - distance * 0.1);
          
          return (
            <motion.div
              key={model.id}
              className="flex items-center justify-center w-full h-20 cursor-pointer"
              style={{ opacity, scale }}
              animate={{ opacity, scale }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-4 px-6">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-gray-600" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {model.displayName}
                  </div>
                  <div className="text-sm text-gray-500">
                    от {model.basePrice.toLocaleString()}₽
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      
      {/* Индикаторы прокрутки */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
        <ChevronUp className="w-4 h-4 text-gray-400" />
      </div>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
}

// Компонент крутящегося барабана для вариантов
interface SpinningWheelProps {
  options: StorageOption[] | ColorOption[];
  selectedOption: StorageOption | ColorOption;
  onOptionChange: (option: StorageOption | ColorOption) => void;
  type: 'storage' | 'color';
}

function SpinningWheel({ options, selectedOption, onOptionChange, type }: SpinningWheelProps) {
  const rotation = useMotionValue(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const selectedIndex = options.findIndex(option => option.id === selectedOption.id);
  const anglePerItem = 360 / options.length;

  const handleWheelSpin = useCallback((direction: 'up' | 'down') => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    const currentRotation = rotation.get();
    const spinAmount = direction === 'up' ? -anglePerItem : anglePerItem;
    const targetRotation = currentRotation + spinAmount;
    
    rotation.set(targetRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      const newIndex = Math.abs(Math.round(targetRotation / anglePerItem)) % options.length;
      onOptionChange(options[newIndex]);
    }, 300);
  }, [isSpinning, rotation, anglePerItem, options, onOptionChange]);

  return (
    <div className="relative w-32 h-32 mx-auto">
      <motion.div
        ref={wheelRef}
        className="w-full h-full rounded-full border-4 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center"
        style={{ rotate: rotation }}
        animate={{ rotate: rotation.get() }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="text-center">
          {type === 'storage' ? (
            <div className="text-sm font-semibold text-gray-900">
              {(selectedOption as StorageOption).size}
            </div>
          ) : (
            <div 
              className="w-8 h-8 rounded-full mx-auto border-2 border-white shadow-lg"
              style={{ backgroundColor: (selectedOption as ColorOption).hex }}
            />
          )}
        </div>
      </motion.div>
      
      {/* Кнопки управления */}
      <button
        onClick={() => handleWheelSpin('up')}
        disabled={isSpinning}
        className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
      >
        <ChevronUp className="w-4 h-4 text-gray-600" />
      </button>
      
      <button
        onClick={() => handleWheelSpin('down')}
        disabled={isSpinning}
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
      >
        <ChevronDown className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}

// Главный компонент Dynamic Island селектора
export default function DynamicPhoneSelector() {
  const { setModel, setPrice } = useAppStore();
  const [selectedModel, setSelectedModel] = useState(IPHONE_MODELS[0]);
  const [selectedStorage, setSelectedStorage] = useState(STORAGE_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [currentStep, setCurrentStep] = useState<'model' | 'storage' | 'color'>('model');

  // Вычисляем итоговую цену
  const totalPrice = selectedModel.basePrice + selectedStorage.price + selectedColor.price;

  // Обновляем глобальное состояние
  useEffect(() => {
    setModel(selectedModel.name);
    setPrice(totalPrice);
  }, [selectedModel, selectedStorage, selectedColor, totalPrice, setModel, setPrice]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'model':
        return (
          <VerticalModelSelector
            models={IPHONE_MODELS}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        );
      case 'storage':
        return (
          <SpinningWheel
            options={STORAGE_OPTIONS}
            selectedOption={selectedStorage}
            onOptionChange={(option) => setSelectedStorage(option as StorageOption)}
            type="storage"
          />
        );
      case 'color':
        return (
          <SpinningWheel
            options={COLOR_OPTIONS}
            selectedOption={selectedColor}
            onOptionChange={(option) => setSelectedColor(option as ColorOption)}
            type="color"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-4">
      {/* Dynamic Island контейнер */}
      <motion.div
        className="bg-black rounded-3xl p-6 shadow-2xl"
        animate={{
          width: currentStep === 'model' ? 320 : 280,
          height: currentStep === 'model' ? 400 : 200,
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {/* Заголовок */}
        <div className="text-center mb-6">
          <h1 className="text-white text-xl font-bold">iPhone</h1>
          <div className="text-gray-400 text-sm">
            {currentStep === 'model' && 'Выберите модель'}
            {currentStep === 'storage' && 'Объём памяти'}
            {currentStep === 'color' && 'Цвет'}
          </div>
        </div>

        {/* Контент */}
        <div className="flex justify-center">
          {renderCurrentStep()}
        </div>

        {/* Навигация */}
        <div className="flex justify-center mt-6 space-x-2">
          {(['model', 'storage', 'color'] as const).map((step) => (
            <button
              key={step}
              onClick={() => setCurrentStep(step)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                currentStep === step ? 'bg-white' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Цена */}
        <div className="text-center mt-4">
          <div className="text-white text-lg font-semibold">
            {totalPrice.toLocaleString()}₽
          </div>
        </div>
      </motion.div>

      {/* Инструкция */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 text-sm">
          Прокручивайте вверх/вниз для выбора модели
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Крутите барабан для выбора вариантов
        </p>
      </div>
    </div>
  );
}
