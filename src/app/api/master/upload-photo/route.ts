import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const photo = formData.get('photo') as File;
    const requestId = formData.get('requestId') as string;
    const photoType = formData.get('photoType') as string;

    if (!photo || !requestId || !photoType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Загружаем фото через Go API
    const { url: photoUrl } = await api.upload(photo);

    // Получаем текущую заявку чтобы обновить массив photoUrls
    const existingRequest = await api.get<any>('skupka', requestId);
    const photoUrls = existingRequest.photoUrls || [];
    
    // Сохраняем URL фотографии в базе данных через Go API
    await api.patch<any>('skupka', requestId, {
      photoUrls: [...photoUrls, photoUrl],
    });

    return NextResponse.json({ success: true, photoUrl });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}
