import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'
import { SkupkaStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const masterTelegramId = searchParams.get(
      'masterTelegramId'
    )
    const page = parseInt(
      searchParams.get('page') || '1',
      10
    )
    const limit = parseInt(
      searchParams.get('limit') || '10',
      10
    )
    const skip = (page - 1) * limit

    if (!masterTelegramId) {
      return NextResponse.json(
        { error: 'Master Telegram ID is required' },
        { status: 400 }
      )
    }

    // Находим мастера по его Telegram ID
    const master = await prisma.master.findUnique({
      where: { telegramId: masterTelegramId },
    })

    if (!master) {
      return NextResponse.json({ success: true, requests: [], total: 0 })
    }

    const whereClause = {
      assignedMasterId: master.id,
      status: {
        in: [
          SkupkaStatus.submitted,
          SkupkaStatus.in_progress,
        ], // Use enum values
      },
    }

    // Используем транзакцию для получения заявок и их общего количества
    const [requests, total] = await prisma.$transaction([
      prisma.skupka.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        skip: skip,
        take: limit,
      }),
      prisma.skupka.count({
        where: whereClause,
      }),
    ])

    console.log(
      '🔍 Master requests API - master.id:',
      master.id
    )
    console.log(
      '🔍 Master requests API - found requests:',
      requests.length
    )
    console.log(
      '🔍 Master requests API - total requests:',
      total
    )

    return NextResponse.json({
      success: true,
      requests: requests,
      total: total,
    })
  } catch (error) {
    console.error('Error fetching master requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
