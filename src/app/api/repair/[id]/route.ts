import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';
import { checkAdminAccessFromDB } from '@/core/lib/admin-server';
import { notifyUser } from '@/lib/notifications/user-notifications';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const telegramId = request.headers.get('x-telegram-id');

    if (!telegramId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await api.get<any>('repair-requests', id, {
      _embed: 'assignedMaster'
    });

    if (!requestData) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Проверяем доступ: либо владелец заявки, либо сотрудник
    const { hasAccess } = await checkAdminAccessFromDB(telegramId);
    
    if (requestData.telegramId !== telegramId && !hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ request: requestData });
  } catch (error) {
    console.error('Error fetching repair request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const telegramId = request.headers.get('x-telegram-id');
    if (!telegramId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Только сотрудники могут менять статус
    const { hasAccess } = await checkAdminAccessFromDB(telegramId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates = await request.json();
    
    // Запрещаем менять некоторые поля напрямую
    delete updates.id;
    delete updates.telegramId;
    delete updates.createdAt;

    updates.updatedAt = new Date().toISOString();

    const result = await api.patch<any>('repair-requests', id, updates);

    // Уведомляем клиента о смене статуса или финальной цене
    try {
      if (result.telegramId) {
        let body = 'Статус вашей заявки на ремонт обновлён.';
        let needsNotification = false;

        if (updates.status) {
          needsNotification = true;
          const statusMap: Record<string, string> = {
            created: 'Заявка создана',
            courier_assigned: 'Назначен курьер',
            in_transit: 'Устройство в пути в сервис',
            received: 'Устройство принято в сервисе',
            diagnosing: 'Идёт диагностика устройства',
            price_approval: 'Требуется подтверждение стоимости ремонта',
            repairing: 'Устройство в ремонте',
            ready_for_pickup: 'Ремонт завершён, устройство готово к возврату',
            delivered: 'Ремонт завершён, устройство выдано',
          };
          
          if (updates.status === 'price_approval') {
             body = `Оценили ремонт. Оригинал: ${updates.priceOriginal} ₽, Не оригинал: ${updates.priceNonOriginal} ₽. Выберите вариант.`;
          } else if (updates.status === 'ready_for_pickup') {
             body = updates.returnMethod === 'courier_return' 
                ? 'Ремонт завершён! Ожидайте звонка курьера для доставки.'
                : 'Ремонт завершён! Заберите устройство в нашем сервисном центре.';
          } else {
             const statusText = statusMap[updates.status] || updates.status;
             body = `Статус вашей заявки на ремонт: ${statusText}.`;
          }
        } else if (typeof updates.finalPrice === 'number' && !updates.status) {
          needsNotification = true;
          body = `Итоговая стоимость ремонта: ${updates.finalPrice.toLocaleString('ru-RU')} ₽.`;
        }

        if (needsNotification) {
          await notifyUser(result.telegramId, {
            title: 'Обновление по ремонту устройства',
            body,
            url: `/repair/status/${id}`,
          });
        }
      }

      // Если обновился статус и есть назначенный мастер - уведомить его
      if (result.assignedMasterId && updates.status === 'repairing') {
          // Ищем telegramId мастера (предполагаем, что master.telegramId это строка)
          const master = await api.get<any>('masters', result.assignedMasterId);
          if (master && master.telegramId) {
              await notifyUser(master.telegramId, {
                  title: `Заявка #${String(id).slice(-6)}: Клиент подтвердил цену`,
                  body: `Можете приступать к ремонту. Клиент выбрал: ${result.clientPriceChoice || 'стандарт'}`,
                  url: `/admin/repair`
              });
          }
      }

    } catch (notifyError) {
      console.error('[Repair] Failed to send status notification:', notifyError);
    }

    return NextResponse.json({ success: true, request: result });
  } catch (error) {
    console.error('Error updating repair request:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}
