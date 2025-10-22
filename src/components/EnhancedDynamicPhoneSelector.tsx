'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring, PanInfo } from 'framer-motion';
import { ChevronUp, ChevronDown, Smartphone, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/stores/authStore';

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

// Расширенные данные моделей iPhone
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

// Улучшенный вертикальный селектор с iPhone-жестами
interface VerticalModelSelectorProps {
  models: PhoneModel[];
  selectedModel: PhoneModel;
  onModelChange: (model: PhoneModel) => void;
}

function VerticalModelSelector({ models, selectedModel, onModelChange }: VerticalModelSelectorProps) {
  const y = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [velocity, setVelocity] = useState(0);

  const selectedIndex = models.findIndex(model => model.id === selectedModel.id);
  const itemHeight = 90;
  
  // Пружинящая анимация с momentum
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
    
    // Используем velocity для momentum scroll
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
    <div className="relative h-96 overflow-hidden bg-gradient-to-b from-gray-900 to-black rounded-2xl">
      {/* Градиентные маски для fade эффекта */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 to-transparent z-10 pointer-events-none" />
      
      <motion.div
        ref={containerRef}
        className="flex flex-col items-center justify-center py-8"
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
          const opacity = distance === 0 ? 1 : Math.max(0.2, 1 - distance * 0.4);
          const scale = distance === 0 ? 1.1 : Math.max(0.7, 1 - distance * 0.15);
          const blur = distance > 2 ? Math.min(2, distance * 0.5) : 0;
          
          return (
            <motion.div
              key={model.id}
              className="flex items-center justify-center w-full h-20 cursor-pointer"
              style={{ 
                opacity, 
                scale,
                filter: `blur(${blur}px)`
              }}
              animate={{ opacity, scale, filter: `blur(${blur}px)` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="flex items-center space-x-4 px-6 w-full max-w-xs">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Smartphone className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 text-center">
                  <div className="text-lg font-bold text-white">
                    {model.displayName}
                  </div>
                  <div className="text-sm text-gray-300">
                    от {model.basePrice.toLocaleString()}₽
                  </div>
                  <div className="text-xs text-gray-500">
                    {model.year}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      
      {/* Центральный индикатор */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 w-1 h-8 bg-white rounded-full opacity-60" />
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 w-1 h-8 bg-white rounded-full opacity-60" />
    </div>
  );
}

// Улучшенный крутящийся барабан с физикой
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
    }, 400);
  }, [isSpinning, rotation, anglePerItem, options, onOptionChange]);

  return (
    <div className="relative w-40 h-40 mx-auto">
      {/* Внешнее кольцо */}
      <motion.div
        className="w-full h-full rounded-full border-4 border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner"
        style={{ rotate: rotation }}
        animate={{ rotate: rotation.get() }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Внутренний контент */}
        <div className="absolute inset-4 rounded-full bg-white shadow-lg flex items-center justify-center">
          {type === 'storage' ? (
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {(selectedOption as StorageOption).size}
              </div>
              <div className="text-sm text-gray-500">
                {(selectedOption as StorageOption).price > 0 ? `+${(selectedOption as StorageOption).price.toLocaleString()}₽` : 'Базовый'}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div 
                className="w-12 h-12 rounded-full mx-auto border-4 border-white shadow-lg"
                style={{ backgroundColor: (selectedOption as ColorOption).hex }}
              />
              <div className="text-xs text-gray-600 mt-2">
                {(selectedOption as ColorOption).name}
              </div>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Кнопки управления с haptic feedback */}
      <motion.button
        onClick={() => handleWheelSpin('up')}
        disabled={isSpinning}
        className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
      >
        <ChevronUp className="w-5 h-5 text-gray-600" />
      </motion.button>
      
      <motion.button
        onClick={() => handleWheelSpin('down')}
        disabled={isSpinning}
        className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
      >
        <ChevronDown className="w-5 h-5 text-gray-600" />
      </motion.button>
      
      {/* Центральная точка */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full" />
    </div>
  );
}

// Главный компонент с Dynamic Island эффектом
export default function DynamicPhoneSelector() {
  const { setModel, setPrice } = useAppStore();
  const [selectedModel, setSelectedModel] = useState(IPHONE_MODELS[0]);
  const [selectedStorage, setSelectedStorage] = useState(STORAGE_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [currentStep, setCurrentStep] = useState<'model' | 'storage' | 'color'>('model');

  const totalPrice = selectedModel.basePrice + selectedStorage.price + selectedColor.price;

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
          <div className="flex flex-col items-center space-y-6">
            <SpinningWheel
              options={STORAGE_OPTIONS}
              selectedOption={selectedStorage}
              onOptionChange={(option) => setSelectedStorage(option as StorageOption)}
              type="storage"
            />
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Объём памяти</div>
              <div className="text-xs text-gray-500">Крутите барабан для выбора</div>
            </div>
          </div>
        );
      case 'color':
        return (
          <div className="flex flex-col items-center space-y-6">
            <SpinningWheel
              options={COLOR_OPTIONS}
              selectedOption={selectedColor}
              onOptionChange={(option) => setSelectedColor(option as ColorOption)}
              type="color"
            />
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Цвет</div>
              <div className="text-xs text-gray-500">Крутите барабан для выбора</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-4">
      {/* Dynamic Island контейнер */}
      <motion.div
        className="bg-black rounded-3xl shadow-2xl overflow-hidden"
        animate={{
          width: currentStep === 'model' ? 360 : 320,
          height: currentStep === 'model' ? 480 : 280,
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* Заголовок с анимацией */}
        <motion.div 
          className="text-center py-6 bg-gradient-to-r from-gray-800 to-gray-900"
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-white text-2xl font-bold">iPhone</h1>
          <motion.div 
            className="text-gray-400 text-sm mt-1"
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 'model' && 'Выберите модель'}
            {currentStep === 'storage' && 'Объём памяти'}
            {currentStep === 'color' && 'Цвет'}
          </motion.div>
        </motion.div>

        {/* Контент */}
        <div className="p-6">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {renderCurrentStep()}
          </motion.div>
        </div>

        {/* Навигация с анимацией */}
        <div className="flex justify-center pb-6 space-x-3">
          {(['model', 'storage', 'color'] as const).map((step) => (
            <motion.button
              key={step}
              onClick={() => setCurrentStep(step)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentStep === step ? 'bg-white' : 'bg-gray-600'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Цена с анимацией */}
        <motion.div 
          className="text-center pb-6"
          key={totalPrice}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-white text-xl font-bold">
            {totalPrice.toLocaleString()}₽
          </div>
          <div className="text-gray-400 text-sm">
            Итоговая стоимость
          </div>
        </motion.div>
      </motion.div>

      {/* Инструкция с анимацией */}
      <motion.div 
        className="mt-8 text-center max-w-sm"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-gray-600 text-sm leading-relaxed">
          {currentStep === 'model' && 'Прокручивайте вверх/вниз для выбора модели'}
          {currentStep === 'storage' && 'Крутите барабан для выбора объёма памяти'}
          {currentStep === 'color' && 'Крутите барабан для выбора цвета'}
        </p>
        <div className="flex items-center justify-center mt-4 space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </motion.div>
    </div>
  );
}
