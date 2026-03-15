import type { MetadataRoute } from 'next';

type SitemapEntity = {
  slug?: string;
  updatedAt?: string;
  city?: {
    slug?: string;
  };
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bkkhonest.com';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function fetchAll(endpoint: string): Promise<SitemapEntity[]> {
  const take = 100;
  let skip = 0;
  const all: SitemapEntity[] = [];

  for (let i = 0; i < 50; i += 1) {
    const response = await fetch(`${apiBaseUrl}${endpoint}?skip=${skip}&take=${take}`, {
      next: { revalidate: 3600 },
    }).catch(() => null);

    if (!response?.ok) break;

    const payload = await response.json();
    const items: SitemapEntity[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

    if (items.length === 0) break;
    all.push(...items);

    const pagination = payload?.pagination || payload;
    const total = Number(pagination?.total);
    const pageSkip = Number(pagination?.skip ?? skip);
    const pageTake = Number(pagination?.take ?? take);

    if (!Number.isFinite(total) || pageSkip + pageTake >= total) break;
    skip = pageSkip + pageTake;
  }

  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [spots, scamAlerts] = await Promise.all([
    fetchAll('/spots'),
    fetchAll('/scam-alerts'),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/spots`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/scam-alerts`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/search`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/map`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/how-it-works`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/community-guidelines`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const spotPages: MetadataRoute.Sitemap = spots
    .filter((spot) => spot?.city?.slug && spot?.slug)
    .map((spot) => ({
      url: `${siteUrl}/spots/${spot.city!.slug}/${spot.slug}`,
      lastModified: spot.updatedAt ? new Date(spot.updatedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  const scamPages: MetadataRoute.Sitemap = scamAlerts
    .filter((alert) => alert?.city?.slug && alert?.slug)
    .map((alert) => ({
      url: `${siteUrl}/scam-alerts/${alert.city!.slug}/${alert.slug}`,
      lastModified: alert.updatedAt ? new Date(alert.updatedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  const deduped = new Map<string, MetadataRoute.Sitemap[number]>();
  [...staticPages, ...spotPages, ...scamPages].forEach((entry) => {
    deduped.set(entry.url, entry);
  });

  return [...deduped.values()];
}
