'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Check, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useDevices } from '@/hooks/useDevices';

// Компонент выбора модели
interface ModelPickerProps {
  models: string[];
  selectedModel: string | null;
  onModelChange: (model: string) => void;
  isLoadingVariants: boolean;
}

const ModelPicker = ({ models, selectedModel, onModelChange, isLoadingVariants }: ModelPickerProps) => {
  const listRef = useRef<HTMLDivElement>(null);

  // Прокрутка списка к выбранной модели, чтобы она была видна пользователю
  useEffect(() => {
    if (!listRef.current || !selectedModel) return;
    
    // Ждем следующий кадр для корректного расчета размеров
    requestAnimationFrame(() => {
      const selectedElement = listRef.current?.querySelector(`[data-model="${selectedModel}"]`);
      if (selectedElement && listRef.current) {
        selectedElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    });
  }, [selectedModel, models]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 text-center">Модель</h3>
      
      <div ref={listRef} className="max-h-48 overflow-y-auto scrollbar-hide border border-gray-200 rounded-2xl bg-white">
        <div className="space-y-3 p-3">
          {models.map((model) => (
            <motion.button
              key={model}
              data-model={model}
              onClick={() => onModelChange(model)}
              className={`w-full flex items-center justify-center space-x-4 p-4 rounded-xl transition-all duration-200 ${
                selectedModel === model
                  ? 'bg-gray-100 border border-gray-300'
                  : 'hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-base font-medium text-gray-900">
                iPhone {model}
              </span>
              {selectedModel === model && (
                <Check className="w-5 h-5 text-gray-600" />
              )}
            </motion.button>
          ))}
        </div>
      </div>
      
      {isLoadingVariants && (
        <div className="flex items-center justify-center space-x-3 text-base text-gray-600 py-4">
          <div className="w-5 h-5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
          <span>Загружаем варианты...</span>
        </div>
      )}
    </div>
  );
};

// Компонент выбора варианта - компактный
interface VariantPickerProps {
  variants: string[];
  selectedVariant: string | null;
  onVariantChange: (variant: string) => void;
  isLoadingStorages: boolean;
}

const VariantPicker = ({ variants, selectedVariant, onVariantChange, isLoadingStorages }: VariantPickerProps) => {
  if (variants.length <= 1) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 text-center">Вариант</h3>
      
      <div className="flex flex-wrap gap-4 justify-center">
        {variants.map((variant) => (
          <motion.button
            key={variant}
            onClick={() => onVariantChange(variant)}
            className={`px-5 py-4 rounded-xl border transition-all duration-200 ${
              selectedVariant === variant
                ? 'border-gray-300 bg-gray-100'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-base font-medium text-gray-900">
                {variant}
              </span>
              {selectedVariant === variant && (
                <Check className="w-5 h-5 text-gray-600" />
              )}
            </div>
          </motion.button>
        ))}
      </div>
      
      {isLoadingStorages && (
        <div className="flex items-center justify-center space-x-3 text-base text-gray-600 py-4">
          <div className="w-5 h-5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
          <span>Загружаем память...</span>
        </div>
      )}
    </div>
  );
};

// Компонент выбора памяти - компактный
interface StoragePickerProps {
  storages: string[];
  selectedStorage: string | null;
  onStorageChange: (storage: string) => void;
  isLoadingColors: boolean;
}

const StoragePicker = ({ storages, selectedStorage, onStorageChange, isLoadingColors }: StoragePickerProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 text-center">Память</h3>
      
      <div className="flex flex-wrap gap-4 justify-center">
        {storages.map((storage) => (
          <motion.button
            key={storage}
            onClick={() => onStorageChange(storage)}
            className={`px-5 py-4 rounded-xl border transition-all duration-200 ${
              selectedStorage === storage
                ? 'border-gray-300 bg-gray-100'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-base font-medium text-gray-900">
                {storage}
              </span>
              {selectedStorage === storage && (
                <Check className="w-5 h-5 text-gray-600" />
              )}
            </div>
          </motion.button>
        ))}
      </div>
      
      {isLoadingColors && (
        <div className="flex items-center justify-center space-x-3 text-base text-gray-600 py-4">
          <div className="w-5 h-5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
          <span>Загружаем цвета...</span>
        </div>
      )}
    </div>
  );
};

// Компонент выбора цвета - горизонтальные кружки с правильными цветами
interface ColorPickerProps {
  colors: string[];
  selectedColor: string | null;
  onColorChange: (color: string) => void;
  selectedModel: string | null;
}

const ColorPicker = ({ colors, selectedColor, onColorChange, selectedModel }: ColorPickerProps) => {
  // Модель-специфичная карта цветов на основе реальных iPhone палитр
  const getColorMap = (model: string | null) => {
    const baseColors: { [key: string]: { name: string; hex: string } } = {
      // Основные цвета для старых моделей
      'G': { name: 'Золотой', hex: '#FFD700' },
      'R': { name: 'Красный', hex: '#FF0000' },
      'Bl': { name: 'Синий', hex: '#007AFF' },
      'Wh': { name: 'Белый', hex: '#FFFFFF' },
      'C': { name: 'Чёрный', hex: '#000000' },
      
      // Полные названия
      'Gold': { name: 'Золотой', hex: '#FFD700' },
      'Red': { name: 'Красный', hex: '#FF0000' },
      'Blue': { name: 'Синий', hex: '#007AFF' },
      'White': { name: 'Белый', hex: '#FFFFFF' },
      'Black': { name: 'Чёрный', hex: '#000000' },
      
      // Специальные цвета
      'Space Gray': { name: 'Серый космос', hex: '#1C1C1E' },
      'Silver': { name: 'Серебряный', hex: '#C0C0C0' },
      'Natural Titanium': { name: 'Натуральный титан', hex: '#8E8E93' },
      'Blue Titanium': { name: 'Синий титан', hex: '#007AFF' },
      'White Titanium': { name: 'Белый титан', hex: '#F2F2F7' },
      
      // Дополнительные цвета
      'Or': { name: 'Оранжевый', hex: '#FF9500' },
      'Gr': { name: 'Зелёный', hex: '#34C759' },
      'Pu': { name: 'Фиолетовый', hex: '#AF52DE' },
      'Pi': { name: 'Розовый', hex: '#FF2D92' },
      'Ye': { name: 'Жёлтый', hex: '#FFCC00' },
    };

    // iPhone 16 специфичные цвета (точные hex коды)
    if (model === '16') {
      return {
        ...baseColors,
        // Стандартные версии iPhone 16 / iPhone 16 Plus
        'Black': { name: 'Чёрный', hex: '#3C4042' },
        'White': { name: 'Белый', hex: '#FAFAFA' },
        'Teal': { name: 'Бирюзовый', hex: '#B0D4D2' },
        'Ultramarine': { name: 'Ультрамариновый', hex: '#9AADF6' },
        'Pink': { name: 'Розовый', hex: '#F2ADDA' },
        
        // Премиум-версии iPhone 16 Pro / Pro Max
        'Natural Titanium': { name: 'Натуральный титан', hex: '#C2BCB2' },
        'Desert Titanium': { name: 'Пустынный титан', hex: '#BFA48F' },
        'Black Titanium': { name: 'Чёрный титан', hex: '#3C3C3D' },
        'White Titanium': { name: 'Белый титан', hex: '#F2F1ED' },
        
        // Коды из БД для iPhone 16 (реальные коды из логов)
        'Bl': { name: 'Синий', hex: '#007AFF' },
        'G': { name: 'Золотой', hex: '#FFD700' },
        'R': { name: 'Красный', hex: '#FF0000' },
        'Wh': { name: 'Белый', hex: '#FFFFFF' },
        'Ult': { name: 'Ультрамариновый', hex: '#9AADF6' },
        'B': { name: 'Чёрный', hex: '#3C4042' },
        'W': { name: 'Белый', hex: '#FAFAFA' },
        'P': { name: 'Розовый', hex: '#F2ADDA' },
        'T': { name: 'Бирюзовый', hex: '#B0D4D2' },
        'NT': { name: 'Натуральный титан', hex: '#C2BCB2' },
        'DT': { name: 'Пустынный титан', hex: '#BFA48F' },
        'BT': { name: 'Чёрный титан', hex: '#3C3C3D' },
        'WT': { name: 'Белый титан', hex: '#F2F1ED' },
      };
    }

    // iPhone 17 специфичные цвета (точные hex коды)
    if (model === '17') {
      return {
        ...baseColors,
        // Базовая версия iPhone 17
        'Black': { name: 'Чёрный', hex: '#353839' },
        'White': { name: 'Белый', hex: '#F5F5F5' },
        'Lavender': { name: 'Лавандовый', hex: '#DFCEEA' },
        'Mist Blue': { name: 'Туманно-голубой', hex: '#96AED1' },
        'Sage': { name: 'Шалфей', hex: '#A9B689' },
        
        // iPhone 17 Air
        'Sky Blue': { name: 'Небесно-голубой', hex: '#AECDEB' },
        'Light Gold': { name: 'Светло-золотой', hex: '#E8D7B6' },
        'Cloud White': { name: 'Облачно-белый', hex: '#F9F9F9' },
        'Space Black': { name: 'Космически-чёрный', hex: '#2E2E2E' },
        
        // iPhone 17 Pro / Pro Max
        'Dark Blue': { name: 'Тёмно-синий', hex: '#0E2A4E' },
        'Cosmic Orange': { name: 'Космически-оранжевый', hex: '#FF6F1E' },
        
        // Коды из БД для iPhone 17 (реальные коды из логов)
        'Bk': { name: 'Чёрный', hex: '#353839' },
        'Db': { name: 'Тёмно-синий', hex: '#0E2A4E' },
        'Gy': { name: 'Серый', hex: '#8E8E93' },
        'Or': { name: 'Оранжевый', hex: '#FF6F1E' },
        'Wh': { name: 'Белый', hex: '#F5F5F5' },
        'L': { name: 'Лавандовый', hex: '#DFCEEA' },
        'MB': { name: 'Туманно-голубой', hex: '#96AED1' },
        'B': { name: 'Чёрный', hex: '#353839' },
        'W': { name: 'Белый', hex: '#F5F5F5' },
        'S': { name: 'Шалфей', hex: '#A9B689' },
        'SB': { name: 'Небесно-голубой', hex: '#AECDEB' },
        'LG': { name: 'Светло-золотой', hex: '#E8D7B6' },
        'CW': { name: 'Облачно-белый', hex: '#F9F9F9' },
        'CO': { name: 'Космически-оранжевый', hex: '#FF6F1E' },
      };
    }

    return baseColors;
  };

  const colorMap = getColorMap(selectedModel);

  // Логирование для отладки
  console.log('🎨 ColorPicker - модель:', selectedModel);
  console.log('🎨 ColorPicker - цвета из БД:', colors);
  console.log('🎨 ColorPicker - карта цветов:', colorMap);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-900 text-center">Цвет</h3>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {colors.map((color) => {
          const colorInfo = colorMap[color] || { 
            name: `Неизвестный (${color})`, 
            hex: '#808080' 
          };
          
          console.log(`🎨 Обрабатываем цвет: ${color} ->`, colorInfo);
          
          return (
            <motion.button
              key={color}
              onClick={() => onColorChange(color)}
              className={`relative transition-all duration-200 ${
                selectedColor === color ? 'scale-110' : 'hover:scale-105'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div 
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: colorInfo.hex }}
              />
              {selectedColor === color && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-[#2dc2c6] rounded-full flex items-center justify-center"
                >
                  <Check className="w-2 h-2 text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// Главный компонент
export default function OptimizedPhoneSelector() {
  const { setModel, setPrice } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const {
    models,
    variants,
    storages,
    colors,
    selectedDevice,
    selectedOptions,
    handleOptionSelect,
    isLoading: devicesLoading,
    isLoadingVariants: variantsLoading,
    isLoadingStorages: storagesLoading,
    isLoadingColors: colorsLoading,
    error
  } = useDevices();

  // Отдельные состояния загрузки для каждого блока
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [isLoadingStorages, setIsLoadingStorages] = useState(false);
  const [isLoadingColors, setIsLoadingColors] = useState(false);

  // Отслеживаем загрузку каждого блока
  useEffect(() => {
    // Показываем загрузку вариантов если:
    // 1. Выбрана модель И
    // 2. (Варианты еще не загружены ИЛИ загружается запрос)
    if (selectedOptions.model && (variants.length === 0 || variantsLoading)) {
      setIsLoadingVariants(true);
    } else {
      setIsLoadingVariants(false);
    }
  }, [selectedOptions.model, variants.length, variantsLoading]);

  useEffect(() => {
    // Показываем загрузку памяти если:
    // 1. Выбрана модель И
    // 2. (Вариантов нет ИЛИ выбран вариант) И
    // 3. (Память еще не загружена ИЛИ загружается запрос)
    const shouldShowStorage = !selectedOptions.model ? false : 
      variants.length <= 1 ? true : selectedOptions.variant !== undefined;
    
    if (shouldShowStorage && (storages.length === 0 || storagesLoading)) {
      setIsLoadingStorages(true);
    } else {
      setIsLoadingStorages(false);
    }
  }, [selectedOptions.model, selectedOptions.variant, variants.length, storages.length, storagesLoading]);

  useEffect(() => {
    // Показываем загрузку цветов если:
    // 1. Выбрана модель И память И
    // 2. (Цвета еще не загружены ИЛИ загружается запрос)
    if (selectedOptions.model && 
        selectedOptions.storage !== undefined && 
        (colors.length === 0 || colorsLoading)) {
      setIsLoadingColors(true);
    } else {
      setIsLoadingColors(false);
    }
  }, [selectedOptions.model, selectedOptions.storage, colors.length, colorsLoading]);

  // Мемоизированные обработчики для предотвращения перерендеров
  const handleModelChange = useCallback((model: string) => {
    try {
      handleOptionSelect('model', model);
    } catch (error) {
      console.error('Ошибка при выборе модели:', error);
    }
  }, [handleOptionSelect]);

  const handleVariantChange = useCallback((variant: string) => {
    try {
      handleOptionSelect('variant', variant);
    } catch (error) {
      console.error('Ошибка при выборе варианта:', error);
    }
  }, [handleOptionSelect]);

  const handleStorageChange = useCallback((storage: string) => {
    try {
      console.log('Выбираем память:', storage);
      handleOptionSelect('storage', storage);
    } catch (error) {
      console.error('Ошибка при выборе памяти:', error);
    }
  }, [handleOptionSelect]);

  const handleColorChange = useCallback((color: string) => {
    try {
      handleOptionSelect('color', color);
    } catch (error) {
      console.error('Ошибка при выборе цвета:', error);
    }
  }, [handleOptionSelect]);

  // Обновляем store при изменении выбора
  useEffect(() => {
    if (selectedDevice) {
      const fullModelName = `iPhone ${selectedOptions.model}${selectedOptions.variant ? ` ${selectedOptions.variant}` : ''}`;
      setModel(fullModelName);
      setPrice(selectedDevice.basePrice);
    }
  }, [selectedDevice, selectedOptions, setModel, setPrice]);

  const handleContinue = useCallback(async () => {
    if (!selectedDevice) return;
    
    setIsLoading(true);
    
    try {
      // Сохраняем выбор в sessionStorage
      const phoneSelection = {
        model: selectedOptions.model,
        variant: selectedOptions.variant,
        storage: selectedOptions.storage,
        color: selectedOptions.color,
        price: selectedDevice.basePrice
      };
      
      sessionStorage.setItem('phoneSelection', JSON.stringify(phoneSelection));
      sessionStorage.setItem('basePrice', selectedDevice.basePrice.toString());
      
      await new Promise(resolve => setTimeout(resolve, 300));
      router.push('/request/evaluation');
    } catch (error) {
      console.error('Ошибка при переходе:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDevice, selectedOptions, router]);

  // Мемоизированные условия для предотвращения лишних перерендеров
  const canContinue = useMemo(() => {
    // Можем продолжить только если:
    // 1. Выбрана модель И
    // 2. Выбрана конкретная память (не null) И
    // 3. Выбран конкретный цвет (не null)
    if (!selectedOptions.model) return false;
    if (selectedOptions.storage === null || selectedOptions.storage === undefined) return false;
    if (selectedOptions.color === null || selectedOptions.color === undefined) return false;
    
    return true;
  }, [selectedOptions.model, selectedOptions.storage, selectedOptions.color]);

  const showVariant = useMemo(() => 
    selectedOptions.model && variants.length > 1,
    [selectedOptions.model, variants.length]
  );

  const showStorage = useMemo(() => {
    // Память показываем только если:
    // 1. Выбрана модель (не null) И
    // 2. (Вариантов нет ИЛИ выбран конкретный вариант)
    if (!selectedOptions.model) return false;
    
    // Если вариантов нет - показываем память сразу
    if (variants.length === 0) return true;
    
    // Если вариантов несколько - показываем память только после выбора конкретного варианта
    if (variants.length > 1) {
      return selectedOptions.variant !== null && selectedOptions.variant !== undefined;
    }
    
    // Если вариант только один - показываем память сразу
    return true;
  }, [selectedOptions.model, selectedOptions.variant, variants.length]);

  const showColor = useMemo(() => {
    // Цвет показываем только если:
    // 1. Выбрана модель И
    // 2. Выбрана конкретная память (не null)
    if (!selectedOptions.model) return false;
    
    return selectedOptions.storage !== null && selectedOptions.storage !== undefined;
  }, [selectedOptions.model, selectedOptions.storage]);


  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-sm">Ошибка загрузки: {error.message}</p>
          <Button onClick={() => window.location.reload()} size="sm">
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col pt-4 overflow-hidden">
      <div className="flex-1 p-3 pt-2 flex items-center justify-center">
        <div className="w-full max-w-lg mx-auto flex flex-col gap-8 pb-4 items-center text-center">
        {/* Селекторы */}
        <div className="w-full space-y-8">
          {/* Модель */}
          <ModelPicker
            models={models}
            selectedModel={selectedOptions.model}
            onModelChange={handleModelChange}
            isLoadingVariants={isLoadingVariants}
          />

          {/* Вариант */}
          <AnimatePresence>
            {showVariant && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <VariantPicker
                  variants={variants}
                  selectedVariant={selectedOptions.variant}
                  onVariantChange={handleVariantChange}
                  isLoadingStorages={isLoadingStorages}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Память */}
          <AnimatePresence>
            {showStorage && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <StoragePicker
                  storages={storages}
                  selectedStorage={selectedOptions.storage}
                  onStorageChange={handleStorageChange}
                  isLoadingColors={isLoadingColors}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Цвет */}
          <AnimatePresence>
            {showColor && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <ColorPicker
                  colors={colors}
                  selectedColor={selectedOptions.color}
                  onColorChange={handleColorChange}
                  selectedModel={selectedOptions.model}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Итоговая информация */}
        <AnimatePresence>
          {selectedDevice && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="w-full p-5 bg-white rounded-2xl border border-gray-200 shadow-sm"
            >
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  iPhone {selectedOptions.model}{selectedOptions.variant ? ` ${selectedOptions.variant}` : ''} • {selectedOptions.storage}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

          {/* Кнопка продолжения */}
          <AnimatePresence>
            {canContinue && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="w-full"
              >
                <Button
                  onClick={handleContinue}
                  disabled={isLoading}
                  className="w-full bg-white hover:bg-gray-50 text-gray-800 hover:text-gray-900 py-5 rounded-2xl text-xl font-semibold shadow-xl border-2 border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      <span>Переходим...</span>
                    </div>
                  ) : (
                    <>
                      <span>Продолжить оценку</span>
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}