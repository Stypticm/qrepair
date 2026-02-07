import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    // Получаем все точки приёма для обычных пользователей
    const points = await prisma.point.findMany({
      orderBy: { id: 'asc' },
    })
    
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
