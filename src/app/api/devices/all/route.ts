import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Получаем ВСЕ устройства из БД без ограничений
    const allDevices = await prisma.device.findMany({
      select: {
        id: true,
        model: true,
        variant: true,
        storage: true,
        color: true,
        country: true,
        simType: true,
        basePrice: true,
      },
      orderBy: [
        { model: 'asc' },
        { variant: 'asc' },
        { storage: 'asc' },
        { color: 'asc' },
        { basePrice: 'asc' },
      ],
    })

    if (allDevices.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No devices found' },
        { status: 404 }
      )
    }

    // Дедупликация: оставляем только уникальные комбинации model + variant + storage + color
    const uniqueDevices = []
    const seen = new Set()

    for (const device of allDevices) {
      const key = `${device.model}_${device.variant}_${device.storage}_${device.color}`

      if (!seen.has(key)) {
        seen.add(key)
        uniqueDevices.push(device)
      }
    }

    console.log(`Total devices in DB: ${allDevices.length}`)
    console.log(
      `Unique devices after deduplication: ${uniqueDevices.length}`
    )

    return NextResponse.json({
      success: true,
      devices: uniqueDevices,
      count: uniqueDevices.length,
      totalInDb: allDevices.length,
      duplicatesRemoved:
        allDevices.length - uniqueDevices.length,
    })
  } catch (error) {
    console.error('Error fetching all devices:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch devices',
      },
      { status: 500 }
    )
  }
}
