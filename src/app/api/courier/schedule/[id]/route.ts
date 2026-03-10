import { NextResponse } from 'next/server';
import { api } from '@/services/api';

const TIME_SLOTS = [
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { masterUsername } = body as {
    masterUsername?: string;
  };

  if (!id || !masterUsername) {
    return NextResponse.json(
      { error: 'Missing id or masterUsername' },
      { status: 400 }
    );
  }

  try {
    // Находим мастера по username через Go API
    const masterList = await api.list<any>('masters', { username: masterUsername });
    const master = masterList[0];

    if (!master) {
      return NextResponse.json(
        { error: 'Master not found' },
        { status: 404 }
      );
    }

    const app = await api.get<any>('skupkas', id);
    if (!app) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Обновляем заявку: назначаем мастера
    await api.patch<any>('skupkas', id, {
      courier: {
        ...(app.courier || {}),
        telegramId: master.telegramId,
        userConfirmed: false,
      },
    });

    // Генерация слотов в зависимости от времени
    const now = new Date();
    const currentHour = now.getHours();
    let slots: string[] = [];

    if (currentHour < 10) {
      slots = TIME_SLOTS.filter((slot) => {
        const [slotHour] = slot.split(':').map(Number);
        return slotHour >= 10 && slotHour <= 20;
      });
    } else if (currentHour >= 10 && currentHour < 20) {
      slots = TIME_SLOTS.filter((slot) => {
        const [slotHour] = slot.split(':').map(Number);
        return slotHour >= currentHour + 1 && slotHour <= 20;
      });
    } else {
      slots = TIME_SLOTS;
    }

    // DEV: тестовый слот
    if (process.env.NODE_ENV !== 'production') {
      const plus5 = new Date(now.getTime() + 5 * 60 * 1000);
      const hh = String(plus5.getHours()).padStart(2, '0');
      const mm = String(plus5.getMinutes()).padStart(2, '0');
      slots = [`${hh}:${mm}`, ...slots.slice(0, 5)];
    }

    return NextResponse.json({ 
      success: true, 
      slots,
      message: currentHour >= 20 ? 'Выберите удобное время на завтра' : 'Выберите удобное время'
    });
  } catch (error) {
    console.error('Error in courier schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
