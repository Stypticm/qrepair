import prisma from '@/core/lib/prisma'
import { isAdminTelegramId } from '@/core/lib/admin'

// DB-based role check — server-side only
export async function checkAdminAccessFromDB(
  telegramId?: string | number | null
): Promise<{ hasAccess: boolean; role: string | null }> {
  if (!telegramId) return { hasAccess: false, role: null }

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: telegramId.toString() },
      select: { role: true },
    })

    if (!user) {
      const hasHardcoded = isAdminTelegramId(telegramId)
      return { hasAccess: hasHardcoded, role: hasHardcoded ? 'ADMIN' : null }
    }

    const adminRoles = ['ADMIN', 'MANAGER', 'MASTER', 'COURIER']
    return {
      hasAccess: adminRoles.includes(user.role),
      role: user.role,
    }
  } catch {
    const hasHardcoded = isAdminTelegramId(telegramId)
    return { hasAccess: hasHardcoded, role: hasHardcoded ? 'ADMIN' : null }
  }
}
