import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/core/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // Получаем заявку по ID
    const request = await prisma.skupka.findUnique({
      where: { id },
      include: {
        assignedMaster: true,
      },
    })

    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    console.log('🔍 Master request API - found request:', {
      id: request.id,
      modelname: request.modelname,
      status: request.status,
      price: request.price,
    })

    return NextResponse.json({
      success: true,
      request: {
        id: request.id,
        modelname: request.modelname,
        price: request.price,
        finalPrice: request.finalPrice,
        username: request.username,
        status: request.status,
        createdAt: request.createdAt,
        sn: request.sn,
        deviceConditions: request.deviceConditions,
        additionalConditions: request.additionalConditions,
        aiAnalysis: request.aiAnalysis,
        photoUrls: request.photoUrls,
        phoneData: request.phoneData,
        deviceData: request.deviceData,
        assignedMaster: request.assignedMaster,
      },
    })
  } catch (error) {
    console.error('Error fetching master request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
