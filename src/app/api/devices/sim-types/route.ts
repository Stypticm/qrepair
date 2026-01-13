import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const model = searchParams.get('model')
    const variant = searchParams.get('variant')
    const storage = searchParams.get('storage')
    const color = searchParams.get('color')

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
    if (variant !== undefined) whereClause.variant = variant
    if (storage) whereClause.storage = storage
    if (color) whereClause.color = color

    console.log(
      '🔍 Sim types API - whereClause:',
      whereClause
    )

    const simTypes = await prisma.device.findMany({
      where: whereClause,
      select: {
        simType: true,
      },
      distinct: ['simType'],
      orderBy: {
        simType: 'asc',
      },
    })

    const sortedSimTypes = simTypes.map(
      (item: { simType: string }) => item.simType
    )

    console.log('🔍 Sim types API - result:', {
      totalFound: simTypes.length,
      sortedSimTypes: sortedSimTypes,
    })

    return NextResponse.json({
      success: true,
      simTypes: sortedSimTypes,
    })
  } catch (error) {
    console.error('Error fetching device sim types:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sim types',
      },
      { status: 500 }
    )
  }
}
