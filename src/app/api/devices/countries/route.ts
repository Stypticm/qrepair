import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const model = searchParams.get('model')
    const variant = searchParams.get('variant')
    const storage = searchParams.get('storage')
    const color = searchParams.get('color')
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
    if (variant !== undefined) whereClause.variant = variant
    if (storage) whereClause.storage = storage
    if (color) whereClause.color = color
    if (simType) whereClause.simType = simType

    console.log(
      '🔍 Countries API - whereClause:',
      whereClause
    )

    const countries = await prisma.device.findMany({
      where: whereClause,
      select: {
        country: true,
      },
      distinct: ['country'],
      orderBy: {
        country: 'asc',
      },
    })

    const sortedCountries = countries.map(
      (item: { country: string }) => item.country
    )

    console.log('🔍 Countries API - result:', {
      totalFound: countries.length,
      sortedCountries: sortedCountries,
    })

    return NextResponse.json({
      success: true,
      countries: sortedCountries,
    })
  } catch (error) {
    console.error('Error fetching device countries:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch countries',
      },
      { status: 500 }
    )
  }
}
