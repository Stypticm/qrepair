import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model');
    const variant = searchParams.get('variant');

    if (!model) {
      return NextResponse.json(
        {
          success: false,
          error: 'Model parameter is required',
        },
        { status: 400 }
      );
    }

    const whereClause: any = { model };
    if (variant !== null && variant !== undefined && variant !== '') {
      whereClause.variant = variant;
    }

    console.log('🔍 Storages API - whereClause:', whereClause);

    const storages = await api.getDistinct('devices', 'storage', whereClause);

    // Сортируем объемы памяти по порядку (от меньшего к большему)
    const sortedStorages = storages
      .sort((a: string, b: string) => {
        const getStorageValue = (storage: string) => {
          const match = storage.match(/(\d+)(GB|TB)/i);
          if (!match) return 0;
          const value = parseInt(match[1]);
          const unit = match[2].toUpperCase();
          return unit === 'TB' ? value * 1024 : value;
        };

        return getStorageValue(a) - getStorageValue(b);
      });

    console.log('🔍 Storages API - result:', {
      totalFound: storages.length,
      sortedStorages: sortedStorages,
    });

    return NextResponse.json(sortedStorages);
  } catch (error) {
    console.error('Error fetching device storages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch storages' },
      { status: 500 }
    );
  }
}
