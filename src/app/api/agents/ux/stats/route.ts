import { NextRequest, NextResponse } from 'next/server';
import { UXAnalyticsAgent } from '@/agents/UXAnalyticsAgent';

export async function GET(request: NextRequest) {
  try {
    const uxAgent = new UXAnalyticsAgent();
    const stats = await uxAgent.getUXStats();
    
    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting UX stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get UX stats' },
      { status: 500 }
    );
  }
}
