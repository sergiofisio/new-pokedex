import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "./lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: 'Taverna',
    description: SITE_DESCRIPTION,
    lang: 'pt-BR',
    start_url: '/',
    display: 'standalone',
    background_color: '#1c0a03',
    theme_color: '#7c2d12',
    categories: ['games', 'entertainment'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/brand/icon-1024.png', sizes: '1024x1024', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
