import { NextRequest } from 'next/server';

/**
 * Валидирует токен из заголовка X-Internal-Token.
 * Если токен не совпадает, выбрасывает ошибку (или возвращает Response).
 */
export function validateAgentToken(req: NextRequest): boolean {
  const token = req.headers.get('x-internal-token');
  const expectedToken = process.env.INTERNAL_API_TOKEN;

  // Если токен не задан в .env, то API по умолчанию закрыто
  if (!expectedToken) {
    console.warn('INTERNAL_API_TOKEN is not set in environment variables');
    return false;
  }

  return token === expectedToken;
}
