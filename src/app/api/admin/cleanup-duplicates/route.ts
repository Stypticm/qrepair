import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';
import { requireAuth } from '@/core/lib/requireAuth';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN']);
  if (auth instanceof NextResponse) return auth;

  try {
    // We fetch recent market prices to process duplicates in memory since we can't do raw SQL
    // In a real scenario, the Go API should have a specific endpoint for this cron job
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // Fetch prices (limit sufficiently high for a cron job)
    const recentPrices = await api.list<any>('market-prices', { _limit: 10000 });
    const filteredPrices = (recentPrices || []).filter((p: any) => new Date(p.createdAt) > new Date(twentyFourHoursAgo));

    // Map to group
    const groups: Record<string, string[]> = {};
    filteredPrices.forEach((p: any) => {
        const key = `${p.deviceId}_${p.source}_${p.price}_${p.title}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(p.id);
    });

    let cleanedCount = 0;

    for (const key in groups) {
      const ids = groups[key];
      if (ids.length > 1) {
          // keep the last one (assuming IDs are sortable or we just keep one)
          const keepId = ids[ids.length - 1];
          const deleteIds = ids.slice(0, -1);
          
          for (const id of deleteIds) {
              await api.delete('market-prices', id);
          }
          cleanedCount += deleteIds.length;
          console.log(`🧹 Cleaned ${deleteIds.length} duplicates for a device group`);
      }
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    // Again, doing this in memory or relying on the Go API having a cleanup mechanism
    const oldPrices = (recentPrices || []).filter((p: any) => new Date(p.createdAt) < sevenDaysAgo);
    let oldRecordsCount = 0;
    for (const old of oldPrices) {
        await api.delete('market-prices', old.id);
        oldRecordsCount++;
    }

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      cleanedDuplicates: cleanedCount,
      cleanedOldRecords: oldRecordsCount,
      totalCleaned: cleanedCount + oldRecordsCount,
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json({ success: false, error: 'Cleanup failed', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN']);
  if (auth instanceof NextResponse) return auth;

  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const allPrices = await api.list<any>('market-prices', { _limit: 20000 });
    const recentRecords = (allPrices || []).filter((p: any) => new Date(p.createdAt) >= twentyFourHoursAgo);

    const groups: Record<string, number> = {};
    recentRecords.forEach((p: any) => {
       const key = `${p.deviceId}_${p.source}`;
       groups[key] = (groups[key] || 0) + 1;
    });

    const duplicateGroups = Object.entries(groups).filter(([_, count]) => count > 1);
    
    return NextResponse.json({
      success: true,
      stats: { 
          totalRecords: (allPrices || []).length, 
          recentRecords: recentRecords.length, 
          duplicateGroups: duplicateGroups.length, 
          duplicates: duplicateGroups.map(([key, count]) => ({ key, count })) 
      },
    });
  } catch (error) {
    console.error('Error getting duplicate stats:', error);
    return NextResponse.json({ success: false, error: 'Failed to get stats', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

