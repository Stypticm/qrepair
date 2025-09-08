import { NextRequest, NextResponse } from 'next/server';
import { TestingAgent } from '@/agents/TestingAgent';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testName = searchParams.get('testName');
    
    const testingAgent = new TestingAgent();
    const results = await testingAgent.getTestResults(testName || undefined);
    
    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error getting test results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get test results' },
      { status: 500 }
    );
  }
}
