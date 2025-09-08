import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/core/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const recommendations = await prisma.agentRecommendation.findMany({
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    return NextResponse.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
