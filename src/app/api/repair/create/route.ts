import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';
import { notifyAllAdmins } from '@/lib/notifications/admin-notifications';

export async function POST(request: NextRequest) {
  try {
    const telegramIdHeader = request.headers.get('x-telegram-id');
    const data = await request.json();

    // Базовая валидация
    if (!data.deviceModel || !data.category || !data.deliveryMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Для гостей и неавторизованных в Telegram пользователей формируем веб-идентификатор
    const telegramId =
      telegramIdHeader && telegramIdHeader.trim() !== ''
        ? telegramIdHeader
        : data.telegramId || (data.clientContact ? `web_${data.clientContact.replace(/[^\w+]/g, '')}` : `web_${crypto.randomUUID().slice(0, 10)}`);

    // Создаем заявку на ремонт с явным ID
    const newId = crypto.randomUUID();
    const repairRequest = await api.create<any>('repair-requests', {
      id: newId,
      telegramId,
      deviceModel: data.deviceModel,
      serialNumber: data.serialNumber || null,
      category: data.category,
      issueDescription: data.issueDescription || null,
      issuePhotos: data.issuePhotos || [],
      estimatedMin: data.estimatedMin || null,
      estimatedMax: data.estimatedMax || null,
      deliveryMethod: data.deliveryMethod,
      clientContact: data.clientContact || null,
      clientAddress: data.clientAddress || null,
      appointmentDate: data.appointmentDate ? new Date(data.appointmentDate).toISOString() : null,
      appointmentTime: data.appointmentTime || null,
      status: 'created',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // После успешного создания отправляем подробное уведомление администраторам в Telegram
    try {
        const contactStr = data.clientContact ? `📞 Контакт: <b>${data.clientContact}</b>` : '📞 Контакт: не указан';
        const deliveryStr = data.deliveryMethod === 'courier'
            ? `🚚 Доставка: <b>Курьер</b> (${data.appointmentDate || ''} ${data.appointmentTime || ''})\n📍 Адрес: ${data.clientAddress || 'Не указан'}`
            : '🏪 Способ: <b>Клиент привезет сам в СЦ</b>';
        const priceStr = data.estimatedMin && data.estimatedMax
            ? `💰 Предв. смета: <b>${Number(data.estimatedMin).toLocaleString('ru')} – ${Number(data.estimatedMax).toLocaleString('ru')} ₽</b>`
            : '';

        const bodyParts = [
            `📱 Устройство: <b>${data.deviceModel || 'iPhone'}</b>`,
            `🛠 Неисправности: <b>${data.category}</b>`,
            data.issueDescription ? `📝 Описание: <i>${data.issueDescription}</i>` : '',
            data.issuePhotos && data.issuePhotos.length > 0 ? `📸 Прикреплено фото: <b>${data.issuePhotos.length} шт.</b>` : '',
            deliveryStr,
            contactStr,
            priceStr,
        ].filter(Boolean).join('\n');

        await notifyAllAdmins({
            title: '🛠 Новая заявка на ремонт!',
            body: bodyParts,
            url: `/admin/repair`
        });
    } catch (notifyErr) {
        console.error('[Repair Create] Failed to notify admins in Telegram:', notifyErr);
    }

    return NextResponse.json({ success: true, id: newId, guestId: telegramId });
  } catch (error) {
    console.error('Error creating repair request:', error);
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    );
  }
}
