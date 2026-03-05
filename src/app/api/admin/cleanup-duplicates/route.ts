import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/lib/prisma';
import { requireAuth } from '@/core/lib/requireAuth';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN']);
  if (auth instanceof NextResponse) return auth;

  try {
    const duplicates = await prisma.$queryRaw`
      SELECT 
        "deviceId", 
        "source", 
        "price", 
        "title",
        COUNT(*) as count,
        array_agg(id) as ids
      FROM "MarketPrice" 
      WHERE "createdAt" > NOW() - INTERVAL '24 hours'
      GROUP BY "deviceId", "source", "price", "title"
      HAVING COUNT(*) > 1
    `

    let cleanedCount = 0

    for (const duplicate of duplicates as any[]) {
      const ids = duplicate.ids
      const keepId = ids[ids.length - 1]
      const deleteIds = ids.slice(0, -1)

      if (deleteIds.length > 0) {
        await prisma.marketPrice.deleteMany({ where: { id: { in: deleteIds } } })
        cleanedCount += deleteIds.length
        console.log(`🧹 Cleaned ${deleteIds.length} duplicates for device ${duplicate.deviceId}`)
      }
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const oldRecords = await prisma.marketPrice.deleteMany({ where: { createdAt: { lt: sevenDaysAgo } } })

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      cleanedDuplicates: cleanedCount,
      cleanedOldRecords: oldRecords.count,
      totalCleaned: cleanedCount + oldRecords.count,
    })
  } catch (error) {
    console.error('Error during cleanup:', error)
    return NextResponse.json({ success: false, error: 'Cleanup failed', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN']);
  if (auth instanceof NextResponse) return auth;

  try {
    const duplicateStats = await prisma.$queryRaw`
      SELECT 
        "deviceId", 
        "source", 
        COUNT(*) as count
      FROM "MarketPrice" 
      WHERE "createdAt" > NOW() - INTERVAL '24 hours'
      GROUP BY "deviceId", "source"
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC
    `

    const totalRecords = await prisma.marketPrice.count()
    const recentRecords = await prisma.marketPrice.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    })

    return NextResponse.json({
      success: true,
      stats: { totalRecords, recentRecords, duplicateGroups: (duplicateStats as any[]).length, duplicates: duplicateStats },
    })
  } catch (error) {
    console.error('Error getting duplicate stats:', error)
    return NextResponse.json({ success: false, error: 'Failed to get stats', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
