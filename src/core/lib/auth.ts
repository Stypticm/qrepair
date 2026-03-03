import { prisma } from '@/lib/prisma';
import { isAdminTelegramId } from './admin';

export type UserRole = 'USER' | 'ADMIN' | 'MANAGER' | 'MASTER' | 'COURIER';

/**
 * Проверяет права доступа пользователя на сервере.
 * Учитывает как жестко заданные ID администраторов, так и роли в БД.
 */
export async function checkRole(
  telegramId: string | number | null,
  allowedRoles: UserRole[] = ['ADMIN']
): Promise<boolean> {
  if (!telegramId) return false;
  
  const idStr = telegramId.toString();

  // 1. Проверка на супер-админа (из конфига/env)
  if (isAdminTelegramId(idStr)) {
    return true;
  }

  // 2. Проверка роли в базе данных
  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: idStr },
      select: { role: true }
    });

    if (!user) return false;

    // Сверяем роль пользователя со списком разрешенных
    return allowedRoles.includes(user.role as UserRole);
  } catch (error) {
    console.error('Error checking user role in DB:', error);
    return false;
  }
}
