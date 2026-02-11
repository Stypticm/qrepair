import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // токен действителен 7 дней

export interface TokenPayload {
  userId: string;
  telegramId: string;
  role: string;
}

/**
 * Создает JWT токен для пользователя
 * @param payload - данные пользователя
 * @returns JWT токен
 */
export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Проверяет и декодирует JWT токен
 * @param token - JWT токен
 * @returns декодированные данные или null если токен невалиден
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
