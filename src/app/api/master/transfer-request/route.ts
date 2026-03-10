import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function POST(req: NextRequest) {
  try {
    const { requestId } = await req.json();

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const updatedRequest = await api.patch<any>('skupka', requestId, {
      assignedMasterId: null,
      status: 'submitted',
    });

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Error transferring request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
