type BreadcrumbItem = {
  name: string;
  item: string;
};

type SpotSchemaInput = {
  name?: string;
  description?: string;
  imageUrl?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  category?: { name?: string };
  city?: { name?: string };
  createdAt?: string;
  updatedAt?: string;
};

type ScamAlertSchemaInput = {
  scamName?: string;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: { name?: string };
  city?: { name?: string };
  user?: { name?: string };
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bkkhonest.com';
const orgName = 'BKK Honest';

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

export function generateSpotSchema(spot: SpotSchemaInput, url: string) {
  const spotSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: spot.name || 'Spot',
    description:
      spot.description || `Explore local prices, vibes, and tips for ${spot.name || 'this spot'} on BKK Honest.`,
    url,
    image: spot.imageUrl ? [spot.imageUrl] : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: spot.address || undefined,
      addressLocality: spot.city?.name || 'Bangkok',
      addressCountry: 'TH',
    },
    category: spot.category?.name || undefined,
    dateCreated: spot.createdAt || undefined,
    dateModified: spot.updatedAt || undefined,
    publisher: {
      '@type': 'Organization',
      name: orgName,
      url: siteUrl,
    },
  };

  if (typeof spot.latitude === 'number' && typeof spot.longitude === 'number') {
    spotSchema.geo = {
      '@type': 'GeoCoordinates',
      latitude: spot.latitude,
      longitude: spot.longitude,
    };
  }

  return spotSchema;
}

export function generateScamAlertSchema(alert: ScamAlertSchemaInput, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: alert.scamName || 'Scam Alert',
    description:
      alert.description || `Learn how to identify and avoid ${alert.scamName || 'this scam'} in Bangkok.`,
    image: alert.imageUrl ? [alert.imageUrl] : undefined,
    datePublished: alert.createdAt || undefined,
    dateModified: alert.updatedAt || alert.createdAt || undefined,
    articleSection: alert.category?.name || 'Scam Alert',
    author: {
      '@type': 'Person',
      name: alert.user?.name || 'Community Member',
    },
    publisher: {
      '@type': 'Organization',
      name: orgName,
      url: siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    about: {
      '@type': 'Place',
      name: alert.city?.name || 'Bangkok',
      address: {
        '@type': 'PostalAddress',
        addressLocality: alert.city?.name || 'Bangkok',
        addressCountry: 'TH',
      },
    },
  };
}
