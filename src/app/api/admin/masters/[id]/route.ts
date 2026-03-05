import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import prisma from '@/core/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params
    const { isActive } = await req.json()

    const master = await prisma.master.update({ where: { id }, data: { isActive } })
    return NextResponse.json({ success: true, master })
  } catch (error) {
    console.error('Error updating master:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ['ADMIN']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params

    const relatedInspections = await prisma.deviceInspection.findMany({ where: { master: { id } } })

    if (relatedInspections.length > 0) {
      await prisma.deviceInspection.updateMany({ where: { master: { id } }, data: { masterUsername: '' } })
    }

    await prisma.master.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting master:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
