import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Points API - fetching all points...')

    // Получаем все точки приёма для обычных пользователей
    const points = await prisma.point.findMany({
      orderBy: { id: 'asc' },
    })

    console.log(
      '🔍 Points API - found points:',
      points.length
    )
    console.log('🔍 Points API - points data:', points)

    return NextResponse.json({
      success: true,
      points,
    })
  } catch (error) {
    console.error('❌ Error fetching points:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
