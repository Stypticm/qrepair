import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'
import { SkupkaStatus } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const { requestId } = await req.json()

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    const updatedRequest = await prisma.skupka.update({
      where: { id: requestId },
      data: {
        assignedMasterId: null,
        status: SkupkaStatus.submitted,
      },
    })

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    })
  } catch (error) {
    console.error('Error transferring request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
