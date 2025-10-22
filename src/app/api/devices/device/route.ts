import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const model = searchParams.get('model')
    const variant = searchParams.get('variant')
    const storage = searchParams.get('storage')
    const color = searchParams.get('color')

    if (!model || !storage || !color) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Model, storage, and color parameters are required',
        },
        { status: 400 }
      )
    }

    // Строим whereClause без null значений
    const whereClause: any = {
      model,
      storage,
      color,
    }

    // Добавляем variant только если он не пустой
    if (variant && variant !== '' && variant !== 'null') {
      whereClause.variant = variant
    } else {
      // Если variant пустой, ищем устройства с пустым variant
      whereClause.variant = ''
    }

    console.log('🔍 Device API - whereClause:', whereClause)

    let device = await prisma.device.findFirst({
      where: whereClause,
    })

    // Если не найдено с пустым variant, пробуем найти любое устройство с этой моделью
    if (!device && (variant === '' || variant === 'null')) {
      console.log(
        '🔍 Device API - trying fallback search without variant'
      )
      const fallbackWhereClause = {
        model,
        storage,
        color,
      }

      device = await prisma.device.findFirst({
        where: fallbackWhereClause,
      })
    }

    if (!device) {
      return NextResponse.json(
        {
          success: false,
          error: 'Device not found',
        },
        { status: 404 }
      )
    }

    console.log('🔍 Device API - found device:', {
      id: device.id,
      model: device.model,
      variant: device.variant,
      storage: device.storage,
      color: device.color,
      basePrice: device.basePrice,
    })

    return NextResponse.json(device)
  } catch (error) {
    console.error('Error fetching device:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch device' },
      { status: 500 }
    )
  }
}
