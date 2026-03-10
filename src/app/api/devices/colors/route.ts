import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model');
    const variant = searchParams.get('variant');
    const storage = searchParams.get('storage');

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
    if (storage) whereClause.storage = storage;

    console.log('🔍 Colors API - whereClause:', whereClause);

    const colors = await api.getDistinct('devices', 'color', whereClause);

    console.log('🔍 Colors API - result:', {
      totalFound: colors.length,
      sortedColors: colors,
    });

    return NextResponse.json(colors);
  } catch (error) {
    console.error('Error fetching device colors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch colors' },
      { status: 500 }
    );
  }
}
