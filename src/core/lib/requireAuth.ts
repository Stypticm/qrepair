import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TokenPayload } from '@/lib/auth/jwt';

export type UserRole = 'USER' | 'ADMIN' | 'MANAGER' | 'MASTER' | 'COURIER';

type AuthResult =
  | { user: TokenPayload }
  | NextResponse;

/**
 * Verifies JWT from Authorization: Bearer <token> header.
 * Returns { user } on success, or a NextResponse (401/403) on failure.
 */
export function requireAuth(
  request: NextRequest,
  allowedRoles: UserRole[] = ['ADMIN']
): AuthResult {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    console.error('[requireAuth] Missing or invalid Authorization header');
    return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const user = verifyToken(token);
  
  if (!user) {
    console.error('[requireAuth] Invalid token');
    return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    console.error('[requireAuth] Forbidden role:', user.role);
    return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
  }

  return { user };
}
