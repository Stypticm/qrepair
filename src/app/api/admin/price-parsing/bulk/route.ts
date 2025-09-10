import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'

// Импортируем функцию парсинга напрямую
async function parseDevicePrices(
  deviceId: string,
  sources: string[] = ['avito', 'youla', 'wildberries']
) {
  try {
    // Получаем устройство из БД
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
    })

    if (!device) {
      throw new Error('Device not found')
    }

    // Генерируем моковые цены (упрощенная версия)
    const basePrice = device.basePrice || 50000
    const variation = 0.3

    const prices = []

    // Avito - б/у устройства (дешевле)
    for (let i = 0; i < 3; i++) {
      const priceVariation =
        (Math.random() - 0.5) * 2 * variation
      const price = Math.round(
        basePrice * (1 + priceVariation) * 0.7
      )

      prices.push({
        source: 'Avito',
        price: price,
        url: `https://avito.ru/moskva/telefony/iphone_${device.model.toLowerCase()}_${i}`,
        title: `iPhone ${device.model} ${device.variant} ${device.storage} ${device.color}`,
        description: 'Продаю iPhone в отличном состоянии',
        location: 'Москва',
        condition: [
          'б/у',
          'отличное состояние',
          'хорошее состояние',
        ][i],
        sellerType: ['частник', 'магазин', 'салон'][i],
      })
    }

    // Youla - альтернативная площадка
    for (let i = 0; i < 2; i++) {
      const priceVariation =
        (Math.random() - 0.5) * 2 * variation
      const price = Math.round(
        basePrice * (1 + priceVariation) * 0.75
      )

      prices.push({
        source: 'Youla',
        price: price,
        url: `https://youla.ru/moskva/telefony/iphone_${device.model.toLowerCase()}_${i}`,
        title: `iPhone ${device.model} ${device.variant} ${device.storage}`,
        description: 'Продаю iPhone, торг уместен',
        location: 'Москва',
        condition: ['б/у', 'отличное состояние'][i],
        sellerType: ['частник', 'магазин'][i],
      })
    }

    // Wildberries - новые устройства (дороже)
    for (let i = 0; i < 2; i++) {
      const priceVariation =
        (Math.random() - 0.5) * 2 * 0.15
      const price = Math.round(
        basePrice * (1 + priceVariation) * 1.2
      )

      prices.push({
        source: 'Wildberries',
        price: price,
        url: `https://wildberries.ru/catalog/0/search.aspx?search=iphone_${device.model.toLowerCase()}_${i}`,
        title: `iPhone ${device.model} ${device.variant} ${device.storage} ${device.color}`,
        description: 'Официальный iPhone с гарантией',
        location: 'Россия',
        condition: 'новый',
        sellerType: ['Wildberries', 'Официальный магазин'][
          i
        ],
      })
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

    for (const priceData of prices) {
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
      prices.length > 0
        ? prices.reduce((sum, p) => sum + p.price, 0) /
          prices.length
        : 0
    const minPrice =
      prices.length > 0
        ? Math.min(...prices.map((p) => p.price))
        : 0
    const maxPrice =
      prices.length > 0
        ? Math.max(...prices.map((p) => p.price))
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
        count: prices.length,
        average: Math.round(avgPrice),
        min: minPrice,
        max: maxPrice,
        sources: [...new Set(prices.map((p) => p.source))],
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
  try {
    const {
      limit = 10,
      sources = ['avito', 'youla'],
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

    // Парсим каждое устройство
    for (const device of devices) {
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
        results.push({
          deviceId: device.id,
          model: `${device.model} ${device.variant}`.trim(),
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Unknown error',
        })
        totalErrors++
      }

      // Небольшая задержка между запросами
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      )
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalDevices: devices.length,
        totalParsed,
        totalErrors,
        sources: sources,
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
