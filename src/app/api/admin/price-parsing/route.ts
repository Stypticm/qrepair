import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'

const PYTHON_PARSER_URL =
  process.env.PYTHON_PARSER_URL || 'http://localhost:8001'

// Определяем, работаем ли мы на Vercel
const isVercel = process.env.VERCEL === '1'

// Интерфейс для парсинговых данных
interface ParsedPrice {
  source: string
  price: number
  url?: string
  title?: string
  description?: string
  location?: string
  condition?: string
  sellerType?: string
}

// Функция для создания поискового запроса из данных устройства
function createSearchQuery(device: any): string {
  const parts = []

  if (device.model) parts.push(device.model)
  if (device.variant) parts.push(device.variant)
  if (device.storage) parts.push(device.storage)
  if (device.color) parts.push(device.color)

  return parts.join(' ').toLowerCase().replace(/\s+/g, '_')
}

// Mock-функция удалена - используем только реальный парсинг

export async function POST(req: NextRequest) {
  try {
    const {
      deviceId,
      sources = ['avito', 'youla', 'wildberries'],
    } = await req.json()

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      )
    }

    // Получаем устройство из БД
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
    })

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      )
    }

    let allPrices: ParsedPrice[] = []
    let useExternalParser = false

    if (isVercel) {
      // На Vercel используем внутренний API
      try {
        console.log(`🌐 Using internal parser on Vercel`)

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/parse-prices`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              deviceId: deviceId,
              sources: sources,
            }),
          }
        )

        if (response.ok) {
          const data = await response.json()
          allPrices = data.parsedPrices?.prices || []
          useExternalParser = true
          console.log(
            `✅ Internal parser returned ${allPrices.length} results`
          )
        } else {
          console.log(
            `❌ Internal parser failed with status: ${response.status}`
          )
        }
      } catch (error) {
        console.log(
          `❌ Internal parser error: ${
            error instanceof Error
              ? error.message
              : String(error)
          }`
        )
      }
    } else {
      // Локально пытаемся использовать Python парсер
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
    }

    // Если внешний парсер не сработал, возвращаем ошибку
    if (!useExternalParser || allPrices.length === 0) {
      console.log(
        `❌ Python parser not available, skipping device ${device.id}`
      )
      return NextResponse.json(
        {
          success: false,
          error:
            'Python parser not available. Please start the parser server.',
          deviceId: device.id,
          model: device.model,
          variant: device.variant,
        },
        { status: 503 }
      )
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
        ? allPrices.reduce((sum, p) => sum + p.price, 0) /
          allPrices.length
        : 0
    const minPrice =
      allPrices.length > 0
        ? Math.min(...allPrices.map((p) => p.price))
        : 0
    const maxPrice =
      allPrices.length > 0
        ? Math.max(...allPrices.map((p) => p.price))
        : 0

    const priceDifference = device.basePrice - avgPrice
    const priceDifferencePercent =
      avgPrice > 0
        ? (
            (priceDifference / device.basePrice) *
            100
          ).toFixed(1)
        : '0'

    return NextResponse.json({
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
          ...new Set(allPrices.map((p) => p.source)),
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
      parserUsed: useExternalParser
        ? isVercel
          ? 'Internal'
          : 'Python'
        : 'Mock',
    })
  } catch (error) {
    console.error('Error parsing prices:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - получить статистику парсинга для устройства
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const deviceId = searchParams.get('deviceId')

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      )
    }

    // Получаем устройство
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: {
        marketPrices: {
          orderBy: { parsedAt: 'desc' },
          take: 50, // Последние 50 записей
        },
      },
    })

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      )
    }

    // Группируем по источникам
    const pricesBySource = device.marketPrices.reduce(
      (acc, price) => {
        if (!acc[price.source]) {
          acc[price.source] = []
        }
        acc[price.source].push(price.price)
        return acc
      },
      {} as Record<string, number[]>
    )

    // Вычисляем статистику по источникам
    const sourceStats = Object.entries(pricesBySource).map(
      ([source, prices]) => ({
        source,
        count: prices.length,
        average: Math.round(
          prices.reduce((sum, p) => sum + p, 0) /
            prices.length
        ),
        min: Math.min(...prices),
        max: Math.max(...prices),
        lastParsed: device.marketPrices.find(
          (p) => p.source === source
        )?.parsedAt,
      })
    )

    // Общая статистика
    const allPrices = device.marketPrices.map(
      (p) => p.price
    )
    const avgPrice =
      allPrices.length > 0
        ? Math.round(
            allPrices.reduce((sum, p) => sum + p, 0) /
              allPrices.length
          )
        : 0

    return NextResponse.json({
      success: true,
      device: {
        id: device.id,
        model: device.model,
        variant: device.variant,
        storage: device.storage,
        color: device.color,
        basePrice: device.basePrice,
      },
      statistics: {
        totalPrices: device.marketPrices.length,
        averagePrice: avgPrice,
        sources: sourceStats,
      },
      comparison: {
        yourPrice: device.basePrice,
        marketAverage: avgPrice,
        difference: device.basePrice - avgPrice,
        differencePercent:
          avgPrice > 0
            ? (
                ((device.basePrice - avgPrice) /
                  device.basePrice) *
                100
              ).toFixed(1)
            : '0',
      },
    })
  } catch (error) {
    console.error('Error fetching price statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
