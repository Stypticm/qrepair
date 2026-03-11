'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { isAdminTelegramId } from '@/core/lib/admin';

export interface Product {
  id: string;
  title: string;
  price: number;
  model?: string;
  storage?: string;
  color?: string;
  photos?: string[];
  coverPhoto?: string;
  status: string;
  description?: string;
}

export type StatusFilter = 'all' | 'available' | 'reserved' | 'sold' | 'archived';

export function useAdminCatalog() {
  const { telegramId, authToken } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const isAdmin = isAdminTelegramId(telegramId);

  const fetchProducts = useCallback(async () => {
    if (!isAdmin) return;
    
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {
        'x-telegram-id': telegramId || '',
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch('/api/admin/lots', { headers });
      const data = await response.json();
      if (response.ok && data.lots) {
        setProducts(data.lots);
      } else {
        toast.error(data.error || 'Ошибка при загрузке каталога');
      }
    } catch (error) {
      console.error('Error fetching catalog:', error);
      toast.error('Ошибка при загрузке каталога');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, telegramId, authToken]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (productId: string) => {
    setIsDeleting(productId);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-telegram-id': telegramId || '',
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch('/api/admin/lots/delete', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ lotId: productId }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Товар успешно удален');
        setProducts(prev => prev.filter(p => p.id !== productId));
        return true;
      } else {
        toast.error(result.error || 'Ошибка при удалении товара');
        return false;
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Ошибка при удалении товара');
      return false;
    } finally {
      setIsDeleting(null);
    }
  };

  const handleUpdate = async (product: Product) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/lots/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(product),
      });

      if (response.ok) {
        toast.success('Товар успешно обновлен');
        setProducts(prev => prev.map(p => p.id === product.id ? product : p));
        return true;
      } else {
        const result = await response.json();
        toast.error(result.error || 'Ошибка при обновлении товара');
        return false;
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Ошибка при обновлении товара');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredProducts = (products || []).filter(p => {
    const title = (p.title || '').toLowerCase();
    const model = (p.model || '').toLowerCase();
    const query = (searchQuery || '').toLowerCase();
    
    const matchesQuery = title.includes(query) || model.includes(query);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    
    return matchesQuery && matchesStatus;
  });

  return {
    products: filteredProducts,
    allProducts: products,
    isLoading,
    isAdmin,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isUpdating,
    isDeleting,
    fetchProducts,
    handleDelete,
    handleUpdate
  };
}
