import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model');
    const variant = searchParams.get('variant');
    const storage = searchParams.get('storage');
    const color = searchParams.get('color');
    const country = searchParams.get('country');
    const simType = searchParams.get('simType');

    if (!model) {
      return NextResponse.json(
        {
          success: false,
          error: 'Model parameter is required',
        },
        { status: 400 }
      );
    }

    const filters: any = { model };
    // Обрабатываем пустую строку как пустой вариант
    if (variant && variant !== '') {
      filters.variant = variant;
    } else if (variant === '') {
      filters.variant = '';
    }
    if (storage) filters.storage = storage;
    if (color) filters.color = color;
    if (country) filters.country = country;
    if (simType) filters.simType = simType;

    const limit = parseInt(
      searchParams.get('limit') || '50'
    );
    filters._limit = limit;
    filters._sort = 'basePrice';
    filters._order = 'asc';

    const devices = await api.list<any>('devices', filters);

    if (!devices || devices.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Devices not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      devices,
      count: devices.length,
    });
  } catch (error) {
    console.error('Error fetching device price:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch device price',
      },
      { status: 500 }
    );
  }
}
