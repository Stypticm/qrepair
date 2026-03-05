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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return { user };
}
