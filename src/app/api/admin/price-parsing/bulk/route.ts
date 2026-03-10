import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';
import { requireAuth } from '@/core/lib/requireAuth';

// Функция для реального парсинга через Python API
async function parseDevicePrices(
  deviceId: string,
  sources: string[] = [
    'avito',
    'youla',
    'wildberries',
    'yandex_market',
  ]
) {
  try {
    // Получаем устройство из БД
    const devices = await api.list<any>('devices', { id: deviceId });
    const device = devices && devices.length > 0 ? devices[0] : null;

    if (!device) {
      throw new Error('Device not found');
    }

    const PYTHON_PARSER_URL =
      process.env.PYTHON_PARSER_URL ||
      'http://localhost:8001'
    let allPrices = []
    let useExternalParser = false

    try {
      console.log(
        `🐍 Trying Python parser at: ${PYTHON_PARSER_URL}`
      )

      const deviceName =
        `${device.model} ${device.variant} ${device.storage} ${device.color}`.trim()

      const response = await fetch(
        `${PYTHON_PARSER_URL}/parse-prices`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ deviceName }),
          signal: AbortSignal.timeout
            ? AbortSignal.timeout(30000)
            : undefined,
        }
      )

      if (response.ok) {
        const data = await response.json()
        allPrices = data.results || []
        useExternalParser = true
        console.log(
          `✅ Python parser returned ${allPrices.length} results`
        )
      } else {
        console.log(
          `❌ Python parser failed with status: ${response.status}`
        )
      }
    } catch (error) {
      console.log(
        `❌ Python parser error: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`
      )
    }

    // Если Python парсер недоступен, возвращаем ошибку
    if (!useExternalParser) {
      throw new Error(
        'Python parser not available. Please start the parser server.'
      )
    }

    // Если парсер работает, но результатов нет - это нормально, не ошибка
    if (allPrices.length === 0) {
      console.log(
        `⚠️ No prices found for device: ${device.model} ${device.variant}`
      )
      // Возвращаем успешный результат с пустыми данными
      return {
        success: true,
        device: {
          id: device.id,
          model: device.model,
          variant: device.variant,
          storage: device.storage,
          color: device.color,
          basePrice: device.basePrice,
        },
        parsedPrices: {
          count: 0,
          average: 0,
          min: 0,
          max: 0,
          sources: [],
        },
        comparison: {
          yourPrice: device.basePrice,
          marketAverage: 0,
          difference: device.basePrice,
          differencePercent: '100.0',
          status: 'no_data',
        },
        savedPrices: 0,
      }
    }

    // Сначала удаляем старые записи для этого устройства (старше 1 часа)
    // Go API might require deleting one by one or getting them first then deleting
    const oldPrices = await api.list<any>('market-prices', { deviceId: device.id }); 
    const nowTimestamp = Date.now();
    for (const old of (oldPrices || [])) {
        if (new Date(old.createdAt).getTime() < nowTimestamp - 60 * 60 * 1000) {
           await api.delete('market-prices', old.id);
        }
    }

    // Сохраняем новые цены в БД
    const savedPrices = []

    for (const priceData of allPrices) {
      try {
        // Проверяем, есть ли уже такая запись
        const existingPrices = await api.list<any>('market-prices', {
              deviceId: device.id,
              source: priceData.source,
              price: priceData.price,
              title: priceData.title || '',
        });
        const existingPrice = existingPrices && existingPrices.length > 0 ? existingPrices[0] : null;

        if (existingPrice) {
          // Обновляем существующую запись
          const updatedPrice = await api.patch<any>('market-prices', existingPrice.id, {
                url: priceData.url,
                description: priceData.description,
                location: priceData.location,
                condition: priceData.condition,
                sellerType: priceData.sellerType,
                parsedAt: new Date().toISOString(),
          });
          savedPrices.push(updatedPrice);
        } else {
          // Создаем новую запись
          const savedPrice = await api.create<any>('market-prices', {
                deviceId: device.id,
                source: priceData.source,
                price: priceData.price,
                url: priceData.url,
                title: priceData.title,
                description: priceData.description,
                location: priceData.location,
                condition: priceData.condition,
                sellerType: priceData.sellerType,
                createdAt: new Date().toISOString()
          });
          savedPrices.push(savedPrice);
        }
      } catch (error) {
        console.error(
          `Error saving price from ${priceData.source}:`,
          error
        )
      }
    }

    // Вычисляем статистику
    const avgPrice =
      allPrices.length > 0
        ? allPrices.reduce(
            (sum: number, p: any) => sum + p.price,
            0
          ) / allPrices.length
        : 0
    const minPrice =
      allPrices.length > 0
        ? Math.min(...allPrices.map((p: any) => p.price))
        : 0
    const maxPrice =
      allPrices.length > 0
        ? Math.max(...allPrices.map((p: any) => p.price))
        : 0

    const priceDifference = device.basePrice - avgPrice
    const priceDifferencePercent =
      avgPrice > 0
        ? (
            (priceDifference / device.basePrice) *
            100
          ).toFixed(1)
        : '0'

    return {
      success: true,
      device: {
        id: device.id,
        model: device.model,
        variant: device.variant,
        storage: device.storage,
        color: device.color,
        basePrice: device.basePrice,
      },
      parsedPrices: {
        count: allPrices.length,
        average: Math.round(avgPrice),
        min: minPrice,
        max: maxPrice,
        sources: [
          ...new Set(allPrices.map((p: any) => p.source)),
        ],
      },
      comparison: {
        yourPrice: device.basePrice,
        marketAverage: Math.round(avgPrice),
        difference: Math.round(priceDifference),
        differencePercent: priceDifferencePercent,
        status:
          avgPrice > 0
            ? Math.abs(priceDifference) <
              device.basePrice * 0.1
              ? 'normal'
              : priceDifference > 0
              ? 'overpriced'
              : 'underpriced'
            : 'no_data',
      },
      savedPrices: savedPrices.length,
    }
  } catch (error) {
    console.error('Error parsing device prices:', error)
    throw error
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const {
      limit = 1000, // Парсим все устройства
      sources = ['avito', 'youla', 'wildberries'],
      models = [],
      startFrom = 0,
    } = await req.json()

    // Получаем устройства для парсинга
    const filters: any = {};
    if (models.length > 0) {
        filters.model = models.join(','); // Or however the underlying API accepts arrays
    }
    filters._start = startFrom;
    filters._limit = limit;
    filters._sort = 'createdAt';
    filters._order = 'desc';

    const devices = await api.list<any>('devices', filters);

    if (devices.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No devices found for parsing',
        results: [],
      })
    }

    const results = []
    let totalParsed = 0
    let totalErrors = 0
    let criticalError = false

    // Парсим каждое устройство
    for (const device of devices) {
      // Если была критическая ошибка (например, Python парсер недоступен), останавливаем парсинг
      if (criticalError) {
        break
      }

      try {
        // Вызываем функцию парсинга напрямую
        const parseData = await parseDevicePrices(
          device.id,
          sources
        )

        results.push({
          deviceId: device.id,
          model: `${device.model} ${device.variant}`.trim(),
          storage: device.storage,
          color: device.color,
          success: true,
          parsedCount: parseData.savedPrices || 0,
          averagePrice:
            parseData.parsedPrices?.average || 0,
          yourPrice: device.basePrice,
          difference: parseData.comparison?.difference || 0,
          status: parseData.comparison?.status || 'unknown',
        })
        totalParsed += parseData.savedPrices || 0
      } catch (error) {
        console.error(
          `Error parsing device ${device.id}:`,
          error
        )

        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Unknown error'

        // Проверяем, является ли ошибка критической (Python парсер недоступен)
        if (
          errorMessage.includes(
            'Python parser not available'
          )
        ) {
          criticalError = true
          console.log(
            '🚨 Critical error detected: Python parser not available. Stopping bulk parsing.'
          )
        }

        results.push({
          deviceId: device.id,
          model: `${device.model} ${device.variant}`.trim(),
          success: false,
          error: errorMessage,
        })
        totalErrors++
      }

      // Небольшая задержка между запросами (только если не критическая ошибка)
      if (!criticalError) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000)
        )
      }
    }

    return NextResponse.json({
      success: !criticalError, // Если была критическая ошибка, success = false
      summary: {
        totalDevices: devices.length,
        totalParsed,
        totalErrors,
        sources: sources,
        criticalError: criticalError,
        message: criticalError
          ? 'Python parser not available. Please start the parser server.'
          : undefined,
      },
      results,
    })
  } catch (error) {
    console.error('Error in bulk price parsing:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - получить статистику массового парсинга
export async function GET(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '7')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Статистика по источникам и топ устройств будет ограничена, так как Go API может не иметь таких агрегаций
    // Чтобы сохранить функциональность без создания новых endpoints, мы можем сделать базовый fetch
    // и подсчитать в памяти (поскольку это аналитика)
    
    const marketPrices = await api.list<any>('market-prices', { _limit: 10000 });
    
    const filteredPrices = (marketPrices || []).filter((p: any) => new Date(p.parsedAt) >= startDate);

    let totalPriceSum = 0;
    const sourcesMap: Record<string, { count: number, priceSum: number }> = {};
    const deviceMap: Record<string, any[]> = {};

    filteredPrices.forEach((mp: any) => {
        totalPriceSum += mp.price;
        if (!sourcesMap[mp.source]) sourcesMap[mp.source] = { count: 0, priceSum: 0 };
        sourcesMap[mp.source].count++;
        sourcesMap[mp.source].priceSum += mp.price;

        if (!deviceMap[mp.deviceId]) deviceMap[mp.deviceId] = [];
        deviceMap[mp.deviceId].push(mp);
    });

    const devicesList = await api.list<any>('devices', { _limit: 1000 });
    const topDevicesRaw = devicesList
         .filter((d: any) => deviceMap[d.id] && deviceMap[d.id].length > 0)
         .map((d: any) => ({
             ...d,
             marketPrices: deviceMap[d.id]
         }))
         .sort((a: any, b: any) => b.marketPrices.length - a.marketPrices.length)
         .slice(0, 10);

    const sourceStatsArray = Object.keys(sourcesMap).map(source => ({
         source,
         count: sourcesMap[source].count,
         averagePrice: Math.round(sourcesMap[source].priceSum / sourcesMap[source].count)
    }));

    const avgPriceValue = filteredPrices.length > 0 ? totalPriceSum / filteredPrices.length : 0;

    return NextResponse.json({
      success: true,
      period: `${days} days`,
      statistics: {
        totalPrices: filteredPrices.length,
        averagePrice: Math.round(avgPriceValue),
        sources: sourceStatsArray,
      },
      topDevices: topDevicesRaw.map((device: any) => ({
        id: device.id,
        model: `${device.model} ${device.variant}`.trim(),
        storage: device.storage,
        color: device.color,
        basePrice: device.basePrice,
        parsedCount: device.marketPrices.length,
        averageMarketPrice:
          device.marketPrices.length > 0
            ? Math.round(
                device.marketPrices.reduce(
                  (sum: number, p: any) => sum + p.price,
                  0
                ) / device.marketPrices.length
              )
            : 0,
      })),
    })
  } catch (error) {
    console.error(
      'Error fetching bulk parsing statistics:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
