import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function GET(req: NextRequest) {
  try {
    // Получаем все точки приёма для обычных пользователей через Go API
    const points = await api.list<any>('point', {
      order_by: 'id asc',
    });
    
    return NextResponse.json({
      success: true,
      points,
    });
  } catch (error) {
    console.error('❌ Error fetching points:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
