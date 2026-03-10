import { NextResponse } from 'next/server';
import { api } from '@/services/api';

// Генерация 6-значного OTP токена
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { skupkaId, masterUsername } = body;

    if (!skupkaId || !masterUsername) {
      return NextResponse.json(
        { error: 'Missing skupkaId or masterUsername' },
        { status: 400 }
      );
    }

    // Проверяем, что заявка существует через Go API
    const skupka = await api.get<any>('skupkas', skupkaId);
    if (!skupka) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Ищем мастера по username через Go API
    const masters = await api.list<any>('masters', {
      username: masterUsername,
      isActive: 'true',
    });
    const masterUser = masters[0];

    if (!masterUser) {
      return NextResponse.json(
        { error: 'Master not found with this username' },
        { status: 404 }
      );
    }

    // Проверяем назначение мастера (из JSON courier)
    const assignedTelegramId = (skupka.courier || {}).telegramId;
    if (assignedTelegramId !== masterUser.telegramId) {
      return NextResponse.json(
        { error: 'Master not assigned to this request' },
        { status: 403 }
      );
    }

    // Генерируем OTP токен
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 минут

    // Создаём или обновляем запись проверки через Go API
    const inspectionId = `${skupkaId}_${masterUsername}`;
    
    // Пробуем найти существующую проверку
    let inspection;
    try {
      inspection = await api.get<any>('device-inspections', inspectionId);
      if (inspection) {
        inspection = await api.patch<any>('device-inspections', inspectionId, {
          inspectionToken: otp,
          tokenExpiresAt: expiresAt.toISOString(),
        });
      }
    } catch (e) {
      // Если не найдена, создаем новую
      inspection = await api.create<any>('device-inspections', {
        id: inspectionId,
        skupkaId,
        masterUsername,
        inspectionToken: otp,
        tokenExpiresAt: expiresAt.toISOString(),
        testsResults: [],
        createdAt: new Date().toISOString(),
      });
    }

    console.log(`Starting inspection for ${skupkaId}. OTP generated (not sent to TG): ${otp}`);

    return NextResponse.json({
      success: true,
      inspectionId: inspection.id,
      expiresAt: expiresAt.toISOString(),
      // Для разработки возвращаем OTP, раз мы его больше не шлем в TG
      otp: otp 
    });
  } catch (error) {
    console.error('Error starting inspection:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
