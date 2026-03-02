// Hardcoded IDs — fallback for dev environment
const DEFAULT_ADMIN_IDS = ['1', '296925626', '531360988', 'qoqos_support'];

const rawAdminIds =
  process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_IDS ||
  process.env.ADMIN_TELEGRAM_IDS;

const parsedAdminIds = rawAdminIds
  ? rawAdminIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
  : [];

export const ADMIN_TELEGRAM_IDS: string[] = Array.from(new Set([...DEFAULT_ADMIN_IDS, ...parsedAdminIds]));

// Quick synchronous check (hardcoded/env IDs only, for client-side)
export const isAdminTelegramId = (
  telegramId?: string | number | null
): boolean => {
  if (telegramId === null || telegramId === undefined) return false;
  const idStr = telegramId.toString().toLowerCase();
  return ADMIN_TELEGRAM_IDS.some(adminId => adminId.toLowerCase() === idStr);
};


