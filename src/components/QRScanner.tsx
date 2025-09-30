'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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
  const [isTelegramScanner, setIsTelegramScanner] = useState(false);

  const handleScanResult = (result: QrScanner.ScanResult | string) => {
    const scanData = typeof result === 'string' ? result : result.data;
    try {
      // Парсим JSON из QR кода
      const qrData = JSON.parse(scanData);
      if (qrData.skupkaId) {
        onScanSuccess(qrData.skupkaId);
      } else {
        setError('QR код не содержит ID заявки');
      }
    } catch (parseError) {
      // Если не JSON, пробуем как простой ID
      if (scanData && scanData.trim()) {
        onScanSuccess(scanData.trim());
      } else {
        setError('Неверный формат QR кода');
      }
    }
  };

  const startTelegramScanner = useCallback(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.showScanQrPopup) {
      setIsTelegramScanner(true);
      window.Telegram.WebApp.showScanQrPopup(
        { text: 'Наведите камеру на QR код заявки' },
        (text: string) => {
          if (text) {
            handleScanResult(text);
            onClose(); // Закрываем компонент после сканирования
            return true;
          }
          onClose(); // Закрываем, даже если сканирование отменено
          return false;
        }
      );
      return true;
    }
    return false;
  }, [onScanSuccess, onClose]);

  const startWebScanner = useCallback(async () => {
    if (!videoRef.current) {
      console.log("videoRef is not available yet, waiting...");
      // Дадим React время отрендерить video элемент
      setTimeout(startWebScanner, 100);
      return;
    }
    try {
      setError(null);
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        setError('Камера не найдена. Выберите фото QR из галереи.');
        setHasPermission(false);
        return;
      }

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        handleScanResult,
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
        }
      );

      await qrScannerRef.current.start();
      setIsScanning(true);
      setHasPermission(true);
    } catch (err: any) {
      console.error('Ошибка при запуске сканера:', err);
      if (err.name === 'NotAllowedError') {
        setError('Доступ к камере запрещен. Используйте загрузку файла.');
      } else if (err.name === 'NotFoundError') {
        setError('Камера не найдена. Используйте загрузку файла.');
      } else {
        setError(`Ошибка: ${err.message}. Используйте загрузку файла.`);
      }
      setHasPermission(false);
    }
  }, [handleScanResult]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }

    if (!startTelegramScanner()) {
      startWebScanner();
    }

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, [startTelegramScanner, startWebScanner]);

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
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
      const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
      handleScanResult(result);
    } catch (err: any) {
      console.error('Ошибка при сканировании файла:', err);
      setError('Не удалось распознать QR код в файле');
    }
  };

  if (isTelegramScanner) {
    return null; // Не рендерим ничего, если используется сканер Telegram
  }

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

          <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            {isScanning && (
              <div className="absolute inset-0 border-2 border-teal-500 rounded-lg pointer-events-none">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-teal-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-teal-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-teal-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-teal-500 rounded-br-lg"></div>
              </div>
            )}
            {!isScanning && hasPermission !== false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black bg-opacity-50">
                    <QrCode className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-300">Подготовка камеры…</p>
                </div>
            )}
          </div>

          {hasPermission === false && (
            <div className="text-center space-y-2">
              <Button
                onClick={startWebScanner}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Попробовать снова
              </Button>
              <div className="text-center text-gray-500 text-sm">или</div>
            </div>
          )}

          <div className="space-y-2">
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
            {isScanning && (
              <Button
                onClick={stopScanning}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Остановить
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
