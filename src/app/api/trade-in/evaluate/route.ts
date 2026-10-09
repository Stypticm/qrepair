import { NextResponse } from 'next/server';
import { api } from '@/services/api';
import { notifyAllAdmins } from '@/lib/notifications/admin-notifications';

export async function POST(req: Request) {
  try {
    const telegramIdHeader = req.headers.get('x-telegram-id');
    const data = await req.json();

    // Для гостей и неавторизованных в Telegram пользователей формируем веб-идентификатор
    const telegramId =
      telegramIdHeader && telegramIdHeader.trim() !== ''
        ? telegramIdHeader
        : data.telegramId || `web_${crypto.randomUUID().slice(0, 10)}`;

    const evaluation = await api.create<any>('trade-in-evaluations', {
      telegramId,
      category: data.category || 'iPhone',
      model: data.model,
      variant: data.variant || null,
      storage: data.storage,
      color: data.color,
      isOriginal: data.isOriginal ?? true,
      isReset: data.isReset ?? true,
      screenCondition: data.screenCondition || data.bodyCondition || 'good',
      bodyCondition: data.bodyCondition || 'good',
      isRostest: data.isRostest ?? true,
      batteryHealth: data.batteryHealth || '100%',
      hasFullSet: data.hasFullSet ?? true,
      wasRepaired: data.wasRepaired ?? false,
      hasReceipt: data.hasReceipt ?? false,
      isFunctional: data.isFunctional ?? true,
      isBatterySafe: data.isBatterySafe ?? true,
      isHardwareOk: data.isHardwareOk ?? true,
      isClean: data.isClean ?? true,
      calculatedPrice: data.calculatedPrice || 0,
      contact: data.contact || '',
      status: 'pending',
    });

    // Отправляем уведомление администраторам в Telegram
    try {
      const conditionMap: Record<string, string> = {
        perfect: 'Безупречный ✨',
        good: 'Хороший 👍',
        worn: 'Изношен 😐',
        bad: 'Плохое 💔',
      };

      const condTitle = conditionMap[data.bodyCondition] || data.bodyCondition || '—';

      const bodyParts = [
        `📱 Устройство: <b>${data.category || 'iPhone'} ${data.model || ''}</b>`,
        `💾 Память: <b>${data.storage || '—'}</b> | Цвет: <b>${data.color || '—'}</b>`,
        `✨ Состояние: <b>${condTitle}</b> | АКБ: <b>${data.batteryHealth || '100%'}</b>`,
        `📦 Комплект: <b>${data.hasFullSet ? 'Да' : 'Нет'}</b> | Ростест: <b>${data.isRostest ? 'Да' : 'Нет'}</b>`,
        `🔒 iCloud: <b>${data.isReset ? 'Отвязан' : 'Привязан'}</b> | Оригинал: <b>${data.isOriginal ? 'Да' : 'Нет'}</b>`,
        data.contact ? `📞 Контакт: <b>${data.contact}</b>` : '',
        data.calculatedPrice ? `💰 Расчетная цена: <b>${Number(data.calculatedPrice).toLocaleString('ru')} ₽</b>` : '',
      ].filter(Boolean).join('\n');

      await notifyAllAdmins({
        title: '📱 Новая заявка на выкуп (Trade-in)!',
        body: bodyParts,
        url: `/admin/trade-in?id=${evaluation?.id || ''}`
      });
    } catch (notifyErr) {
      console.error('[Trade-in Evaluate] Notification failed:', notifyErr);
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Error in trade-in evaluation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
