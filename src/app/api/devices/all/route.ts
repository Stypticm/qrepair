import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function GET(request: NextRequest) {
  try {
    // Получаем ВСЕ устройства из БД без ограничений через Go API
    // Для этого ставим большой limit или убираем пагинацию, если Go API поддерживает (например, _limit=10000)
    const allDevices = await api.list<any>('devices', { _limit: 10000, _sort: 'model,variant,storage,color,basePrice', _order: 'asc,asc,asc,asc,asc' });

    if (!allDevices || allDevices.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No devices found' },
        { status: 404 }
      );
    }

    // Дедупликация: оставляем только уникальные комбинации model + variant + storage + color
    const uniqueDevices = [];
    const seen = new Set();

    for (const device of allDevices) {
      const key = `${device.model}_${device.variant}_${device.storage}_${device.color}`;

      if (!seen.has(key)) {
        seen.add(key);
        uniqueDevices.push(device);
      }
    }

    console.log(`Total devices from API: ${allDevices.length}`);
    console.log(
      `Unique devices after deduplication: ${uniqueDevices.length}`
    );

    return NextResponse.json({
      success: true,
      devices: uniqueDevices,
      count: uniqueDevices.length,
      totalInDb: allDevices.length,
      duplicatesRemoved:
        allDevices.length - uniqueDevices.length,
    });
  } catch (error) {
    console.error('Error fetching all devices:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch devices',
      },
      { status: 500 }
    );
  }
}
