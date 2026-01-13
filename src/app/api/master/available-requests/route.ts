
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'
import { SkupkaStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit

    const whereClause = {
      assignedMasterId: null,
      status: SkupkaStatus.submitted,
    }

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

    return NextResponse.json({
      success: true,
      requests: requests,
      total: total,
    })
  } catch (error) {
    console.error('Error fetching available requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
