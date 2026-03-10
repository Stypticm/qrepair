import { api } from '@/services/api';
import { isAdminTelegramId } from '@/core/lib/admin';

// DB-based role check — server-side only
export async function checkAdminAccessFromDB(
  telegramId?: string | number | null
): Promise<{ hasAccess: boolean; role: string | null }> {
  if (!telegramId) return { hasAccess: false, role: null };

  try {
    const users = await api.list<any>('users', { telegramId: telegramId.toString() });

    if (!users || users.length === 0) {
      const hasHardcoded = isAdminTelegramId(telegramId);
      return { hasAccess: hasHardcoded, role: hasHardcoded ? 'ADMIN' : null };
    }

    const user = users[0];
    const adminRoles = ['ADMIN', 'MANAGER', 'MASTER', 'COURIER'];
    return {
      hasAccess: adminRoles.includes(user.role),
      role: user.role,
    };
  } catch {
    const hasHardcoded = isAdminTelegramId(telegramId);
    return { hasAccess: hasHardcoded, role: hasHardcoded ? 'ADMIN' : null };
  }
}
