import { NextRequest, NextResponse } from 'next/server';
import { TestingAgent } from '@/agents/TestingAgent';

export async function GET(request: NextRequest) {
  try {
    const testingAgent = new TestingAgent();
    const stats = await testingAgent.getTestStats();
    
    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting test stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get test stats' },
      { status: 500 }
    );
  }
}
