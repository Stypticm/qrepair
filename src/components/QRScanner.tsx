'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, Upload } from 'lucide-react';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  onScanSuccess: (skupkaId: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScannerReady, setIsScannerReady] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);

  const handleScanResult = useCallback((result: QrScanner.ScanResult | string) => {
    const scanData = typeof result === 'string' ? result : result.data;
    try {
      const qrData = JSON.parse(scanData);
      if (qrData.skupkaId) {
        onScanSuccess(qrData.skupkaId);
      } else {
        setError('QR-код не содержит необходимой информации.');
      }
    } catch (parseError) {
      if (scanData && scanData.trim()) {
        onScanSuccess(scanData.trim());
      } else {
        setError('Неверный формат QR-кода.');
      }
    }
  }, [onScanSuccess]);

  useEffect(() => {
    const telegramWebApp = typeof window !== 'undefined' && window.Telegram?.WebApp;
    if (telegramWebApp && telegramWebApp.platform !== 'unknown') {
        setIsTelegram(true);
    }
  }, []);

  useEffect(() => {
    if (isTelegram) {
      window.Telegram.WebApp.showScanQrPopup({ text: 'Наведите камеру на QR-код' }, (text) => {
        if (text) {
          handleScanResult(text);
          return true;
        }
        onClose();
        return false;
      });
      return;
    }

    const videoElement = videoRef.current;
    if (!videoElement) return;

    const qrScanner = new QrScanner(
      videoElement,
      (result) => handleScanResult(result),
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: 'environment',
      }
    );

    const onVideoPlay = () => setIsScannerReady(true);
    const onVideoError = () => setError('Ошибка камеры. Попробуйте перезагрузить страницу.');

    videoElement.addEventListener('playing', onVideoPlay);
    videoElement.addEventListener('error', onVideoError);

    qrScanner.start().catch(err => {
      console.error('QR Scanner start failed:', err);
      if (err === 'Camera not found.') {
          setError('Камера не найдена. Проверьте, подключена ли она.');
      } else if (err === 'No camera permissions.'){
          setError('Нет доступа к камере. Разрешите его в настройках браузера.');
      } else {
          setError('Не удалось запустить сканер. Попробуйте еще раз.');
      }
    });

    return () => {
      videoElement.removeEventListener('playing', onVideoPlay);
      videoElement.removeEventListener('error', onVideoError);
      qrScanner.destroy();
    };
  }, [isTelegram, handleScanResult, onClose]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
      handleScanResult(result);
    } catch (err: any) {
      console.error('File Scan Error:', err);
      setError('Не удалось распознать QR-код в файле.');
    }
  };
  
  if (isTelegram) {
    return null;
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
      
      {!isScannerReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
              <p className="text-white text-lg">Запуск камеры...</p>
          </div>
      )}

      {isScannerReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border-4 border-white rounded-lg" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }} />
        </div>
      )}

      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
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
