import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model');
    const variant = searchParams.get('variant');
    const storage = searchParams.get('storage');
    const color = searchParams.get('color');

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
    if (variant !== undefined && variant !== null) whereClause.variant = variant;
    if (storage) whereClause.storage = storage;
    if (color) whereClause.color = color;

    console.log('🔍 Sim types API - whereClause:', whereClause);

    const simTypes = await api.getDistinct('devices', 'simType', whereClause);

    console.log('🔍 Sim types API - result:', {
      totalFound: simTypes.length,
      sortedSimTypes: simTypes,
    });

    return NextResponse.json({
      success: true,
      simTypes: simTypes,
    });
  } catch (error) {
    console.error('Error fetching device sim types:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sim types',
      },
      { status: 500 }
    );
  }
}
