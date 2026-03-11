import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from '@/lib/auth/jwt';
import { isAdminTelegramId } from '@/core/lib/admin';

export type UserRole = 'USER' | 'ADMIN' | 'MANAGER' | 'MASTER' | 'COURIER';

type AuthResult =
  | { user: TokenPayload }
  | NextResponse;

/**
 * Verifies JWT from Authorization: Bearer <token> header.
 * Fallback: checks x-telegram-id header for admin whitelist.
 * Returns { user } on success, or a NextResponse (401/403) on failure.
 */
export function requireAuth(
  request: NextRequest,
  allowedRoles: UserRole[] = ['ADMIN']
): AuthResult {
  const authHeader = request.headers.get('authorization');
  const telegramId = request.headers.get('x-telegram-id');
  
  // 1. Check JWT Token
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const user = verifyToken(token);
    
    if (user) {
      if (!allowedRoles.includes(user.role as UserRole)) {
        console.error('[requireAuth] Forbidden role:', user.role);
        return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
      }
      return { user };
    }
    console.error('[requireAuth] Invalid token');
  }

  // 2. Fallback to X-Telegram-Id for Admins
  if (telegramId && isAdminTelegramId(telegramId)) {
    // Only allow this fallback for roles that include ADMIN
    if (allowedRoles.includes('ADMIN')) {
      return { 
        user: { 
          userId: telegramId, 
          telegramId: telegramId, 
          role: 'ADMIN' 
        } as TokenPayload 
      };
    }
  }

  console.error('[requireAuth] Missing or invalid authentication');
  return NextResponse.json({ 
    error: 'Unauthorized - No valid token or identity provided' 
  }, { status: 401 });
}
