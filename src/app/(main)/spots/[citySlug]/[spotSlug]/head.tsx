import {
  generateBreadcrumbSchema,
  generateSpotSchema,
} from "@/lib/api/schema-generator";

interface SpotHeadProps {
  params: Promise<{
    citySlug: string;
    spotSlug: string;
  }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bkkhonest.com";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default async function Head({ params }: SpotHeadProps) {
  const { citySlug, spotSlug } = await params;
  const path = `/spots/${citySlug}/${spotSlug}`;
  const pageUrl = `${siteUrl}${path}`;

  const response = await fetch(
    `${apiBaseUrl}/spots/by-slug/${encodeURIComponent(citySlug)}/${encodeURIComponent(spotSlug)}`,
    { next: { revalidate: 3600 } },
  ).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  const payload = await response.json();
  const spot = payload?.data || payload;

  const spotSchema = generateSpotSchema(spot, pageUrl);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: `${siteUrl}/` },
    { name: "Spots", item: `${siteUrl}/spots` },
    { name: spot?.city?.name || citySlug, item: `${siteUrl}/spots` },
    { name: spot?.name || "Spot", item: pageUrl },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(spotSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
