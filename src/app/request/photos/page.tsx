'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Page } from '@/components/Page';
import { useStepNavigation } from '@/hooks/useStepNavigation';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Flashlight, 
  FlashlightOff, 
  RotateCcw
} from 'lucide-react';
import { useAppStore } from '@/stores/authStore';

interface PhotoRequirement {
  id: string;
  title: string;
  description: string;
  icon: string;
  required: boolean;
}

const PHOTO_REQUIREMENTS: PhotoRequirement[] = [
  {
    id: 'front',
    title: 'Фронтальная панель',
    description: 'Лицевая сторона устройства',
    icon: 'front',
    required: true
  },
  {
    id: 'back',
    title: 'Задняя панель',
    description: 'Тыльная сторона устройства',
    icon: 'back',
    required: true
  },
  {
    id: 'sides',
    title: 'Торцы',
    description: 'Боковые стороны устройства',
    icon: 'sides',
    required: true
  },
  {
    id: 'serial',
    title: 'Серийный номер',
    description: 'Экран с настройками устройства',
    icon: 'serial',
    required: true
  },
  {
    id: 'damage',
    title: 'Дефекты',
    description: 'Крупным планом царапины и повреждения',
    icon: 'damage',
    required: false
  }
];

interface PhotoState {
  [key: string]: {
    blob: Blob | null;
    url: string | null;
    isValid: boolean;
  };
}

