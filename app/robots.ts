import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login', '/register'],
      disallow: [
        '/student/',
        '/teacher/',
        '/principal/',
        '/super_admin/',
        '/api/',
      ],
    },
    sitemap: 'https://sikshatantar.app/sitemap.xml',
  };
}
