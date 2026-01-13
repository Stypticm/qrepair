import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const {
      finalPrice,
      inspectionNotes,
      masterId,
      pointId,
      feedback,
    } = await request.json()

    if (!finalPrice || !masterId || !pointId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Mock сохранение оценки
    // В реальном приложении здесь была бы логика сохранения в БД
    const evaluation = {
      finalPrice,
      inspectionNotes,
      masterId,
      pointId,
      feedback,
      createdAt: new Date().toISOString(),
    }

    console.log('Master evaluation saved:', evaluation)

    return NextResponse.json({
      success: true,
      evaluation,
    })
  } catch (error) {
    console.error('Error saving master evaluation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
