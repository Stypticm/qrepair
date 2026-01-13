'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Upload, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { ClipLoader } from 'react-spinners';

interface AIEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIEvaluationModal({ isOpen, onClose }: AIEvaluationModalProps) {
  const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const [photos, setPhotos] = useState<File[]>([]);
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = [...photos, ...files].slice(0, 5); // Максимум 5 фото
    setPhotos(newPhotos);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleStartEvaluation = async () => {
    if (photos.length < 3) {
      alert('Добавьте минимум 3 фотографии');
      return;
    }
    if (!model.trim()) {
      alert('Введите модель устройства');
      return;
    }
    if (!serialNumber.trim()) {
      alert('Введите серийный номер');
      return;
    }

    setStep('processing');
    setIsUploading(true);

    try {
      // Mock ИИ-оценка
      await new Promise(resolve => setTimeout(resolve, 15000)); // 15 секунд обработки
      
      const mockEvaluation = {
        finalPrice: 25500,
        inspectionNotes: 'Царапины на экране, небольшие потертости на корпусе',
        recommendations: 'Рекомендуется заменить защитное стекло',
        condition: 'Хорошее'
      };
      
      setEvaluation(mockEvaluation);
      setStep('result');
    } catch (error) {
      console.error('Error during AI evaluation:', error);
      alert('Ошибка при оценке устройства');
      setStep('upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      // Mock сохранение оценки
      const response = await fetch('/api/master/save-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          finalPrice: evaluation.finalPrice,
          inspectionNotes: evaluation.inspectionNotes,
          masterId: 1,
          pointId: 1,
          feedback: feedback
        }),
      });

      if (response.ok) {
        alert('Оценка сохранена успешно');
        handleClose();
      } else {
        alert('Ошибка сохранения оценки');
      }
    } catch (error) {
      console.error('Error saving evaluation:', error);
      alert('Ошибка сохранения оценки');
    }
  };

  const handleClose = () => {
    setStep('upload');
    setPhotos([]);
    setModel('');
    setSerialNumber('');
    setEvaluation(null);
    setFeedback('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-apple-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 font-sf-pro">ИИ-оценка устройства</h2>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Загрузка фото */}
              <div>
                <Label className="text-gray-700 font-sf-pro mb-3 block">
                  Фотографии устройства (3-5 шт.)
                </Label>
                <div className="space-y-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-apple">
                      <Camera className="w-5 h-5 text-gray-400" />
                      <span className="flex-1 text-sm text-gray-600 font-sf-pro truncate">
                        {photo.name}
                      </span>
                      <Button
                        onClick={() => removePhoto(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {photos.length < 5 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-teal-500 rounded-apple p-6 text-center cursor-pointer hover:bg-teal-50 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-teal-500 mx-auto mb-2" />
                      <p className="text-teal-500 font-sf-pro">Добавить фото</p>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Модель устройства */}
              <div>
                <Label htmlFor="model" className="text-gray-700 font-sf-pro">
                  Модель устройства
                </Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Например, iPhone 15 Pro"
                  className="mt-1 text-gray-900 bg-white border border-gray-200 placeholder-gray-400 rounded-apple font-sf-pro"
                />
              </div>

              {/* Серийный номер */}
              <div>
                <Label htmlFor="serialNumber" className="text-gray-700 font-sf-pro">
                  Серийный номер
                </Label>
                <Input
                  id="serialNumber"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Введите SN"
                  className="mt-1 text-gray-900 bg-white border border-gray-200 placeholder-gray-400 rounded-apple font-sf-pro"
                />
              </div>

              <Button
                onClick={handleStartEvaluation}
                disabled={photos.length < 3 || !model.trim() || !serialNumber.trim()}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-apple font-sf-pro shadow-sm hover:shadow-md transition-all duration-200"
              >
                Начать ИИ-оценку
              </Button>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-12">
              <ClipLoader color="#2dc2c6" size={50} />
              <h3 className="text-lg font-semibold text-gray-900 mt-4 font-sf-pro">
                Анализ устройства
              </h3>
              <p className="text-gray-600 mt-2 font-sf-pro">
                ИИ анализирует фотографии... 10-20 секунд
              </p>
            </div>
          )}

          {step === 'result' && evaluation && (
            <div className="space-y-6">
              {/* Результат оценки */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800 font-sf-pro">
                    <CheckCircle className="w-5 h-5" />
                    Результат оценки
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-800 font-sf-pro">
                      Готовы купить за {evaluation.finalPrice.toLocaleString()} RUB
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 font-sf-pro">Состояние:</p>
                    <p className="text-gray-600 font-sf-pro">{evaluation.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 font-sf-pro">Заметки:</p>
                    <p className="text-gray-600 font-sf-pro">{evaluation.inspectionNotes}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 font-sf-pro">Рекомендации:</p>
                    <p className="text-gray-600 font-sf-pro italic">{evaluation.recommendations}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Отзыв мастера */}
              <div>
                <Label htmlFor="feedback" className="text-gray-700 font-sf-pro">
                  Отзыв о состоянии (необязательно)
                </Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Дополнительные замечания о состоянии устройства"
                  rows={4}
                  className="mt-1 text-gray-900 bg-white border border-gray-300 placeholder-gray-400 rounded-apple font-sf-pro"
                />
              </div>

              {/* Кнопки действий */}
              <div className="flex gap-3">
                <Button
                  onClick={handleConfirm}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-apple font-sf-pro shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Подтвердить
                </Button>
                <Button
                  onClick={() => setStep('upload')}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-apple font-sf-pro"
                >
                  Повторить
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
