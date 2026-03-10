import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/services/api';
import { requireAuth } from '@/core/lib/requireAuth';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['ADMIN', 'MANAGER']);
  if (auth instanceof NextResponse) return auth;

  try {
    const unreadLeads = await api.list<any>('quick-leads', { isRead: 'false' });
    
    for (const lead of unreadLeads) {
        await api.patch('quick-leads', lead.id, { 
            isRead: true,
            updatedAt: new Date().toISOString()
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking leads as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
