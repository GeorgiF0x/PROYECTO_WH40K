import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/perfil', '/mi-galeria', '/dashboard', '/mensajes', '/api/'],
      },
    ],
    sitemap: 'https://grimdarklegion.com/sitemap.xml',
  }
}
