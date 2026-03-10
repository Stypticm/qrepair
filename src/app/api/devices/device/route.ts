import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model');
    const variant = searchParams.get('variant');
    const storage = searchParams.get('storage');
    const color = searchParams.get('color');

    if (!model || !storage || !color) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Model, storage, and color parameters are required',
        },
        { status: 400 }
      );
    }

    const filters: any = {
      model,
      storage,
      color,
    };

    if (variant && variant !== '' && variant !== 'null') {
      filters.variant = variant;
    } else {
      filters.variant = '';
    }

    console.log('🔍 Device API - filters:', filters);

    let devices = await api.list<any>('devices', filters);
    let device = devices.length > 0 ? devices[0] : null;

    if (!device && (variant === '' || variant === 'null')) {
      console.log(
        '🔍 Device API - trying fallback search without variant'
      );
      const fallbackFilters = {
        model,
        storage,
        color,
      };

      devices = await api.list<any>('devices', fallbackFilters);
      device = devices.length > 0 ? devices[0] : null;
    }

    if (!device) {
      return NextResponse.json(
        {
          success: false,
          error: 'Device not found',
        },
        { status: 404 }
      );
    }

    console.log('🔍 Device API - found device:', {
      id: device.id,
      model: device.model,
      variant: device.variant,
      storage: device.storage,
      color: device.color,
      basePrice: device.basePrice,
    });

    return NextResponse.json(device);
  } catch (error) {
    console.error('Error fetching device:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch device' },
      { status: 500 }
    );
  }
}
