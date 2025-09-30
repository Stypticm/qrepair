'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Upload, X } from 'lucide-react';
import QrScanner from 'qr-scanner';
import { openQrScanner, closeQrScanner, isQrScannerOpened } from '@telegram-apps/sdk';

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

  const handleScanResult = useCallback(
    (result: QrScanner.ScanResult | string) => {
      const scanData = typeof result === 'string' ? result : result.data;
      console.log('Отсканирован QR:', scanData);
      try {
        // Парсим JSON из QR кода
        const qrData = JSON.parse(scanData);
        if (qrData.skupkaId) {
          console.log('Успешно извлечён skupkaId:', qrData.skupkaId);
          onScanSuccess(qrData.skupkaId);
          closeQrScanner();
          onClose();
        } else {
          setError('QR код не содержит ID заявки');
        }
      } catch (parseError) {
        // Если не JSON, пробуем как простой ID
        if (scanData && scanData.trim()) {
          console.log('Успешно извлечён текстовый ID:', scanData.trim());
          onScanSuccess(scanData.trim());
          closeQrScanner();
          onClose();
        } else {
          setError('Неверный формат QR кода');
        }
      }
    },
    [onScanSuccess, onClose]
  );

  const startTelegramScanner = useCallback(async () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      console.log('Попытка открыть Telegram QR Scanner...');
      setIsTelegramScanner(true);
      try {
        let usedSdk = false;
        if (openQrScanner.isAvailable()) {
          const result = await openQrScanner({
            text: 'Наведите камеру на QR код заявки',
            capture: (qr: string) => {
              console.log('Telegram QR Scanner: отсканирован QR:', qr);
              handleScanResult(qr);
              return true; // Закрываем попап после успешного сканирования
            },
          });
          console.log('Telegram QR Scanner: результат:', result);
          if (result === null) {
            console.log('Telegram QR Scanner: попап закрыт без результата');
            setIsTelegramScanner(false);
            onClose();
          }
          usedSdk = true;
          return true;
        }

        // Fallback: нативный WebApp API
        if (window.Telegram.WebApp.showScanQrPopup) {
          window.Telegram.WebApp.showScanQrPopup(
            { text: 'Наведите камеру на QR код заявки' },
            (text: string) => {
              console.log('WebApp.showScanQrPopup: отсканирован QR:', text);
              handleScanResult(text);
              return true as any;
            }
          );
          return true;
        }

        // Ничего не доступно
        setIsTelegramScanner(false);
        return false;
      } catch (err) {
        console.error('Ошибка Telegram QR Scanner:', err);
        setError('Не удалось открыть сканер Telegram. Переключаемся на веб-сканер.');
        setIsTelegramScanner(false);
        return false;
      }
    } else {
      console.warn('Telegram Web App или openQrScanner недоступны');
      return false;
    }
  }, [handleScanResult, onClose]);

  const startWebScanner = useCallback(async () => {
    if (!videoRef.current) {
      console.log('videoRef недоступен, ждём...');
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

      // Проверка доступа к камере
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        stream.getTracks().forEach((track) => track.stop());
        console.log('Доступ к камере получен');
      } catch (err: any) {
        console.error('Ошибка доступа к камере:', err);
        setError('Доступ к камере запрещен. Используйте загрузку файла.');
        setHasPermission(false);
        return;
      }

      // Критичные атрибуты для мобильных WebView (iOS/Android)
      try {
        videoRef.current.setAttribute('playsinline', 'true');
        // @ts-ignore
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.muted = true;
      } catch {}

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
      // Явная попытка запустить воспроизведение (для некоторых WebView это обязательно)
      try { await videoRef.current.play(); } catch (e) { console.warn('video.play() rejected:', e); }
      setIsScanning(true);
      setHasPermission(true);
      console.log('Веб-сканер успешно запущен');
    } catch (err: any) {
      console.error('Ошибка при запуске веб-сканера:', err);
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
      console.log('Инициализация Telegram Web App...');
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      console.log('Telegram Platform:', window.Telegram.WebApp.platform);
    }

    const platform = window?.Telegram?.WebApp?.platform;
    startTelegramScanner().then((success) => {
      if (!success) {
        if (platform === 'ios') {
          // На iOS не пытаемся запускать веб-сканер из-за чёрного экрана — предлагаем только галерею
          console.log('iOS: веб-сканер не используется. Доступна загрузка из галереи.');
          setIsTelegramScanner(false);
          setIsScanning(false);
          setHasPermission(null);
        } else {
          console.log('Telegram-сканер не запустился, переключаемся на веб-сканер');
          startWebScanner();
        }
      }
    });

    return () => {
      console.log('Очистка QRScanner...');
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
      closeQrScanner();
    };
  }, [startTelegramScanner, startWebScanner]);

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    console.log('Закрытие QRScanner...');
    stopScanning();
    closeQrScanner();
    onClose();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
      console.log('QR-код из файла:', result);
      handleScanResult(result);
    } catch (err: any) {
      console.error('Ошибка при сканировании файла:', err);
      setError('Не удалось распознать QR код в файле');
    }
  };

  if (isTelegramScanner) {
    console.log('Рендеринг Telegram-сканера, HTML не отображается');
    return null; // Не рендерим ничего, если используется Telegram-сканер
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />
      <div className="absolute inset-0 bg-black bg-opacity-25" />

      {!isScanning && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <p className="text-white text-lg">Запуск камеры...</p>
        </div>
      )}

      {isScanning && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border-4 border-white rounded-lg" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }} />
        </div>
      )}

      <div className="absolute top-4 right-4 z-10">
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
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 p-4">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-white text-lg">{error}</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 z-10">
        <label className="w-full">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            className="w-full bg-white bg-opacity-20 text-white hover:bg-opacity-30 border-none py-6 text-base"
            asChild
          >
            <span>
              <Upload className="w-5 h-5 mr-2" />
              Загрузить из галереи
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
}