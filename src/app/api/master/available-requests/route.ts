import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    const params = {
      assignedMasterId: 'null',
      status: 'submitted',
      limit,
      offset,
      order_by: 'createdAt desc',
    };

    const { items: requests, total } = await api.listPaginated<any>('skupka', params);

    return NextResponse.json({
      success: true,
      requests,
      total,
    });
  } catch (error) {
    console.error('Error fetching available requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
