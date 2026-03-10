import { NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { inspectionId, testsResults } = body;

    if (!inspectionId || !testsResults) {
      return NextResponse.json(
        { error: 'Missing inspectionId or testsResults' },
        { status: 400 }
      );
    }

    // Обновляем результаты тестов через Go API
    const updatedInspection = await api.patch<any>('device-inspections', inspectionId, {
      testsResults,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      inspection: updatedInspection,
    });
  } catch (error) {
    console.error('Error updating inspection:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
