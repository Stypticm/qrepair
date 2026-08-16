'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Check, ArrowRight, Loader2 } from 'lucide-react';
import { useAppStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useDevices } from '@/hooks/useDevices';
import { IPHONE_COLOR_MAP, getDeviceColor } from '@/config/colors';

// Компонент выбора модели
interface ModelPickerProps {
  models: string[];
  selectedModel: string | null;
  onModelChange: (model: string) => void;
  isLoading: boolean;
}

function ModelPicker({ models, selectedModel, onModelChange, isLoading }: ModelPickerProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white text-center">Модель</h3>
      
      <div className="max-h-48 overflow-y-auto scrollbar-hide border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1a1a1a]">
        <div className="space-y-1 p-1">
          {models.map((model) => (
            <motion.button
              key={model}
              onClick={() => onModelChange(model)}
              className={`w-full flex items-center justify-center space-x-2 p-3 rounded-md transition-all duration-200 ${
                selectedModel === model
                  ? 'bg-teal-500/10 border border-teal-500'
                  : 'hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-teal-400 rounded-md flex items-center justify-center">
                <Smartphone className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                iPhone {model}
              </span>
              {selectedModel === model && (
                <Check className="w-4 h-4 text-teal-500" />
              )}
            </motion.button>
          ))}
        </div>
      </div>
      
      {isLoading && (
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Загружаем варианты...</span>
        </div>
      )}
    </div>
  );
}

// Компонент выбора варианта
interface VariantPickerProps {
  variants: string[];
  selectedVariant: string | null;
  onVariantChange: (variant: string) => void;
  isLoading: boolean;
}

function VariantPicker({ variants, selectedVariant, onVariantChange, isLoading }: VariantPickerProps) {
  if (variants.length <= 1) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white text-center">Вариант</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {variants.map((variant) => (
          <motion.button
            key={variant}
            onClick={() => onVariantChange(variant)}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              selectedVariant === variant
                ? 'border-teal-500 bg-teal-500/10'
                : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] hover:border-gray-300 dark:hover:border-white/20'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {variant}
              </div>
              {selectedVariant === variant && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-1"
                >
                  <Check className="w-4 h-4 text-teal-500 mx-auto" />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
      
      {isLoading && (
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Загружаем память...</span>
        </div>
      )}
    </div>
  );
}

// Компонент выбора памяти
interface StoragePickerProps {
  storages: string[];
  selectedStorage: string | null;
  onStorageChange: (storage: string) => void;
  isLoading: boolean;
}

function StoragePicker({ storages, selectedStorage, onStorageChange, isLoading }: StoragePickerProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white text-center">Память</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {storages.map((storage) => (
          <motion.button
            key={storage}
            onClick={() => onStorageChange(storage)}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              selectedStorage === storage
                ? 'border-teal-500 bg-teal-500/10'
                : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] hover:border-gray-300 dark:hover:border-white/20'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-400 rounded-lg flex items-center justify-center mx-auto mb-2">
                <div className="text-white text-xs font-bold">
                  {storage.split(' ')[0]}
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {storage}
              </div>
              {selectedStorage === storage && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-1"
                >
                  <Check className="w-4 h-4 text-teal-500 mx-auto" />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
      
      {isLoading && (
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Загружаем цвета...</span>
        </div>
      )}
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
  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white text-center">Цвет</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {colors.map((color) => {
          const colorInfo = getDeviceColor(color);
          
          return (
            <motion.button
              key={color}
              onClick={() => onColorChange(color)}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                selectedColor === color
                  ? 'border-teal-500 bg-teal-500/10'
                  : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] hover:border-gray-300 dark:hover:border-white/20'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center">
                <div 
                  className="w-12 h-12 rounded-lg mx-auto mb-2 border-2 border-white dark:border-gray-700 shadow-sm"
                  style={{ backgroundColor: colorInfo.hex }}
                />
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {colorInfo.name}
                </div>
                {selectedColor === color && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-1"
                  >
                    <Check className="w-4 h-4 text-teal-500 mx-auto" />
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
export default function CompactPhoneSelector() {
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
      router.push('/buyback');
    } catch (error) {
      console.error('Ошибка при переходе:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDevice, selectedOptions, router]);

  const canContinue = selectedOptions.model && selectedOptions.storage && selectedOptions.color;

  if (devicesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-background dark:to-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Загружаем модели...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-background dark:to-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-sm">Ошибка загрузки моделей</p>
          <Button onClick={() => window.location.reload()} size="sm">
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-background dark:to-background">
      <div className="max-w-md mx-auto px-4 py-4">
        {/* Заголовок */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            Выберите iPhone
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Все модели из базы данных
          </p>
        </div>

        {/* Селекторы */}
        <div className="space-y-6">
          {/* Модель */}
          <ModelPicker
            models={models}
            selectedModel={selectedOptions.model}
            onModelChange={(model) => handleOptionSelect('model', model)}
            isLoading={variants.length === 0 && selectedOptions.model !== null}
          />

          {/* Вариант (Pro, Pro Max, Plus) */}
          <AnimatePresence>
            {selectedOptions.model && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <VariantPicker
                  variants={variants}
                  selectedVariant={selectedOptions.variant}
                  onVariantChange={(variant) => handleOptionSelect('variant', variant)}
                  isLoading={storages.length === 0 && selectedOptions.model !== null}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Память */}
          <AnimatePresence>
            {selectedOptions.model && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <StoragePicker
                  storages={storages}
                  selectedStorage={selectedOptions.storage}
                  onStorageChange={(storage) => handleOptionSelect('storage', storage)}
                  isLoading={colors.length === 0 && selectedOptions.storage !== null}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Цвет */}
          <AnimatePresence>
            {selectedOptions.model && selectedOptions.storage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ColorPicker
                  colors={colors}
                  selectedColor={selectedOptions.color}
                  onColorChange={(color) => handleOptionSelect('color', color)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Итоговая информация */}
        {selectedDevice && (
          <div className="mt-6 p-3 bg-white dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-white/10 shadow-sm">
            <div className="text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Выбранная конфигурация</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                iPhone {selectedOptions.model}{selectedOptions.variant ? ` ${selectedOptions.variant}` : ''} • {selectedOptions.storage}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Цена будет рассчитана после оценки состояния
              </div>
            </div>
          </div>
        )}

        {/* Кнопка продолжения */}
        {canContinue && (
          <div className="mt-4">
            <Button
              onClick={handleContinue}
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Переходим...</span>
                </div>
              ) : (
                <>
                  <span>Продолжить оценку</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
