import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Генерирует случайный пароль
 * @param length - длина пароля (по умолчанию 10)
 * @returns случайный пароль из букв и цифр
 */
export function generatePassword(length: number = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    password += chars[randomIndex];
  }
  
  return password;
}

/**
 * Хеширует пароль с использованием bcrypt
 * @param password - пароль для хеширования
 * @returns хеш пароля
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Проверяет пароль с хешем
 * @param password - введенный пароль
 * @param hash - сохраненный хеш
 * @returns true если пароль совпадает
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
