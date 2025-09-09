'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore, isMaster } from '@/stores/authStore';
import { AIEvaluationModal } from '@/components/AIEvaluationModal';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { QrCode, Camera, Smartphone } from 'lucide-react';
import { Page } from '@/components/Page';

export default function MasterPage() {
  const router = useRouter();
  const { userId, setModalOpen, modalOpen } = useAppStore();
  const [requestId, setRequestId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Проверяем, является ли пользователь мастером
  useEffect(() => {
    if (!isMaster(userId)) {
      alert('Доступ запрещён');
      router.push('/');
      return;
    }
  }, [userId, router]);

  const handleRequestIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestId.trim()) {
      setError('Введите ID заявки');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Mock проверка ID заявки
      const response = await fetch('/api/master/verify-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId: requestId.trim() }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Открываем модал ИИ-оценки
        setModalOpen(true);
      } else {
        setError(data.error || 'Заявка не найдена');
      }
    } catch (error) {
      console.error('Error verifying request:', error);
      setError('Ошибка проверки заявки');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRCodeScan = () => {
    // Mock QR-код сканирование
    const mockQRData = { skupkaId: 123, pointId: 1 };
    console.log('QR Code scanned:', mockQRData);
    setModalOpen(true);
  };

  if (!isMaster(userId)) {
    return null; // Не показываем страницу если не мастер
  }

  return (
    <Page back={true}>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Заголовок */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-md mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-sf-pro">Для мастеров</h1>
                <p className="text-gray-600 font-sf-pro">ИИ-оценка устройств</p>
              </div>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="max-w-md mx-auto p-6">
          <div className="space-y-6">
            {/* Форма ввода ID заявки */}
            <Card className="bg-white border border-gray-200 rounded-apple-lg shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 font-sf-pro">
                  <Smartphone className="w-5 h-5 text-teal-500" />
                  Ввод ID заявки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRequestIdSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="requestId" className="text-gray-700 font-sf-pro">
                      ID заявки
                    </Label>
                    <Input
                      id="requestId"
                      value={requestId}
                      onChange={(e) => setRequestId(e.target.value)}
                      placeholder="Введите ID заявки (например, #1234)"
                      className="mt-1 text-gray-900 bg-white border border-gray-200 placeholder-gray-400 rounded-apple font-sf-pro"
                    />
                    {error && (
                      <p className="mt-1 text-sm text-red-500 font-sf-pro">{error}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-apple font-sf-pro shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {isLoading ? 'Проверка...' : 'Начать оценку'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* QR-код сканирование */}
            <Card className="bg-white border border-gray-200 rounded-apple-lg shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 font-sf-pro">
                  <QrCode className="w-5 h-5 text-teal-500" />
                  QR-код
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto bg-gray-100 rounded-apple-lg flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-sf-pro">
                    Отсканируйте QR-код с заявки
                  </p>
                  <Button
                    onClick={handleQRCodeScan}
                    variant="outline"
                    className="w-full border-teal-500 text-teal-500 hover:bg-teal-50 rounded-apple font-sf-pro"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Сканировать QR-код
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* QR-код генератор */}
            <QRCodeGenerator skupkaId={123} pointId={1} />

            {/* Инструкции */}
            <Card className="bg-white border border-gray-200 rounded-apple-lg shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 font-sf-pro">Инструкции</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 font-sf-pro">
                  <p>1. Введите ID заявки или отсканируйте QR-код</p>
                  <p>2. Добавьте 3-5 фотографий устройства</p>
                  <p>3. Введите модель и серийный номер</p>
                  <p>4. Получите ИИ-оценку состояния</p>
                  <p>5. Подтвердите или добавьте отзыв</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Модал ИИ-оценки */}
        <AIEvaluationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </Page>
  );
}
