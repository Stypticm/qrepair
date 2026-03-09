import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/core/lib/requireAuth';
import { api } from '@/services/api';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { isActive } = await req.json();

    const master = await api.patch<any>('masters', id, { isActive });
    return NextResponse.json({ success: true, master });
  } catch (error) {
    console.error('Error updating master:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req, ['ADMIN']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    // TODO: Handle related inspections in Go backend if needed for consistency
    await api.delete('masters', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting master:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
