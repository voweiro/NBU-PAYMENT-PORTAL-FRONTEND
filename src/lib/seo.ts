import type { Metadata } from 'next';

// Base SEO configuration
export const siteConfig = {
  name: 'Nigerian British University Payment Portal',
  description: 'Secure online payment portal for Nigerian British University fees, programs, and services. Pay your tuition, accommodation, and other university fees safely and conveniently.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://payment.nbu.edu.ng',
  ogImage: '/og-image.svg',
  keywords: [
    'Nigerian British University',
    'NBU payment portal',
    'university fees payment',
    'tuition payment',
    'online payment',
    'student portal',
    'university payment system',
    'secure payment',
    'education payment',
    'Nigeria university'
  ],
  author: 'Nigerian British University',
  creator: 'Nigerian British University IT Department',
  publisher: 'Nigerian British University'
};

// Generate metadata for pages
export function generateMetadata({
  title,
  description,
  image,
  noIndex = false,
  keywords = [],
  canonical,
}: {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
  canonical?: string;
} = {}): Metadata {
  const metaTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const metaDescription = description || siteConfig.description;
  const metaImage = image || siteConfig.ogImage;
  const metaKeywords = [...siteConfig.keywords, ...keywords];

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords.join(', '),
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_NG',
      url: canonical || siteConfig.url,
      title: metaTitle,
      description: metaDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
      creator: '@NBUNigeria',
      site: '@NBUNigeria',
    },
    alternates: {
      canonical: canonical || siteConfig.url,
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
    },
    category: 'education',
  };
}

// Structured data for organization
export const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Nigerian British University',
  alternateName: 'NBU',
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.png`,
  description: 'A leading private university in Nigeria offering world-class education with British standards.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'Nigeria',
    addressRegion: 'Abuja',
    addressLocality: 'Abuja',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+234-XXX-XXX-XXXX',
    contactType: 'customer service',
    availableLanguage: ['English'],
  },
  sameAs: [
    'https://facebook.com/NBUNigeria',
    'https://twitter.com/NBUNigeria',
    'https://linkedin.com/company/nigerian-british-university',
    'https://instagram.com/nbunigeria',
  ],
};

// Structured data for payment service
export const paymentServiceStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'University Payment Portal',
  description: 'Secure online payment system for university fees and services',
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Nigerian British University',
  },
  serviceType: 'Payment Processing',
  areaServed: 'Nigeria',
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: siteConfig.url,
    serviceSmsNumber: '+234-XXX-XXX-XXXX',
  },
};