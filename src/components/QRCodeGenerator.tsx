'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Download } from 'lucide-react';

interface QRCodeGeneratorProps {
  skupkaId: number;
  pointId: number;
}

export function QRCodeGenerator({ skupkaId, pointId }: QRCodeGeneratorProps) {
  const [showQR, setShowQR] = useState(false);
  
  const qrData = {
    skupkaId,
    pointId,
    timestamp: Date.now()
  };

  const qrString = JSON.stringify(qrData);

  const handleDownloadQR = () => {
    // Mock функция для скачивания QR-кода
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qr-${skupkaId}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <Card className="bg-white border border-gray-200 rounded-apple-lg shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 font-sf-pro">
          <QrCode className="w-5 h-5 text-teal-500" />
          QR-код для заявки
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 font-sf-pro mb-4">
            ID заявки: #{skupkaId}
          </p>
          
          {!showQR ? (
            <Button
              onClick={() => setShowQR(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white rounded-apple font-sf-pro shadow-sm hover:shadow-md transition-all duration-200"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Сгенерировать QR-код
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="w-48 h-48 mx-auto bg-white border border-gray-200 rounded-apple-lg flex items-center justify-center">
                {/* Здесь будет реальный QR-код */}
                <div className="text-center">
                  <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 font-sf-pro">
                    QR-код будет здесь
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleDownloadQR}
                  variant="outline"
                  className="flex-1 border-teal-500 text-teal-500 hover:bg-teal-50 rounded-apple font-sf-pro"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Скачать
                </Button>
                <Button
                  onClick={() => setShowQR(false)}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-apple font-sf-pro"
                >
                  Скрыть
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
