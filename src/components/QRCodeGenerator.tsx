'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { getPictureUrl } from '@/core/lib/assets';

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

  const canvasWrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const draw = () => {
      const wrapper = canvasWrapRef.current
      if (!wrapper) return
      const canvas = wrapper.querySelector('canvas') as HTMLCanvasElement | null
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const { width, height } = canvas
      const cx = Math.floor(width / 2)
      const cy = Math.floor(height / 2)
      const radius = Math.floor(Math.min(width, height) * 0.14) // немного больше для заметности

      // Белый круг подложка
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
      ctx.restore()

      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        // Перерисовать на случай если QR успел перерисоваться
        const canvasNow = wrapper.querySelector('canvas') as HTMLCanvasElement | null
        const ctxNow = canvasNow?.getContext('2d')
        if (!canvasNow || !ctxNow) return
        const { width: w2, height: h2 } = canvasNow
        const cx2 = Math.floor(w2 / 2)
        const cy2 = Math.floor(h2 / 2)
        const r2 = Math.floor(Math.min(w2, h2) * 0.14)

        ctxNow.save()
        ctxNow.beginPath()
        ctxNow.arc(cx2, cy2, r2, 0, Math.PI * 2)
        ctxNow.clip()
        ctxNow.drawImage(img, cx2 - r2, cy2 - r2, r2 * 2, r2 * 2)
        ctxNow.restore()
      }
      img.src = getPictureUrl('submit.png') || '/submit.png'
    }

    // Немного задержки, чтобы холст гарантированно был отрендерен
    const id = window.requestAnimationFrame(() => {
      setTimeout(draw, 50)
    })
    return () => window.cancelAnimationFrame(id)
  }, [qrString])

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
            <p className="text-sm text-gray-600 font-sf-pro mb-4">ID заявки: #{skupkaId}</p>
          )}
          
          <div className="space-y-4">
            <div className="relative w-48 h-48 mx-auto">
              {/* Круглая рамка с более мягкой тенью */}
              <div className="absolute inset-0 rounded-full border-2 border-[#2dc2c6] shadow-[0_6px_16px_rgba(45,194,198,0.25),0_2px_8px_rgba(0,0,0,0.12)] pointer-events-none z-20"></div>
              {/* Тонкая внутренняя белая окантовка */}
              <div className="absolute inset-[6px] rounded-full border border-white/85 pointer-events-none z-20"></div>

              {/* Круглая подложка */}
              <div className="absolute inset-0 rounded-full bg-white flex items-center justify-center">
                {/* Внутренний квадрат под QR, уменьшен чтобы не касаться круглой рамки */}
                <div className="w-34 h-34 rounded-md bg-white flex items-center justify-center">
                  <div ref={canvasWrapRef} className="">
                    {/* ВАЖНО: оставляем quiet zone и квадратный канвас для корректного сканирования */}
                    <QRCodeCanvas value={qrString} size={144} level="M" includeMargin={true} bgColor="#ffffff" fgColor="#000000" />
                  </div>
                </div>
              </div>
              {/* Абсолютный fallback логотип поверх всех слоёв */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
                <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm bg-white/90">
                  <img src={getPictureUrl('submit.png') || '/submit.png'} alt="logo" className="w-full h-full object-contain" />
                </div>
              </div>
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
