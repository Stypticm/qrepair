import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function GET() {
  try {
    const points = await prisma.point.findMany({
      orderBy: { id: 'asc' },
    })

    return NextResponse.json({
      success: true,
      points,
    })
  } catch (error) {
    console.error('Error fetching points:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
