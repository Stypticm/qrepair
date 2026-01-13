import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Оптимизация производительности
  experimental: {
    // Убираем optimizeCss - вызывает проблемы с critters
    // optimizeCss: true,
    optimizePackageImports: [
      '@telegram-apps/telegram-ui',
      '@radix-ui/react-dialog',
    ],
  },

  // Оптимизация изображений
  images: {
    // PROD: можно убрать, если оптимизация критична
    unoptimized: true,

    // Оптимизация загрузки изображений
    deviceSizes: [
      640, 750, 828, 1080, 1200, 1920, 2048, 3840,
    ],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sources.imeicheck.net',
        pathname: '/**',
      },
    ],
  },

  // Убираем swcMinify - устарел в Next.js 15
  // swcMinify: true,

  // Оптимизация бандла
  webpack: (config, { dev, isServer }) => {
    // Убираем Eruda из бандла в продакшене
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        eruda: false,
      }

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
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      // Добавляем заголовки для лучшего отображения на PC и отключения кэширования
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
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

  // Отключаем автоматическую генерацию 404 страницы
  // чтобы избежать ошибки prerendering
  trailingSlash: false,
}

export default nextConfig
