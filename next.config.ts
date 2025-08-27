import type { NextConfig } from 'next'

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
  // Оптимизация производительности
  experimental: {
    optimizeCss: true, // Оптимизация CSS
    optimizePackageImports: [
      '@telegram-apps/telegram-ui',
      '@radix-ui/react-dialog',
    ], // Оптимизация импортов пакетов
  },

  // Оптимизация изображений
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
    // DEV/TELEGRAM: отключаем оптимизацию изображений, чтобы избежать проблем в webview Telegram
    // PROD: можно убрать, если оптимизация критична
    unoptimized: true,

    // Оптимизация загрузки изображений
    deviceSizes: [
      640, 750, 828, 1080, 1200, 1920, 2048, 3840,
    ],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Оптимизация компиляции
  swcMinify: true,

  // Оптимизация бандла
  webpack: (config, { dev, isServer }) => {
    // Оптимизация для production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          telegram: {
            test: /[\\/]node_modules[\\/]@telegram-apps[\\/]/,
            name: 'telegram',
            chunks: 'all',
            priority: 10,
          },
        },
      }
    }

    return config
  },

  // Оптимизация заголовков
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ]
  },

  // Оптимизация redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
