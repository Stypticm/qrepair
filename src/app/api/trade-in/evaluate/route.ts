import { NextResponse } from 'next/server';
import { api } from '@/services/api';
import { notifyAllAdmins } from '@/lib/notifications/admin-notifications';

export async function POST(req: Request) {
  try {
    const telegramId = req.headers.get('x-telegram-id');
    if (!telegramId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const evaluation = await api.create<any>('trade-in-evaluations', {
      telegramId,
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
    });

    // Notify Admins
    await notifyAllAdmins({
        title: `📱 Новая заявка Trade-in`,
        body: `${data.model} ${data.storage} ${data.color} - ${data.calculatedPrice} ₽`,
        url: `/admin/trade-in?id=${evaluation.id}`
    });

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Error in trade-in evaluation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