export default function PhotosPage() {
  const router = useRouter();
  const { goBack } = useStepNavigation();
  const { setCurrentStep } = useAppStore();
  
  const [canTakePhotos, setCanTakePhotos] = useState<boolean | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photoStates, setPhotoStates] = useState<PhotoState>({});
  const [isCapturing, setIsCapturing] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setCurrentStep('photos');
    
    // Инициализируем состояния фото
    const initialStates: PhotoState = {};
    PHOTO_REQUIREMENTS.forEach(req => {
      initialStates[req.id] = {
        blob: null,
        url: null,
        isValid: false
      };
    });
    setPhotoStates(initialStates);
  }, [setCurrentStep]);

  const checkTorchSupport = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length > 0) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: videoDevices[0].deviceId,
            facingMode: 'environment'
          }
        });
        
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities ? track.getCapabilities() : ({} as any);
        // Некоторые типы TypeScript не знают про capabilities.torch
        const hasTorch = capabilities && typeof capabilities === 'object' && 'torch' in (capabilities as any)
          ? Boolean((capabilities as any).torch)
          : false;
        setTorchSupported(hasTorch);
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      console.log('Torch не поддерживается:', error);
      setTorchSupported(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      await checkTorchSupport();
    } catch (error) {
      console.error('Ошибка доступа к камере:', error);
    }
  }, [checkTorchSupport]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return;
    
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    
    try {
      // torch - экспериментальная функция, используем type assertion
      await track.applyConstraints({
        advanced: [{ torch: !torchEnabled } as any]
      });
      setTorchEnabled(!torchEnabled);
    } catch (error) {
      console.log('Не удалось переключить фонарик:', error);
    }
  }, [torchEnabled]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Устанавливаем размеры canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Рисуем кадр
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Проверяем попадание в рамку (простая проверка заполненности)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let filledPixels = 0;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Проверяем, что пиксель не черный (пустой)
        if (r > 10 || g > 10 || b > 10) {
          filledPixels++;
        }
      }
      
      const fillRatio = filledPixels / (data.length / 4);
      const isValid = fillRatio > 0.7; // Минимум 70% заполнения
      
      // Конвертируем в blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/jpeg', 0.8);
      });
      
      const url = URL.createObjectURL(blob);
      const currentReq = PHOTO_REQUIREMENTS[currentPhotoIndex];
      
      setPhotoStates(prev => ({
        ...prev,
        [currentReq.id]: {
          blob,
          url,
          isValid
        }
      }));
      
      // Переходим к следующему фото
      if (currentPhotoIndex < PHOTO_REQUIREMENTS.length - 1) {
        setCurrentPhotoIndex(currentPhotoIndex + 1);
      }
      
    } catch (error) {
      console.error('Ошибка при съёмке:', error);
    } finally {
      setIsCapturing(false);
    }
  }, [currentPhotoIndex]);

  const retakePhoto = useCallback(() => {
    const currentReq = PHOTO_REQUIREMENTS[currentPhotoIndex];
    setPhotoStates(prev => ({
      ...prev,
      [currentReq.id]: {
        blob: null,
        url: null,
        isValid: false
      }
    }));
  }, [currentPhotoIndex]);

  const handleCanTakePhotos = useCallback((canTake: boolean) => {
    setCanTakePhotos(canTake);
    
    if (canTake) {
      startCamera();
    }
  }, [startCamera]);

  const handleSkip = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Сохраняем фото в storage (заглушка)
      const photoUrls: string[] = [];
      Object.values(photoStates).forEach(state => {
        if (state.url) {
          photoUrls.push(state.url);
        }
      });
      
      // Сохраняем в sessionStorage
      sessionStorage.setItem('devicePhotos', JSON.stringify(photoUrls));
      
      // Определяем следующий шаг на основе выбранного способа доставки
      const deliveryOptionsData = sessionStorage.getItem('deliveryOptionsData');
      let nextStep = 'final';
      let nextPath = '/request/final';
      
      if (deliveryOptionsData) {
        try {
          const parsed = JSON.parse(deliveryOptionsData);
          if (parsed.selectedOption === 'pickup') {
            nextStep = 'final';
            nextPath = '/request/final';
          } else if (parsed.selectedOption === 'courier') {
            nextStep = 'final';
            nextPath = '/request/final';
          }
        } catch (e) {
          console.error('Ошибка при парсинге deliveryOptionsData:', e);
        }
      }
      
      // Переходим к следующему шагу
      setCurrentStep(nextStep);
      router.push(nextPath);
      
    } catch (error) {
      console.error('Ошибка при сохранении фото:', error);
    } finally {
      setIsLoading(false);
    }
  }, [photoStates, setCurrentStep, router]);

  const handleContinue = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Сохраняем фото в storage
      const photoUrls: string[] = [];
      Object.values(photoStates).forEach(state => {
        if (state.url) {
          photoUrls.push(state.url);
        }
      });
      
      // Сохраняем в sessionStorage
      sessionStorage.setItem('devicePhotos', JSON.stringify(photoUrls));
      
      // Определяем следующий шаг на основе выбранного способа доставки
      const deliveryOptionsData = sessionStorage.getItem('deliveryOptionsData');
      let nextStep = 'final';
      let nextPath = '/request/final';
      
      if (deliveryOptionsData) {
        try {
          const parsed = JSON.parse(deliveryOptionsData);
          if (parsed.selectedOption === 'pickup') {
            nextStep = 'final';
            nextPath = '/request/final';
          } else if (parsed.selectedOption === 'courier') {
            nextStep = 'final';
            nextPath = '/request/final';
          }
        } catch (e) {
          console.error('Ошибка при парсинге deliveryOptionsData:', e);
        }
      }
      
      // Переходим к следующему шагу
      setCurrentStep(nextStep);
      router.push(nextPath);
      
    } catch (error) {
      console.error('Ошибка при сохранении фото:', error);
    } finally {
      setIsLoading(false);
    }
  }, [photoStates, setCurrentStep, router]);

  const currentRequirement = PHOTO_REQUIREMENTS[currentPhotoIndex];
  const completedPhotos = Object.values(photoStates).filter(state => state.url).length;
  const canContinue = completedPhotos >= PHOTO_REQUIREMENTS.filter(req => req.required).length;

  // Если пользователь ещё не ответил на вопрос
  if (canTakePhotos === null) {
    return (
      <Page back={goBack}>
        <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col pt-4 overflow-hidden">
          <div className="flex-1 p-3 pt-2 flex items-center justify-center">
            <div className="w-full max-w-md mx-auto flex flex-col gap-6 pb-4 items-center text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Фотографии устройства
                </h2>
                <p className="text-gray-600">
                  Можете ли вы сделать фотографии вашего устройства?
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="w-full flex flex-col gap-4"
              >
                <Button
                  onClick={() => handleCanTakePhotos(true)}
                  className="w-full h-16 bg-white hover:bg-gray-50 text-gray-800 hover:text-gray-900 rounded-2xl text-lg font-semibold shadow-xl border-2 border-gray-200 hover:border-gray-300"
                >
                  Да, могу сделать фото
                </Button>
                
                <Button
                  onClick={() => handleCanTakePhotos(false)}
                  className="w-full h-16 bg-white hover:bg-gray-50 text-gray-800 hover:text-gray-900 rounded-2xl text-lg font-semibold shadow-xl border-2 border-gray-200 hover:border-gray-300"
                >
                  Пропустить этот шаг
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </Page>
    );
  }

  // Если пользователь не может делать фото
  if (canTakePhotos === false) {
    return (
      <Page back={goBack}>
        <div className="w-full h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col pt-4 overflow-hidden">
          <div className="flex-1 p-3 pt-2 flex items-center justify-center">
            <div className="w-full max-w-md mx-auto flex flex-col gap-6 pb-4 items-center text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Шаг пропущен
                </h2>
                <p className="text-gray-600">
                  Вы пропустили фотографирование. Оценка будет произведена 
                  на основе других данных.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Button
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="w-full h-16 bg-white hover:bg-gray-50 text-gray-800 hover:text-gray-900 rounded-2xl text-lg font-semibold shadow-xl border-2 border-gray-200 hover:border-gray-300 disabled:opacity-50"
                >
                  {isLoading ? 'Продолжаем...' : 'Продолжить'}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </Page>
    );
  }

  // Интерфейс съёмки фото
  return (
    <Page back={goBack}>
      <div className="min-h-screen bg-black">
        {/* Камера */}
        <div className="relative h-screen">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          
          {/* Рамка для фото */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-96 border-4 border-white border-dashed rounded-2xl flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-lg font-semibold mb-2">
                  {currentRequirement.title}
                </div>
                <div className="text-sm opacity-80">
                  {currentRequirement.description}
                </div>
              </div>
            </div>
          </div>
          
          {/* Индикатор прогресса */}
          <div className="absolute top-4 left-4 right-4">
            <div className="bg-black bg-opacity-50 rounded-full p-2">
              <div className="flex items-center justify-between text-white text-sm">
                <span>{currentPhotoIndex + 1} из {PHOTO_REQUIREMENTS.length}</span>
                <span>{Math.round((completedPhotos / PHOTO_REQUIREMENTS.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedPhotos / PHOTO_REQUIREMENTS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Кнопки управления */}
          <div className="absolute bottom-8 left-4 right-4">
            <div className="flex items-center justify-between mb-4">
              {/* Фонарик */}
              {torchSupported && (
                <Button
                  onClick={toggleTorch}
                  className={`w-12 h-12 rounded-full ${
                    torchEnabled 
                      ? 'bg-yellow-500 hover:bg-yellow-600' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {torchEnabled ? (
                    <Flashlight className="w-6 h-6 text-white" />
                  ) : (
                    <FlashlightOff className="w-6 h-6 text-white" />
                  )}
                </Button>
              )}
              
              {/* Переснять */}
              {photoStates[currentRequirement.id]?.url && (
                <Button
                  onClick={retakePhoto}
                  className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-700"
                >
                  <RotateCcw className="w-6 h-6 text-white" />
                </Button>
              )}
            </div>
            
            {/* Кнопка съёмки */}
            <div className="flex justify-center">
              <Button
                onClick={capturePhoto}
                disabled={isCapturing}
                className="w-16 h-16 rounded-full bg-white hover:bg-gray-100 shadow-lg"
              >
                {isCapturing ? (
                  <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-800" />
                )}
              </Button>
            </div>
            
            {/* Кнопка продолжения */}
            {canContinue && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Button
                  onClick={handleContinue}
                  disabled={isLoading}
                  className="w-full h-12 bg-white hover:bg-gray-100 text-gray-800 hover:text-gray-900 rounded-2xl font-semibold shadow-xl border-2 border-gray-200 hover:border-gray-300 disabled:opacity-50"
                >
                  {isLoading ? 'Сохраняем...' : 'Готово'}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Скрытый canvas для обработки фото */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </Page>
  );
}
