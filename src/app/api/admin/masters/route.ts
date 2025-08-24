import { NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function GET() {
  try {
    const masters = await prisma.master.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      masters,
    })
  } catch (error) {
    console.error('Error fetching masters:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
