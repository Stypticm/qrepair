'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Page } from '@/components/Page';
import { useAppStore } from '@/stores/authStore';
import { Trash2, Smartphone, X, Search, Package, RefreshCw, UserCog, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAdminCatalog, Product, StatusFilter } from '@/hooks/useAdminCatalog';

export default function AdminCatalogPage() {
  const router = useRouter();
  const {
    products: filteredProducts,
    isLoading,
    isAdmin,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isUpdating,
    isDeleting,
    fetchProducts,
    handleDelete: performDelete,
    handleUpdate: performUpdate
  } = useAdminCatalog();

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const handleDelete = async () => {
    if (!productToDelete) return;
    const success = await performDelete(productToDelete.id);
    if (success) {
      setProductToDelete(null);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productToEdit) return;
    const success = await performUpdate(productToEdit);
    if (success) {
      setProductToEdit(null);
    }
  };

  if (!isAdmin) {
    return (
      <Page back={true}>
        <div className="min-h-full bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Доступ запрещен</h1>
            <p className="text-gray-600 mb-6">У вас нет прав для управления каталогом</p>
            <Button onClick={() => router.push('/admin')} className="bg-blue-600">Вернуться</Button>
          </div>
        </div>
      </Page>
    );
  }

  const statuses = [
    { id: 'all', label: 'Все' },
    { id: 'available', label: 'В наличии' },
    { id: 'reserved', label: 'Бронь' },
    { id: 'sold', label: 'Продано' },
    { id: 'archived', label: 'Архив' },
  ];

  return (
    <Page back={true}>
      <div className="min-h-full bg-gray-50 flex flex-col pt-12">
        <div className="max-w-4xl mx-auto px-6 w-full pb-20">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Управление каталогом</h1>
              <p className="text-gray-500 font-medium">Просмотр и редактирование товаров</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={fetchProducts} 
                disabled={isLoading}
                className="rounded-xl border-gray-200"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
              <Button onClick={() => router.push('/admin/add-lot')} className="bg-blue-600 rounded-xl">
                Добавить товар
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex p-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto no-scrollbar">
              {statuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() => setStatusFilter(status.id as any)}
                  className={`px-4 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
                    statusFilter === status.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input 
                placeholder="Поиск по названию или модели..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white border-gray-100 rounded-2xl shadow-sm focus:ring-blue-500/10 focus:border-blue-500 transition-all text-base"
              />
            </div>
          </div>

          {/* Product List */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-white/50 animate-pulse rounded-2xl border border-gray-100" />
               ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="border-0 shadow-sm overflow-hidden rounded-2xl bg-white hover:shadow-md transition-shadow group">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
                          {product.coverPhoto || (product.photos && product.photos[0]) ? (
                             // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={product.coverPhoto || product.photos?.[0]} 
                              alt={product.title}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <Smartphone className="w-8 h-8 text-gray-300" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 truncate">{product.title || 'Без названия'}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-blue-600">{product.price.toLocaleString()} ₽</span>
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border
                              ${product.status === 'available' ? 'bg-green-50 text-green-700 border-green-100' :
                                product.status === 'sold' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                product.status === 'reserved' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                'bg-red-50 text-red-700 border-red-100'}`}>
                              {statuses.find(s => s.id === product.status)?.label || product.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setProductToEdit({ ...product })}
                            className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl h-10 w-10 transition-colors"
                          >
                            <UserCog className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setProductToDelete(product)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl h-10 w-10 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Товары не найдены</h3>
              <p className="text-gray-500">Попробуйте изменить поисковый запрос или фильтр</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!productToEdit} onOpenChange={() => setProductToEdit(null)}>
        <DialogContent className="rounded-3xl max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Редактировать товар</DialogTitle>
          </DialogHeader>
          {productToEdit && (
            <form onSubmit={handleUpdate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Название</label>
                <Input 
                  value={productToEdit.title}
                  onChange={e => setProductToEdit({ ...productToEdit, title: e.target.value })}
                  className="rounded-xl border-gray-100 bg-gray-50/50 h-11"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Цена (₽)</label>
                  <Input 
                    type="number"
                    value={productToEdit.price}
                    onChange={e => setProductToEdit({ ...productToEdit, price: parseInt(e.target.value) })}
                    className="rounded-xl border-gray-100 bg-gray-50/50 h-11"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Статус</label>
                  <select 
                    value={productToEdit.status}
                    onChange={e => setProductToEdit({ ...productToEdit, status: e.target.value })}
                    className="w-full rounded-xl border-gray-100 bg-gray-50/50 h-11 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {statuses.filter(s => s.id !== 'all').map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Описание</label>
                <textarea 
                  value={productToEdit.description || ''}
                  onChange={e => setProductToEdit({ ...productToEdit, description: e.target.value })}
                  className="w-full rounded-xl border-gray-100 bg-gray-50/50 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setProductToEdit(null)}
                  className="flex-1 rounded-xl h-11"
                >
                  Отмена
                </Button>
                <Button 
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 rounded-xl bg-blue-600 h-11 shadow-lg shadow-blue-200"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Сохранить'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <DialogContent className="rounded-3xl max-w-sm w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Удалить товар?</DialogTitle>
            <DialogDescription className="pt-2 text-gray-500">
              Вы уверены, что хотите удалить <strong>{productToDelete?.title}</strong>? Это действие нельзя будет отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-4 sm:justify-start">
            <Button
              variant="outline"
              onClick={() => setProductToDelete(null)}
              className="flex-1 rounded-xl h-11"
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!!isDeleting}
              className="flex-1 rounded-xl h-11 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
}
