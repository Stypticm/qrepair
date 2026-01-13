import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const model = searchParams.get('model')
    const variant = searchParams.get('variant')
    const storage = searchParams.get('storage')

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
    if (
      variant !== null &&
      variant !== undefined &&
      variant !== ''
    ) {
      whereClause.variant = variant
    }
    if (storage) whereClause.storage = storage

    console.log('🔍 Colors API - whereClause:', whereClause)

    const colors = await prisma.device.findMany({
      where: whereClause,
      select: {
        color: true,
      },
      distinct: ['color'],
      orderBy: {
        color: 'asc',
      },
    })

    const sortedColors = colors.map(
      (item: { color: string }) => item.color
    )

    console.log('🔍 Colors API - result:', {
      totalFound: colors.length,
      sortedColors: sortedColors,
    })

    return NextResponse.json(sortedColors)
  } catch (error) {
    console.error('Error fetching device colors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch colors' },
      { status: 500 }
    )
  }
}
