'use client'

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Page } from '@/components/Page';
import { useAppStore } from '@/stores/authStore';
import { Camera, Upload, X, Plus } from 'lucide-react';
import { isAdminTelegramId } from '@/core/lib/admin';
import Image from 'next/image';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PhotoFile {
  file: File;
  preview: string;
  id: string;
}

interface LotFormData {
  photos: PhotoFile[];
  brand: string;
  model: string;
  storage: string;
  color: string;
  price: string;
  oldPrice: string;
  description: string;
  status: 'available' | 'draft';
  isAccessory: boolean;
  targetBrand: string;
  targetModel: string;
}

export default function AddLotPage() {
  const router = useRouter();
  const { telegramId } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<LotFormData>({
    photos: [],
    brand: 'Apple',
    model: '',
    storage: '',
    color: '',
    price: '',
    oldPrice: '',
    description: '',
    status: 'available',
    isAccessory: false,
    targetBrand: '',
    targetModel: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Проверка прав доступа
  const isAdmin = isAdminTelegramId(telegramId);

  if (!isAdmin) {
    return (
      <Page back={true}>
        <div className="min-h-full bg-gray-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Доступ запрещен</h1>
            <p className="text-gray-600 mb-6">У вас нет прав для добавления лотов</p>
            <Button
              onClick={() => router.push('/admin')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium"
            >
              Вернуться в админ панель
            </Button>
          </motion.div>
        </div>
      </Page>
    );
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const id = Math.random().toString(36).substr(2, 9);
        const preview = URL.createObjectURL(file);

        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, { file, preview, id }]
        }));
      }
    });
  };

  const removePhoto = (id: string) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => {
        if (photo.id === id) {
          URL.revokeObjectURL(photo.preview);
        }
        return photo.id !== id;
      })
    }));
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  const handleInputChange = (field: keyof LotFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.photos.length === 0) {
      toast.error('Добавьте хотя бы одно фото');
      return;
    }

    if (!formData.model || !formData.storage || !formData.color || !formData.price) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Добавляем фото
      formData.photos.forEach((photo, index) => {
        formDataToSend.append(`photo_${index}`, photo.file);
      });

      // Формируем полное название модели
      const modelName = `${formData.model} ${formData.storage}GB ${formData.color}`;

      // Добавляем остальные данные
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('storage', formData.storage);
      formDataToSend.append('color', formData.color);
      formDataToSend.append('modelName', modelName);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('oldPrice', formData.oldPrice);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('isAccessory', String(formData.isAccessory));
      formDataToSend.append('targetBrand', formData.targetBrand);
      formDataToSend.append('targetModel', formData.targetModel);

      const response = await fetch('/api/admin/lots', {
        method: 'POST',
        headers: {
          'x-telegram-id': telegramId || '',
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(formData.status === 'draft' ? 'Черновик сохранен!' : 'Лот успешно создан!');

        // Отправляем событие для обновления главной страницы
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('lotAdded'));
        }

        router.push('/admin');
      } else {
        toast.error(result.error || 'Ошибка при создании лота');
      }
    } catch (error) {
      console.error('Error creating lot:', error);
      toast.error('Ошибка при создании лота');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Page back={true}>
      <div className="min-h-full bg-gray-50 pb-20">
        {/* Apple-style Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 pt-12 sticky top-0 z-10"
        >
          <div className="max-w-2xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Новый лот</h1>
                <p className="text-sm text-gray-500 mt-0.5">Добавьте устройство в каталог</p>
              </div>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleInputChange('status', 'available')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                    formData.status === 'available' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                  )}
                >
                  Активен
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('status', 'draft')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                    formData.status === 'draft' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                  )}
                >
                  Черновик
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto p-6 pt-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Photo Section - Apple Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Camera className="w-4 h-4 text-blue-600" />
                    </div>
                    Фотографии
                  </CardTitle>
                  <p className="text-sm text-gray-500">Добавьте 2-3 качественных фото устройства</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Upload Buttons */}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={openCamera}
                      variant="outline"
                      className="flex-1 h-12 bg-white/50 border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-medium"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Камера
                    </Button>
                    <Button
                      type="button"
                      onClick={openFileSelector}
                      variant="outline"
                      className="flex-1 h-12 bg-white/50 border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-medium"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Галерея
                    </Button>
                  </div>

                  {/* Hidden Inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  {/* Photo Preview */}
                  {formData.photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {formData.photos.map((photo) => (
                        <motion.div
                          key={photo.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group"
                        >
                          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                            <Image
                              src={photo.preview}
                              alt="Preview"
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => removePhoto(photo.id)}
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 w-7 h-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50/50">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">Добавьте фотографии устройства</p>
                      <p className="text-sm text-gray-400 mt-1">Нажмите на кнопки выше</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Device Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Plus className="w-4 h-4 text-green-600" />
                    </div>
                    Информация об устройстве
                  </CardTitle>
                  <p className="text-sm text-gray-500">Заполните характеристики устройства</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Accessory Switch */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 mb-2">
                    <div>
                      <Label className="text-sm font-bold text-gray-900">Это аксессуар?</Label>
                      <p className="text-xs text-gray-500">Чехлы, стекла, зарядки и т.д.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange('isAccessory', !formData.isAccessory as any)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        formData.isAccessory ? "bg-teal-500" : "bg-gray-300"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                        formData.isAccessory ? "right-1" : "left-1"
                      )} />
                    </button>
                  </div>

                  {/* Brand */}
                  <div className="space-y-2">
                    <Label htmlFor="brand" className="text-sm font-medium text-gray-700">Бренд *</Label>
                    <Select value={formData.brand} onValueChange={(value) => handleInputChange('brand', value)}>
                      <SelectTrigger className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl">
                        <SelectValue placeholder="Выберите бренд" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-200 bg-white shadow-lg">
                        <SelectItem value="Apple">Apple</SelectItem>
                        <SelectItem value="Samsung">Samsung</SelectItem>
                        <SelectItem value="Xiaomi">Xiaomi</SelectItem>
                        <SelectItem value="Google">Google</SelectItem>
                        <SelectItem value="OnePlus">OnePlus</SelectItem>
                        <SelectItem value="Sony">Sony</SelectItem>
                        <SelectItem value="Asus">Asus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Model */}
                  <div className="space-y-2">
                    <Label htmlFor="model" className="text-sm font-medium text-gray-700">
                      {formData.isAccessory ? 'Название аксессуара *' : 'Модель *'}
                    </Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      placeholder={formData.isAccessory ? "Например: Silicone Case (MagSafe)" : "Например: iPhone 15 Pro"}
                      className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                      required
                    />
                  </div>

                  {/* Accessory Specific Fields */}
                  {formData.isAccessory && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 pt-2 border-t border-gray-100"
                    >
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Для какого бренда?</Label>
                        <Input
                          value={formData.targetBrand}
                          onChange={(e) => handleInputChange('targetBrand', e.target.value)}
                          placeholder="Например: Apple"
                          className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Для какой модели?</Label>
                        <Input
                          value={formData.targetModel}
                          onChange={(e) => handleInputChange('targetModel', e.target.value)}
                          placeholder="Например: iPhone 15 Pro"
                          className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                        />
                      </div>
                    </motion.div>
                  )}

                  {!formData.isAccessory && (
                    <>
                      {/* Storage */}
                      <div className="space-y-2">
                        <Label htmlFor="storage" className="text-sm font-medium text-gray-700">Объем памяти *</Label>
                        <Select value={formData.storage} onValueChange={(value) => handleInputChange('storage', value)}>
                          <SelectTrigger className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl">
                            <SelectValue placeholder="Выберите объем памяти" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-gray-200 bg-white shadow-lg">
                            <SelectItem value="64">64 ГБ</SelectItem>
                            <SelectItem value="128">128 ГБ</SelectItem>
                            <SelectItem value="256">256 ГБ</SelectItem>
                            <SelectItem value="512">512 ГБ</SelectItem>
                            <SelectItem value="1024">1 ТБ</SelectItem>
                            <SelectItem value="2048">2 ТБ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Color */}
                      <div className="space-y-2">
                        <Label htmlFor="color" className="text-sm font-medium text-gray-700">Цвет *</Label>
                        <Input
                          id="color"
                          value={formData.color}
                          onChange={(e) => handleInputChange('color', e.target.value)}
                          placeholder="Например: Красный"
                          className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                          required
                        />
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm font-medium text-gray-700">Цена (₽) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="85000"
                        className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oldPrice" className="text-sm font-medium text-gray-400">Старая цена (—) </Label>
                      <Input
                        id="oldPrice"
                        type="number"
                        value={formData.oldPrice}
                        onChange={(e) => handleInputChange('oldPrice', e.target.value)}
                        placeholder="95000"
                        className="h-12 bg-white/50 border-gray-200 focus:border-gray-300 rounded-xl text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">Описание</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Дополнительная информация о устройстве..."
                      rows={3}
                      className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4 pt-4 pb-12"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin')}
                className="flex-1 h-14 bg-white/50 border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-medium"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Сохранение...
                  </div>
                ) : (
                  formData.status === 'draft' ? 'Сохранить черновик' : 'Создать лот'
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </div>
    </Page>
  );
}
