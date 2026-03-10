import { NextResponse } from 'next/server';
import { api } from '@/services/api';
import { calculatePriceAdjustment } from '@/core/lib/deviceTests';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { inspectionId, inspectionNotes } = body;

    if (!inspectionId) {
      return NextResponse.json(
        { error: 'Missing inspectionId' },
        { status: 400 }
      );
    }

    // Получаем данные проверки через Go API
    const inspection = await api.get<any>('device-inspections', inspectionId);
    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
    }

    // Получаем данные заявки
    const skupka = await api.get<any>('skupkas', inspection.skupkaId);
    if (!skupka) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Проверяем результаты тестов
    const testsResults = (inspection.testsResults as any[]) || [];
    if (testsResults.length === 0) {
      return NextResponse.json({ error: 'No test results found' }, { status: 400 });
    }

    // Рассчитываем окончательную цену
    const basePrice = skupka.price || 0;
    const priceAdjustment = calculatePriceAdjustment(testsResults, basePrice);
    const finalPrice = Math.max(basePrice + priceAdjustment, 0);

    // Завершаем проверку через Go API
    const completedInspection = await api.patch<any>('device-inspections', inspectionId, {
      finalPrice,
      inspectionNotes,
      completedAt: new Date().toISOString(),
    });

    // Обновляем заявку через Go API
    await api.patch<any>('skupkas', inspection.skupkaId, {
      finalPrice,
      inspectionCompleted: true,
      status: 'completed',
    });

    console.log(`Inspection ${inspectionId} completed. Final price: ${finalPrice}. TG notifications skipped.`);

    return NextResponse.json({
      success: true,
      inspection: completedInspection,
      finalPrice,
      priceAdjustment,
    });
  } catch (error) {
    console.error('Error completing inspection:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
