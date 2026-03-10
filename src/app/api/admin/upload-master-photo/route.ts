import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { uploadImageToSupabase } from '@/core/lib/uploadImageToSupabase';
import { api } from '@/services/api';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await request.formData();
    const photo = formData.get('photo') as File;
    const requestId = formData.get('requestId') as string;

    if (!photo || !requestId) {
      return NextResponse.json({ error: 'Missing photo or requestId' }, { status: 400 });
    }

    const photoUrl = await uploadImageToSupabase(photo);

    const currentSkupka = await api.get<any>('skupkas', requestId);
    if (!currentSkupka) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const photoUrls = currentSkupka.photoUrls || [];
    photoUrls.push(photoUrl);

    const updatedSkupka = await api.patch<any>('skupkas', requestId, { 
      photoUrls,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, photoUrl, message: 'Фото успешно загружено и сохранено', skupka: updatedSkupka });
  } catch (error) {
    console.error('Error uploading master photo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
