import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/payment',
          '/payment/lookup',
        ],
        disallow: [
          '/admin/',
          '/admin/*',
          '/payment/callback/',
          '/payment/callback/*',
          '/api/',
          '/api/*',
          '/_next/',
          '/_next/*',
        ],
      },
      // Specific rules for search engine bots
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/payment',
          '/payment/lookup',
        ],
        disallow: [
          '/admin/',
          '/payment/callback/',
          '/api/',
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}