'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Camera, X, AlertCircle, Upload } from 'lucide-react';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  onScanSuccess: (skupkaId: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    // Инициализируем Telegram WebApp если доступен
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      
      // Проверяем, находимся ли мы в Telegram WebApp
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.showScanQrPopup) {
        // Используем встроенный сканер Telegram WebApp
        window.Telegram.WebApp.showScanQrPopup(
          {
            text: 'Наведите камеру на QR код заявки'
          },
          (text: string) => {
            // Обрабатываем результат сканирования
            try {
              // Парсим JSON из QR кода
              const qrData = JSON.parse(text);
              
              if (qrData.skupkaId) {
                onScanSuccess(qrData.skupkaId);
              } else {
                setError('QR код не содержит ID заявки');
              }
            } catch (parseError) {
              // Если не JSON, пробуем как простой ID
              if (text && text.trim()) {
                onScanSuccess(text.trim());
              } else {
                setError('Неверный формат QR кода');
              }
            }
          }
        );
        return;
      }

      // Fallback для обычного браузера
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!videoRef.current) {
        setError('Видео элемент не найден. Используйте загрузку файла.');
        setHasPermission(false);
        return;
      }

      // Проверяем доступность камеры
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        setError('Камера не найдена на устройстве. Используйте загрузку файла.');
        setHasPermission(false);
        return;
      }

      // Создаем QR сканер
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          try {
            // Парсим JSON из QR кода
            const qrData = JSON.parse(result.data);
            
            if (qrData.skupkaId) {
              setIsScanning(false);
              qrScannerRef.current?.stop();
              onScanSuccess(qrData.skupkaId);
            } else {
              setError('QR код не содержит ID заявки');
            }
          } catch (parseError) {
            // Если не JSON, пробуем как простой ID
            if (result.data && result.data.trim()) {
              setIsScanning(false);
              qrScannerRef.current?.stop();
              onScanSuccess(result.data.trim());
            } else {
              setError('Неверный формат QR кода');
            }
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
        }
      );

      // Запускаем сканирование
      await qrScannerRef.current.start();
      setIsScanning(true);
      setHasPermission(true);
      
    } catch (err: any) {
      console.error('Ошибка при запуске сканера:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Доступ к камере запрещен. Используйте загрузку файла.');
        setHasPermission(false);
      } else if (err.name === 'NotFoundError') {
        setError('Камера не найдена. Используйте загрузку файла.');
        setHasPermission(false);
      } else if (err.message?.includes('video element')) {
        setError('Ошибка инициализации видео. Используйте загрузку файла.');
        setHasPermission(false);
      } else {
        setError(`Ошибка: ${err.message}. Используйте загрузку файла.`);
        setHasPermission(false);
      }
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const result = await QrScanner.scanImage(file);
      
      try {
        // Парсим JSON из QR кода
        const qrData = JSON.parse(result);
        
        if (qrData.skupkaId) {
          onScanSuccess(qrData.skupkaId);
        } else {
          setError('QR код не содержит ID заявки');
        }
      } catch (parseError) {
        // Если не JSON, пробуем как простой ID
        if (result && result.trim()) {
          onScanSuccess(result.trim());
        } else {
          setError('Неверный формат QR кода');
        }
      }
    } catch (err: any) {
      console.error('Ошибка при сканировании файла:', err);
      setError('Не удалось распознать QR код в файле');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-teal-500" />
            Загрузка QR кода
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {hasPermission === false && (
            <div className="text-center space-y-4">
              <div className="text-gray-600">
                <p className="text-sm mb-2">Для сканирования QR кода нужен доступ к камере</p>
                <p className="text-xs text-gray-500">
                  Разрешите доступ к камере в настройках браузера и попробуйте снова
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={startScanning}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Попробовать снова
                </Button>
                <div className="text-center text-gray-500 text-sm">или</div>
                <label className="w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="w-full border-teal-500 text-teal-500 hover:bg-teal-50"
                    asChild
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Загрузить фото QR кода
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          )}

          {!isScanning && hasPermission !== false && (
            <div className="text-center space-y-4">
              <div className="w-48 h-48 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <QrCode className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">
                Загрузите фото QR кода заявки
              </p>
              <label className="w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Загрузить фото QR кода
                  </span>
                </Button>
              </label>
            </div>
          )}

          {isScanning && (
            <div className="space-y-4">
              <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <div className="absolute inset-0 border-2 border-teal-500 rounded-lg pointer-events-none">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-teal-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-teal-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-teal-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-teal-500 rounded-br-lg"></div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Наведите камеру на QR код
                </p>
                <Button
                  onClick={stopScanning}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Остановить сканирование
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
