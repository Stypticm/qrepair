import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'
import { requireAuth } from '@/core/lib/requireAuth'

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
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
    })

    if (!device) {
      throw new Error('Device not found')
    }

    // Пытаемся использовать реальный Python парсер
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
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    await prisma.marketPrice.deleteMany({
      where: {
        deviceId: device.id,
        createdAt: {
          lt: oneHourAgo,
        },
      },
    })

    // Сохраняем новые цены в БД
    const savedPrices = []

    for (const priceData of allPrices) {
      try {
        // Проверяем, есть ли уже такая запись
        const existingPrice =
          await prisma.marketPrice.findFirst({
            where: {
              deviceId: device.id,
              source: priceData.source,
              price: priceData.price,
              title: priceData.title || '',
            },
          })

        if (existingPrice) {
          // Обновляем существующую запись
          const updatedPrice =
            await prisma.marketPrice.update({
              where: { id: existingPrice.id },
              data: {
                url: priceData.url,
                description: priceData.description,
                location: priceData.location,
                condition: priceData.condition,
                sellerType: priceData.sellerType,
                parsedAt: new Date(),
              },
            })
          savedPrices.push(updatedPrice)
        } else {
          // Создаем новую запись
          const savedPrice =
            await prisma.marketPrice.create({
              data: {
                deviceId: device.id,
                source: priceData.source,
                price: priceData.price,
                url: priceData.url,
                title: priceData.title,
                description: priceData.description,
                location: priceData.location,
                condition: priceData.condition,
                sellerType: priceData.sellerType,
              },
            })
          savedPrices.push(savedPrice)
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
    const whereClause =
      models.length > 0
        ? {
            model: { in: models },
          }
        : {}

    const devices = await prisma.device.findMany({
      where: whereClause,
      skip: startFrom,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

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

    // Статистика по источникам
    const sourceStats = await prisma.marketPrice.groupBy({
      by: ['source'],
      where: {
        parsedAt: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
      _avg: {
        price: true,
      },
    })

    // Топ устройств по количеству парсинговых цен
    const topDevices = await prisma.device.findMany({
      include: {
        marketPrices: {
          where: {
            parsedAt: {
              gte: startDate,
            },
          },
          select: {
            price: true,
            source: true,
          },
        },
      },
      orderBy: {
        marketPrices: {
          _count: 'desc',
        },
      },
      take: 10,
    })

    // Общая статистика
    const totalPrices = await prisma.marketPrice.count({
      where: {
        parsedAt: {
          gte: startDate,
        },
      },
    })

    const avgPrice = await prisma.marketPrice.aggregate({
      where: {
        parsedAt: {
          gte: startDate,
        },
      },
      _avg: {
        price: true,
      },
    })

    return NextResponse.json({
      success: true,
      period: `${days} days`,
      statistics: {
        totalPrices,
        averagePrice: Math.round(avgPrice._avg.price || 0),
        sources: sourceStats.map((stat) => ({
          source: stat.source,
          count: stat._count.id,
          averagePrice: Math.round(stat._avg.price || 0),
        })),
      },
      topDevices: topDevices.map((device) => ({
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
                  (sum, p) => sum + p.price,
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
