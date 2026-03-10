import { NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: 'Missing request ID' },
      { status: 400 }
    );
  }

  try {
    const request = await api.get<any>('skupkas', id);

    if (!request || request.status !== 'paid') {
      return NextResponse.json(
        { error: 'No paid request found' },
        { status: 404 }
      );
    }

    const updatedRequest = await api.patch<any>('skupkas', id, {
      status: 'completed',
    });

    return NextResponse.json({
      success: true,
      application: updatedRequest,
    });
  } catch (error) {
    console.error('Error in markPaid:', error);
    return NextResponse.json(
      { error: 'Server error', details: String(error) },
      { status: 500 }
    );
  }
}
