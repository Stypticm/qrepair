import { NextRequest, NextResponse } from 'next/server'

// Простой парсер цен для Vercel (без внешних зависимостей)
export async function POST(request: NextRequest) {
  try {
    const {
      deviceId,
      sources = ['avito', 'youla', 'wildberries'],
    } = await request.json()

    if (!deviceId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Device ID is required',
        },
        { status: 400 }
      )
    }

    // Моковые данные для демонстрации
    const mockPrices = [
      {
        source: 'avito',
        price: 45000,
        title: 'iPhone 13 128GB Space Gray',
        location: 'Москва',
      },
      {
        source: 'youla',
        price: 47000,
        title: 'iPhone 13 128GB Space Gray',
        location: 'СПб',
      },
      {
        source: 'wildberries',
        price: 52000,
        title: 'iPhone 13 128GB Space Gray',
        location: 'Москва',
      },
    ]

    // Фильтруем по запрошенным источникам
    const filteredPrices = mockPrices.filter((p) =>
      sources.includes(p.source)
    )

    const averagePrice =
      filteredPrices.reduce((sum, p) => sum + p.price, 0) /
      filteredPrices.length
    const savedPrices = filteredPrices.length

    return NextResponse.json({
      success: true,
      parsedPrices: {
        prices: filteredPrices,
        average: Math.round(averagePrice),
        count: savedPrices,
      },
      savedPrices,
      comparison: {
        difference: Math.round(averagePrice - 50000), // Предполагаем базовую цену 50000
        status:
          averagePrice > 50000
            ? 'overpriced'
            : averagePrice < 50000
            ? 'underpriced'
            : 'normal',
      },
    })
  } catch (error) {
    console.error('Error parsing prices:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
