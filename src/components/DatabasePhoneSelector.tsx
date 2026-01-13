'use client';

import { useState, useEffect, useCallback } from 'react';
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
}

function ModelPicker({ models, selectedModel, onModelChange }: ModelPickerProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 text-center">Модель</h3>
      
      <div className="max-h-64 overflow-y-auto scrollbar-hide border-2 border-gray-200 rounded-xl bg-white">
        <div className="space-y-1 p-2">
          {models.map((model) => (
            <motion.button
              key={model}
              onClick={() => onModelChange(model)}
              className={`w-full flex items-center justify-center space-x-3 p-4 rounded-lg transition-all duration-200 ${
                selectedModel === model
                  ? 'bg-[#2dc2c6]/10 border-2 border-[#2dc2c6]'
                  : 'hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#2dc2c6] to-[#4fd1d5] rounded-lg flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                iPhone {model}
              </span>
              {selectedModel === model && (
                <Check className="w-4 h-4 text-[#2dc2c6]" />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Компонент выбора варианта (Pro, Pro Max, Plus)
interface VariantPickerProps {
  variants: string[];
  selectedVariant: string | null;
  onVariantChange: (variant: string) => void;
}

function VariantPicker({ variants, selectedVariant, onVariantChange }: VariantPickerProps) {
  if (variants.length <= 1) return null; // Скрываем если только один вариант

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 text-center">Вариант</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {variants.map((variant) => (
          <motion.button
            key={variant}
            onClick={() => onVariantChange(variant)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedVariant === variant
                ? 'border-[#2dc2c6] bg-[#2dc2c6]/10'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900">
                {variant}
              </div>
              {selectedVariant === variant && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-2"
                >
                  <Check className="w-5 h-5 text-[#2dc2c6] mx-auto" />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Компонент выбора памяти
interface StoragePickerProps {
  storages: string[];
  selectedStorage: string | null;
  onStorageChange: (storage: string) => void;
}

function StoragePicker({ storages, selectedStorage, onStorageChange }: StoragePickerProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 text-center">Память</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {storages.map((storage) => (
          <motion.button
            key={storage}
            onClick={() => onStorageChange(storage)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedStorage === storage
                ? 'border-[#2dc2c6] bg-[#2dc2c6]/10'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2dc2c6] to-[#4fd1d5] rounded-xl flex items-center justify-center mx-auto mb-3">
                <div className="text-white text-sm font-bold">
                  {storage.split(' ')[0]}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {storage}
              </div>
              {selectedStorage === storage && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-2"
                >
                  <Check className="w-5 h-5 text-[#2dc2c6] mx-auto" />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Компонент выбора цвета
interface ColorPickerProps {
  colors: string[];
  selectedColor: string | null;
  onColorChange: (color: string) => void;
}

function ColorPicker({ colors, selectedColor, onColorChange }: ColorPickerProps) {
  const colorMap: { [key: string]: { name: string; hex: string } } = {
    'G': { name: 'Золотой', hex: '#FFD700' },
    'R': { name: 'Красный', hex: '#FF0000' },
    'Bl': { name: 'Синий', hex: '#007AFF' },
    'Wh': { name: 'Белый', hex: '#FFFFFF' },
    'C': { name: 'Чёрный', hex: '#000000' },
    'Gold': { name: 'Золотой', hex: '#FFD700' },
    'Red': { name: 'Красный', hex: '#FF0000' },
    'Blue': { name: 'Синий', hex: '#007AFF' },
    'White': { name: 'Белый', hex: '#FFFFFF' },
    'Black': { name: 'Чёрный', hex: '#000000' },
    'Space Gray': { name: 'Серый космос', hex: '#1C1C1E' },
    'Silver': { name: 'Серебряный', hex: '#C0C0C0' },
    'Natural Titanium': { name: 'Натуральный титан', hex: '#8E8E93' },
    'Blue Titanium': { name: 'Синий титан', hex: '#007AFF' },
    'White Titanium': { name: 'Белый титан', hex: '#F2F2F7' },
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 text-center">Цвет</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {colors.map((color) => {
          const colorInfo = colorMap[color] || { name: color, hex: '#808080' };
          
          return (
            <motion.button
              key={color}
              onClick={() => onColorChange(color)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedColor === color
                  ? 'border-[#2dc2c6] bg-[#2dc2c6]/10'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-2xl mx-auto mb-3 border-4 border-white shadow-lg"
                  style={{ backgroundColor: colorInfo.hex }}
                />
                <div className="text-sm font-semibold text-gray-900">
                  {colorInfo.name}
                </div>
                {selectedColor === color && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-2"
                  >
                    <Check className="w-5 h-5 text-[#2dc2c6] mx-auto" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Главный компонент
export default function DatabasePhoneSelector() {
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
    error
  } = useDevices();

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
      
      await new Promise(resolve => setTimeout(resolve, 300));
      router.push('/request/evaluation');
    } catch (error) {
      console.error('Ошибка при переходе:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDevice, selectedOptions, router]);

  const canContinue = selectedOptions.model && selectedOptions.storage && selectedOptions.color;

  if (devicesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#2dc2c6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загружаем модели...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Ошибка загрузки моделей</p>
          <Button onClick={() => window.location.reload()}>
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Выберите iPhone
          </h1>
          <p className="text-gray-600 text-sm">
            Все модели из базы данных
          </p>
        </div>

        {/* Селекторы */}
        <div className="space-y-8">
          {/* Модель */}
          <ModelPicker
            models={models}
            selectedModel={selectedOptions.model}
            onModelChange={(model) => handleOptionSelect('model', model)}
          />

          {/* Вариант (Pro, Pro Max, Plus) */}
          {selectedOptions.model && (
            <VariantPicker
              variants={variants}
              selectedVariant={selectedOptions.variant}
              onVariantChange={(variant) => handleOptionSelect('variant', variant)}
            />
          )}

          {/* Память */}
          {selectedOptions.model && (
            <StoragePicker
              storages={storages}
              selectedStorage={selectedOptions.storage}
              onStorageChange={(storage) => handleOptionSelect('storage', storage)}
            />
          )}

          {/* Цвет */}
          {selectedOptions.model && selectedOptions.storage && (
            <ColorPicker
              colors={colors}
              selectedColor={selectedOptions.color}
              onColorChange={(color) => handleOptionSelect('color', color)}
            />
          )}
        </div>

        {/* Итоговая информация */}
        {selectedDevice && (
          <div className="mt-8 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Выбранная конфигурация</div>
              <div className="text-lg font-semibold text-gray-900">
                iPhone {selectedOptions.model}{selectedOptions.variant ? ` ${selectedOptions.variant}` : ''} • {selectedOptions.storage}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Цена будет рассчитана после оценки состояния
              </div>
            </div>
          </div>
        )}

        {/* Кнопка продолжения */}
        {canContinue && (
          <div className="mt-6">
            <Button
              onClick={handleContinue}
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-[#2dc2c6] to-[#4fd1d5] hover:from-[#25a8ac] hover:to-[#39c4c8] text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Переходим...</span>
                </div>
              ) : (
                <>
                  <span>Продолжить оценку</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}