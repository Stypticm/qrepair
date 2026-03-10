import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model');

    if (!model) {
      return NextResponse.json(
        {
          success: false,
          error: 'Model parameter is required',
        },
        { status: 400 }
      );
    }

    const variants = await api.getDistinct('devices', 'variant', { model });

    // Фильтруем пустые варианты и показываем их как пустую строку в начале
    const nonEmptyVariants = variants.filter((variant) => variant !== '');
    const hasEmptyVariant = variants.some((variant) => variant === '');

    const processedVariants = hasEmptyVariant
      ? ['', ...nonEmptyVariants]
      : nonEmptyVariants;

    return NextResponse.json(processedVariants);
  } catch (error) {
    console.error('Error fetching device variants:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch variants' },
      { status: 500 }
    );
  }
}
