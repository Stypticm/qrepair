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
        <div className="min-h-full bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Доступ запрещен</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">У вас нет прав для управления каталогом</p>
            <Button onClick={() => router.push('/admin')} className="bg-blue-600">Вернуться</Button>
          </div>
        </div>
      </Page>
    );
  }

  const statuses = [
    { id: 'all', label: 'Все' },
    { id: 'available', label: 'В наличии' },
    { id: 'draft', label: 'Черновики' },
    { id: 'reserved', label: 'Бронь' },
    { id: 'sold', label: 'Продано' },
    { id: 'archived', label: 'Архив' },
  ];

  return (
    <Page back={true}>
      <div className="min-h-full bg-gray-50 dark:bg-[#0a0a0a] flex flex-col pt-12">
        <div className="max-w-4xl mx-auto px-6 w-full pb-20">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Управление каталогом</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Просмотр и редактирование товаров</p>
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
            <div className="flex p-1 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-x-auto no-scrollbar">
              {statuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() => setStatusFilter(status.id as any)}
                  className={`px-4 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
                    statusFilter === status.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
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
                className="pl-12 h-12 bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 rounded-2xl shadow-sm focus:ring-blue-500/10 focus:border-blue-500 transition-all text-base text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Product List */}
          {isLoading ? (
            <div className="space-y-4">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className="h-24 bg-white/50 dark:bg-white/5 animate-pulse rounded-2xl border border-gray-100 dark:border-white/10" />
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
                     <Card className="border-0 shadow-sm overflow-hidden rounded-2xl bg-white dark:bg-[#1a1a1a] hover:shadow-md transition-shadow group">
                       <CardContent className="p-4 flex items-center gap-4">
                         <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100 dark:border-white/10">
                           {product.coverPhoto || (product.photos && product.photos[0]) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                             <img 
                               src={product.coverPhoto || product.photos?.[0]} 
                               alt={product.title}
                               className="w-full h-full object-contain p-1"
                             />
                           ) : (
                             <Smartphone className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                           )}
                         </div>
                         
                         <div className="flex-1 min-w-0">
                           <h3 className="font-bold text-gray-900 dark:text-white truncate">{product.title || 'Без названия'}</h3>
                           <div className="flex items-center gap-2 mt-1">
                             <span className="text-sm font-bold text-blue-600">{product.price.toLocaleString()} ₽</span>
                             <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border
                               ${product.status === 'available' ? 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-100 dark:border-green-800' :
                                 product.status === 'draft' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700' :
                                 product.status === 'sold' ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800' :
                                 product.status === 'reserved' ? 'bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-800' :
                                 'bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-100 dark:border-red-800'}`}>
                               {statuses.find(s => s.id === product.status)?.label || product.status}
                             </span>
                           </div>
                         </div>

                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => setProductToEdit({ ...product })}
                             className="text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl h-10 w-10 transition-colors"
                           >
                             <UserCog className="w-5 h-5" />
                           </Button>
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => setProductToDelete(product)}
                             className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl h-10 w-10 transition-colors"
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
             <div className="text-center py-20 bg-white dark:bg-[#1a1a1a] rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
               <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Товары не найдены</h3>
               <p className="text-gray-500 dark:text-gray-400">Попробуйте изменить поисковый запрос или фильтр</p>
             </div>
          )}
        </div>
      </div>

      {/* Edit Sliding Panel */}
      <AnimatePresence>
        {productToEdit && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToEdit(null)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm shadow-2xl"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="relative w-full max-w-lg h-full bg-white dark:bg-[#0a0a0a] shadow-2xl flex flex-col pt-12"
            >
              <button 
                onClick={() => setProductToEdit(null)}
                 className="absolute top-6 left-6 w-10 h-10 rounded-full bg-gray-50 dark:bg-white/10 flex items-center justify-center text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex-1 overflow-y-auto px-8 py-6">
                 <div className="mb-8">
                   <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Редактирование</h2>
                   <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">ID: {productToEdit.id}</p>
                 </div>

                <form id="edit-form" onSubmit={handleUpdate} className="space-y-6">
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Название лота</label>
                     <Input 
                       value={productToEdit.title}
                       onChange={e => setProductToEdit({ ...productToEdit, title: e.target.value })}
                       className="rounded-2xl border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 h-14 text-base font-bold text-gray-900 dark:text-white focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                       required
                     />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Бренд</label>
                       <Input 
                         value={productToEdit.brand || ''}
                         onChange={e => setProductToEdit({ ...productToEdit, brand: e.target.value })}
                         className="rounded-2xl border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 h-12 text-sm font-bold text-gray-900 dark:text-white"
                       />
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Модель</label>
                       <Input 
                         value={productToEdit.model || ''}
                         onChange={e => setProductToEdit({ ...productToEdit, model: e.target.value })}
                         className="rounded-2xl border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 h-12 text-sm font-bold text-gray-900 dark:text-white"
                       />
                     </div>
                   </div>

                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Цена (₽)</label>
                     <Input 
                       type="number"
                       value={productToEdit.price}
                       onChange={e => setProductToEdit({ ...productToEdit, price: parseInt(e.target.value) })}
                       className="rounded-2xl border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 h-14 text-base font-bold text-gray-900 dark:text-white focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                       required
                     />
                   </div>

                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Текущий статус</label>
                     <div className="flex flex-wrap gap-2 p-1.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                       {statuses.filter(s => s.id !== 'all').map(s => (
                         <button
                           key={s.id}
                           type="button"
                           onClick={() => setProductToEdit({ ...productToEdit, status: s.id })}
                           className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                             productToEdit.status === s.id
                               ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm border border-gray-100 dark:border-white/10'
                               : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                           }`}
                         >
                           {s.label}
                         </button>
                       ))}
                     </div>
                   </div>

                   <div className="space-y-4 p-5 bg-blue-50/30 dark:bg-blue-900/20 rounded-3xl border border-blue-100/50 dark:border-blue-800/50">
                     <div className="flex items-center justify-between">
                       <div>
                         <label className="text-sm font-bold text-gray-900 dark:text-white">Это аксессуар?</label>
                         <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Будет предлагаться к основным товарам</p>
                       </div>
                      <input
                        type="checkbox"
                        checked={productToEdit.isAccessory || false}
                        onChange={e => setProductToEdit({ ...productToEdit, isAccessory: e.target.checked })}
                        className="w-6 h-6 rounded-lg accent-blue-600 cursor-pointer"
                      />
                    </div>
                    
                         {productToEdit.isAccessory && (
                           <motion.div 
                             initial={{ opacity: 0, height: 0 }}
                             animate={{ opacity: 1, height: 'auto' }}
                             className="space-y-4 pt-4 border-t border-blue-100 dark:border-blue-800"
                           >
                             <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Для бренда</label>
                                 <Input 
                                   value={productToEdit.targetBrand || ''}
                                   onChange={e => setProductToEdit({ ...productToEdit, targetBrand: e.target.value })}
                                   className="rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] h-10 text-xs font-bold text-gray-900 dark:text-white"
                                   placeholder="Apple"
                                 />
                               </div>
                               <div className="space-y-1.5">
                                 <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Для модели</label>
                                 <Input 
                                   value={productToEdit.targetModel || ''}
                                   onChange={e => setProductToEdit({ ...productToEdit, targetModel: e.target.value })}
                                   className="rounded-xl border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] h-10 text-xs font-bold text-gray-900 dark:text-white"
                                   placeholder="iPhone 15"
                                 />
                               </div>
                             </div>
                           </motion.div>
                         )}
                  </div>

                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Описание (Markdown)</label>
                     <textarea 
                       value={productToEdit.description || ''}
                       onChange={e => setProductToEdit({ ...productToEdit, description: e.target.value })}
                       className="w-full rounded-2xl border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all min-h-[120px] text-gray-900 dark:text-white"
                       placeholder="Расскажите о состоянии товара..."
                     />
                   </div>
                </form>
              </div>

               <div className="p-8 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex gap-4">
                 <Button 
                   type="button"
                   variant="outline" 
                   onClick={() => setProductToEdit(null)}
                   className="flex-1 rounded-2xl h-14 font-bold border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/5 transition-all shadow-sm"
                 >
                   Отмена
                 </Button>
                <Button 
                  form="edit-form"
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 h-14 font-bold text-white shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Сохранить'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <DialogContent className="rounded-[2.5rem] max-w-sm w-[95vw] border-none shadow-2xl p-8">
          <DialogHeader>
             <div className="w-16 h-16 bg-red-50 dark:bg-red-900/40 text-red-500 rounded-2xl flex items-center justify-center mb-6">
               <Trash2 className="w-8 h-8" />
             </div>
             <DialogTitle className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Удалить товар?</DialogTitle>
             <DialogDescription className="pt-2 text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              Вы уверены, что хотите навсегда удалить <strong>{productToDelete?.title}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-3 pt-8 sm:justify-start">
            <Button
              onClick={handleDelete}
              disabled={!!isDeleting}
              className="w-full rounded-2xl h-14 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-200 transition-all"
            >
              {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Удалить навсегда'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setProductToDelete(null)}
              className="w-full rounded-2xl h-14 font-bold border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              Отмена
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  );
}

