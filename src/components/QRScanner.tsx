'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Camera, X, AlertCircle } from 'lucide-react';
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
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      
      if (!videoRef.current) {
        setError('Видео элемент не найден');
        return;
      }

      // Проверяем доступность камеры
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        setError('Камера не найдена на устройстве');
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
        }
      );

      // Запускаем сканирование
      await qrScannerRef.current.start();
      setIsScanning(true);
      setHasPermission(true);
      
    } catch (err: any) {
      console.error('Ошибка при запуске сканера:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Доступ к камере запрещен. Разрешите доступ к камере в настройках браузера.');
        setHasPermission(false);
      } else if (err.name === 'NotFoundError') {
        setError('Камера не найдена');
        setHasPermission(false);
      } else {
        setError(`Ошибка: ${err.message}`);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-teal-500" />
            Сканирование QR кода
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
              <Button
                onClick={startScanning}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Попробовать снова
              </Button>
            </div>
          )}

          {!isScanning && hasPermission !== false && (
            <div className="text-center space-y-4">
              <div className="w-48 h-48 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <Camera className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">
                Наведите камеру на QR код заявки
              </p>
              <Button
                onClick={startScanning}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Начать сканирование
              </Button>
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
