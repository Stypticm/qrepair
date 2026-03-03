import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/core/lib/prisma'
import { checkRole } from '@/core/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const adminId = req.headers.get('x-admin-id')
    const hasAccess = await checkRole(adminId, ['ADMIN', 'MANAGER'])
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const points = await prisma.point.findMany({
      orderBy: { id: 'asc' },
    })

    return NextResponse.json({ points })
  } catch (error) {
    console.error('Error fetching points:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
