const DEFAULT_ADMIN_IDS = ['1', '296925626', '531360988'];

const rawAdminIds =
  process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_IDS ||
  process.env.ADMIN_TELEGRAM_IDS;

export const ADMIN_TELEGRAM_IDS: string[] = rawAdminIds
  ? rawAdminIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
  : DEFAULT_ADMIN_IDS;

export const isAdminTelegramId = (
  telegramId?: string | null
): boolean => {
  if (!telegramId) return false;
  return ADMIN_TELEGRAM_IDS.includes(telegramId);
};
