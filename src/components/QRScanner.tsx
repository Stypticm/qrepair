'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Upload, X } from 'lucide-react';
import QrScanner from 'qr-scanner';
import jsQR from 'jsqr';
import { openQrScanner, closeQrScanner, isQrScannerOpened } from '@telegram-apps/sdk';

interface QRScannerProps {
  onScanSuccess: (skupkaId: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isTelegramScanner, setIsTelegramScanner] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState(false);
  const [platform, setPlatform] = useState<string | null>(null);

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

      // Сразу после предоставления разрешения открываем системную камеру/галерею
      try {
        fileInputRef.current?.click();
      } catch {}
      setIsScanning(false);
      setHasPermission(null);
      return;

      // Критичные атрибуты для мобильных WebView (iOS/Android)
      try {
        const videoEl = videoRef.current as HTMLVideoElement;
        videoEl?.setAttribute('playsinline', 'true');
        // @ts-ignore
        videoEl?.setAttribute('webkit-playsinline', 'true');
        videoEl?.setAttribute('autoplay', 'true');
        if (videoEl) videoEl.muted = true;
      } catch {}

      const videoEl2 = videoRef.current as HTMLVideoElement;
      qrScannerRef.current = new QrScanner(
        videoEl2,
        handleScanResult,
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
        }
      );

      await qrScannerRef.current!.start();
      // Явная попытка запустить воспроизведение (для некоторых WebView это обязательно)
      try { await (videoRef.current as HTMLVideoElement).play(); } catch (e) { console.warn('video.play() rejected:', e); }
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
      const pf = window.Telegram.WebApp.platform;
      setPlatform(pf);
      console.log('Telegram Platform:', pf);
    }

    const pf = window?.Telegram?.WebApp?.platform;
    if (pf === 'ios') {
      // Сразу открываем системную камеру/галерею через input (надёжнее на iOS)
      setTimeout(() => {
        try { fileInputRef.current?.click(); } catch {}
      }, 50);
      setIsTelegramScanner(false);
      setIsScanning(false);
      setHasPermission(null);
    } else {
      startTelegramScanner().then((success) => {
        if (!success) {
          console.log('Telegram-сканер не запустился, переключаемся на веб-сканер');
          startWebScanner();
        }
      });
    }

    return () => {
      console.log('Очистка QRScanner...');
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
      closeQrScanner();
    };
  }, [startTelegramScanner, startWebScanner]);

  // Фолбек: если мы не сканируем, нет ошибки и не открыт Telegram-сканер, один раз автоматически открываем системную камеру/галерею
  useEffect(() => {
    if (!isScanning && !error && !isTelegramScanner && !autoTriggered && platform === 'ios') {
      setAutoTriggered(true);
      setTimeout(() => {
        try { fileInputRef.current?.click(); } catch {}
      }, 50);
    }
  }, [isScanning, error, isTelegramScanner, autoTriggered, platform]);

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
    const inputEl = event.target;
    const file = inputEl.files?.[0];
    if (!file) return;

    // Сбрасываем value, чтобы повторный выбор того же файла снова вызывал onChange
    setTimeout(() => { try { inputEl.value = ''; } catch {} }, 0);

    try {
      setError(null);

      // Попытка 1: createImageBitmap (лучше работает с HEIC/HEIF на iOS)
      try {
        const bitmap = await createImageBitmap(file as Blob);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D недоступен');
        ctx.drawImage(bitmap, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
        if (code?.data) {
          console.log('jsQR(createImageBitmap) распознал:', code.data);
          handleScanResult(code.data);
          return;
        }
      } catch (e) {
        console.warn('createImageBitmap не удался, пробуем Image+canvas:', e);
      }

      // Попытка 2: Image + FileReader
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error('Не удалось загрузить изображение'));
        const reader = new FileReader();
        reader.onload = (ev) => { i.src = String(ev.target?.result); };
        reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
        reader.readAsDataURL(file);
      });

      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D недоступен');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
        if (code?.data) {
          console.log('jsQR(Image) распознал:', code.data);
          handleScanResult(code.data);
          return;
        }
      } catch (e) {
        console.warn('jsQR(Image) не распознал, пробуем fallback QrScanner.scanImage:', e);
      }

      // Попытка 3: fallback на QrScanner.scanImage
      try {
        const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
        if (result?.data) {
          console.log('QrScanner.scanImage распознал:', result.data);
          handleScanResult(result);
          return;
        }
      } catch (e) {
        console.warn('QrScanner.scanImage не распознал:', e);
      }

      setError('Не удалось распознать QR. Попробуйте ещё раз, при хорошем освещении.');
    } catch (err: any) {
      console.error('Ошибка при обработке файла:', err);
      setError('Не удалось распознать QR код в файле');
    }
  };

  if (isTelegramScanner) {
    console.log('Рендеринг Telegram-сканера, HTML не отображается');
    return null; // Не рендерим ничего, если используется Telegram-сканер
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {platform !== 'ios' && (
        <>
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          <div className="absolute inset-0 bg-black bg-opacity-25" />
        </>
      )}

      {platform !== 'ios' && isScanning && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border-4 border-white rounded-lg" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }} />
        </div>
      )}

      {platform === 'ios' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-white text-lg mb-4">Откройте камеру для сканирования QR</p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-sm bg-white text-black hover:bg-white/90"
          >
            Открыть камеру
          </Button>
          <p className="text-white/80 text-sm mt-3">или выберите фото из галереи</p>
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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*;capture=camera"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          variant="outline"
          className="w-full bg-white bg-opacity-20 text-white hover:bg-opacity-30 border-none py-6 text-base"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-5 h-5 mr-2" />
          Загрузить из галереи
        </Button>
      </div>
    </div>
  );
}