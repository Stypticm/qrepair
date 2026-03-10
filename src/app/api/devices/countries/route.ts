import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model');
    const variant = searchParams.get('variant');
    const storage = searchParams.get('storage');
    const color = searchParams.get('color');
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

    const whereClause: any = { model };
    if (variant !== undefined && variant !== null) whereClause.variant = variant;
    if (storage) whereClause.storage = storage;
    if (color) whereClause.color = color;
    if (simType) whereClause.simType = simType;

    console.log('🔍 Countries API - whereClause:', whereClause);

    const countries = await api.getDistinct('devices', 'country', whereClause);

    console.log('🔍 Countries API - result:', {
      totalFound: countries.length,
      sortedCountries: countries,
    });

    return NextResponse.json({
      success: true,
      countries: countries,
    });
  } catch (error) {
    console.error('Error fetching device countries:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch countries',
      },
      { status: 500 }
    );
  }
}
