import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const telegramId = req.headers.get('x-telegram-id');
    if (!telegramId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const evaluation = await prisma.tradeInEvaluation.create({
      data: {
        userId: telegramId,
        category: data.category,
        model: data.model,
        variant: data.variant || null,
        storage: data.storage,
        color: data.color,
        isOriginal: data.isOriginal,
        isReset: data.isReset,
        screenCondition: data.screenCondition,
        bodyCondition: data.bodyCondition,
        isRostest: data.isRostest,
        batteryHealth: data.batteryHealth,
        hasFullSet: data.hasFullSet,
        wasRepaired: data.wasRepaired,
        hasReceipt: data.hasReceipt,
        isFunctional: data.isFunctional ?? true,
        isBatterySafe: data.isBatterySafe ?? true,
        isHardwareOk: data.isHardwareOk ?? true,
        isClean: data.isClean ?? true,
        calculatedPrice: data.calculatedPrice || 0,
        status: 'pending',
      },
    });

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Error in trade-in evaluation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
