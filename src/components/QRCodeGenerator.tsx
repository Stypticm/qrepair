'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeGeneratorProps {
  skupkaId: string;
  pointId: number;
  showHeader?: boolean;
  showId?: boolean;
  showDownload?: boolean;
}

export function QRCodeGenerator({ skupkaId, pointId, showHeader = true, showId = true, showDownload = true }: QRCodeGeneratorProps) {
  const qrData = useMemo(() => ({
    skupkaId,
    pointId,
    timestamp: Date.now()
  }), [skupkaId, pointId]);

  const qrString = useMemo(() => JSON.stringify(qrData), [qrData]);

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
      {showHeader && (
        <CardHeader className="flex items-center justify-center">
          <CardTitle className="flex items-center gap-2 text-gray-900 font-sf-pro">
            <QrCode className="w-5 h-5 text-teal-500" />
            QR-код для заявки
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        <div className="text-center">
          {showId && (
            <p className="text-sm text-gray-600 font-sf-pro mb-4">
              ID заявки: #{skupkaId}
            </p>
          )}
          
          <div className="space-y-4">
            <div className="w-48 h-48 mx-auto bg-white border border-gray-200 rounded-apple-lg flex items-center justify-center">
              <QRCodeCanvas
                value={qrString}
                size={180}
                level="M"
                includeMargin={true}
              />
            </div>
            {showDownload && (
              <div className="flex gap-2">
                <Button
                  onClick={handleDownloadQR}
                  variant="outline"
                  className="flex-1 border-teal-500 text-teal-500 hover:bg-teal-50 rounded-apple font-sf-pro"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Скачать
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
