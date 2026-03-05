import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { uploadImageToSupabase } from '@/core/lib/uploadImageToSupabase';
import prisma from '@/core/lib/prisma';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await request.formData()
    const photo = formData.get('photo') as File
    const requestId = formData.get('requestId') as string

    if (!photo || !requestId) {
      return NextResponse.json({ error: 'Missing photo or requestId' }, { status: 400 })
    }

    const photoUrl = await uploadImageToSupabase(photo)

    const updatedSkupka = await prisma.skupka.update({
      where: { id: requestId },
      data: { photoUrls: { push: photoUrl } },
    })

    return NextResponse.json({ success: true, photoUrl, message: 'Фото успешно загружено и сохранено', skupka: updatedSkupka })
  } catch (error) {
    console.error('Error uploading master photo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
