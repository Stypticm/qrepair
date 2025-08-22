import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin(
  './src/core/i18n/i18n.ts'
)

// Определяем домен Supabase из переменных окружения,
// чтобы картинки оставались доступными между окружениями
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
let supabaseHost: string | undefined
try {
  if (supabaseUrl) {
    supabaseHost = new URL(supabaseUrl).host
  }
} catch {}

const nextConfig: NextConfig = {
  images: {
    // Разрешаем как конкретные домены, так и шаблон для Supabase
    domains: [
      'aygvejwrrifuhbkbivoa.supabase.co',
      ...(supabaseHost ? [supabaseHost] : []),
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
