import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const model = searchParams.get('model')
    const variant = searchParams.get('variant')
    const storage = searchParams.get('storage')
    const color = searchParams.get('color')
    const country = searchParams.get('country')
    const simType = searchParams.get('simType')

    if (!model) {
      return NextResponse.json(
        {
          success: false,
          error: 'Model parameter is required',
        },
        { status: 400 }
      )
    }

    const whereClause: any = { model }
    // Обрабатываем пустую строку как пустой вариант
    if (variant && variant !== '') {
      whereClause.variant = variant
    } else if (variant === '') {
      whereClause.variant = ''
    }
    if (storage) whereClause.storage = storage
    if (color) whereClause.color = color
    if (country) whereClause.country = country
    if (simType) whereClause.simType = simType

    const limit = parseInt(
      searchParams.get('limit') || '50'
    )

    const devices = await prisma.device.findMany({
      where: whereClause,
      select: {
        id: true,
        model: true,
        variant: true,
        storage: true,
        color: true,
        country: true,
        simType: true,
        basePrice: true,
      },
      take: limit,
      orderBy: {
        basePrice: 'asc',
      },
    })

    if (devices.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Devices not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      devices,
      count: devices.length,
    })
  } catch (error) {
    console.error('Error fetching device price:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch device price',
      },
      { status: 500 }
    )
  }
}
