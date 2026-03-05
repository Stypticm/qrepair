import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/core/lib/prisma';
import { requireAuth } from '@/core/lib/requireAuth';

export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')
    const photoUrl = searchParams.get('photoUrl')

    if (!requestId || !photoUrl) {
      return NextResponse.json({ error: 'Missing requestId or photoUrl' }, { status: 400 })
    }

    const currentSkupka = await prisma.skupka.findUnique({ where: { id: requestId } })

    if (!currentSkupka) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const updatedPhotoUrls = currentSkupka.photoUrls.filter((url) => url !== photoUrl)

    const updatedSkupka = await prisma.skupka.update({
      where: { id: requestId },
      data: { photoUrls: updatedPhotoUrls },
    })

    return NextResponse.json({ success: true, message: 'Фото успешно удалено', skupka: updatedSkupka })
  } catch (error) {
    console.error('Error deleting master photo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
