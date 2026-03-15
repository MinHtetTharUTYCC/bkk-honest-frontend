import { generateBreadcrumbSchema, generateScamAlertSchema } from '@/lib/schema-generator';

interface ScamAlertHeadProps {
  params: Promise<{
    citySlug: string;
    alertSlug: string;
  }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bkkhonest.com';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default async function Head({ params }: ScamAlertHeadProps) {
  const { citySlug, alertSlug } = await params;
  const path = `/scam-alerts/${citySlug}/${alertSlug}`;
  const pageUrl = `${siteUrl}${path}`;

  const response = await fetch(
    `${apiBaseUrl}/api/scam-alerts/${encodeURIComponent(alertSlug)}`,
    { next: { revalidate: 3600 } },
  ).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  const payload = await response.json();
  const alert = payload?.data || payload;

  const scamSchema = generateScamAlertSchema(alert, pageUrl);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: `${siteUrl}/` },
    { name: 'Scam Alerts', item: `${siteUrl}/scam-alerts` },
    { name: alert?.city?.name || citySlug, item: `${siteUrl}/scam-alerts` },
    { name: alert?.scamName || 'Scam Alert', item: pageUrl },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(scamSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
