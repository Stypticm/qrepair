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
            return true;
          }
          onClose();
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

    if (startTelegramScanner()) {
        onClose();
    } else {
      startWebScanner();
    }

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, [startTelegramScanner, startWebScanner, onClose]);

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
    <div className="fixed inset-0 bg-black z-50">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
      />
      <div className="absolute inset-0 bg-black bg-opacity-25" />

      {isScanning && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border-4 border-white rounded-lg" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }} />
        </div>
      )}

      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="text-white bg-black bg-opacity-50 rounded-full w-12 h-12"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {error && (
        <div className="absolute bottom-16 left-4 right-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4">
        <label className="w-full">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            className="w-full bg-white bg-opacity-20 text-white hover:bg-opacity-30 border-none"
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
  );
}
