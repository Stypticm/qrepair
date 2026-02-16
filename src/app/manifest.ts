import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Qoqos',
    short_name: 'Qoqos',
    description: 'Qoqos — выкуп смартфонов',
    start_url: '/?source=pwa',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: 'https://yirenghydwhxdoxyzntl.supabase.co/storage/v1/object/public/pictures/submit.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'https://yirenghydwhxdoxyzntl.supabase.co/storage/v1/object/public/pictures/submit.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'https://yirenghydwhxdoxyzntl.supabase.co/storage/v1/object/public/pictures/submit.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'https://yirenghydwhxdoxyzntl.supabase.co/storage/v1/object/public/pictures/submit.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'https://yirenghydwhxdoxyzntl.supabase.co/storage/v1/object/public/pictures/submit.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
