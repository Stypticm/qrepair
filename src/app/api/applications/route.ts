import { api } from '@/services/api';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Получаем все нужные статусы. Возможно понадобится сделать несколько запросов или получить все и отфильтровать,
    // если Go API не поддерживает фильтрацию по IN напрямую.
    const allApplications = await api.list<any>('skupkas', { _limit: 10000 });
    const validStatuses = [
        'draft',
        'accepted',
        'in_progress',
        'on_the_way',
        'completed',
        'paid',
    ];
    
    const applications = (allApplications || []).filter((app: any) => validStatuses.includes(app.status));
    
    return NextResponse.json(applications);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { telegramId } = body;

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Missing telegramId' },
        { status: 400 }
      );
    }

    const applications = await api.list<any>('skupkas', { telegramId, status: 'accepted' });
    let updateCount = 0;
    
    for (const app of applications || []) {
        await api.patch<any>('skupkas', app.id, {
            status: 'in_progress',
            updatedAt: new Date().toISOString()
        });
        updateCount++;
    }

    // Telegram сообщения убраны по просьбе пользователя

    return NextResponse.json({ success: true, updated: { count: updateCount } });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
