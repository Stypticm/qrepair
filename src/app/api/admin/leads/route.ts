import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/core/lib/prisma';
import { requireAuth } from '@/core/lib/requireAuth';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const leads = await prisma.quickLead.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const lead = await prisma.quickLead.update({ where: { id }, data: { status } });
    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
