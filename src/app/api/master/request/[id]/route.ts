import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Получаем заявку по ID через Go API с загрузкой мастера
    const request = await api.get<any>('skupka', id, { preload: 'AssignedMaster' });

    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    console.log('🔍 Master request API - found request:', {
      id: request.id,
      modelname: request.deviceModel || request.modelname, // Handle potential field name differences
      status: request.status,
      price: request.price,
    });

    return NextResponse.json({
      success: true,
      request: {
        id: request.id,
        modelname: request.modelname,
        price: request.price,
        finalPrice: request.finalPrice,
        username: request.username,
        status: request.status,
        createdAt: request.createdAt,
        sn: request.sn,
        deviceConditions: request.deviceConditions,
        additionalConditions: request.additionalConditions,
        aiAnalysis: request.aiAnalysis,
        photoUrls: request.photoUrls,
        deviceData: request.deviceData,
        assignedMaster: request.assignedMaster, // Презагружен через Go API
      },
    });
  } catch (error) {
    console.error('Error fetching master request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
