import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';
import { requireAuth } from '@/core/lib/requireAuth';

export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');
    const photoUrl = searchParams.get('photoUrl');

    if (!requestId || !photoUrl) {
      return NextResponse.json({ error: 'Missing requestId or photoUrl' }, { status: 400 });
    }

    const currentSkupka = await api.get<any>('skupkas', requestId);

    if (!currentSkupka) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const photoUrls = currentSkupka.photoUrls || [];
    const updatedPhotoUrls = photoUrls.filter((url: string) => url !== photoUrl);

    const updatedSkupka = await api.patch<any>('skupkas', requestId, { 
      photoUrls: updatedPhotoUrls,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: 'Фото успешно удалено', skupka: updatedSkupka });
  } catch (error) {
    console.error('Error deleting master photo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
