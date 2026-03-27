import { Metadata } from "next";

interface ScamAlertLayoutProps {
  params: Promise<{
    citySlug: string;
    alertSlug: string;
  }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bkkhonest.com";

export async function generateMetadata({
  params,
}: ScamAlertLayoutProps): Promise<Metadata> {
  try {
    const { citySlug, alertSlug } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const encodedCitySlug = encodeURIComponent(citySlug);
    const encodedAlertSlug = encodeURIComponent(alertSlug);
    const path = `/scam-alerts/${encodedCitySlug}/${encodedAlertSlug}`;
    const canonicalUrl = `${siteUrl}${path}`;

    // Fetch alert data for dynamic metadata
    const response = await fetch(
      `${baseUrl}/scam-alerts/by-slug/${encodeURIComponent(citySlug)}/${encodeURIComponent(alertSlug)}`,
      { next: { revalidate: 3600 } },
    ).catch(() => null);

    if (!response?.ok) {
      return {
        title: "Scam Alert - BKK Honest",
        description: "View scam alert details and community discussion",
        alternates: { canonical: path },
      };
    }

    const alert = await response.json();
    const alertData = alert.data || alert;
    
    // Get display image variant for OG tags
    const ogImageUrl = alertData.imageVariants?.display || null;

    return {
      title: `${alertData.scamName} - Scam Alert | BKK Honest`,
      description:
        alertData.description ||
        `Learn about the ${alertData.scamName} scam and how to protect yourself`,
      keywords: [
        alertData.scamName,
        alertData.category?.name,
        "scam",
        "alert",
        "Bangkok",
      ].filter(Boolean),
      openGraph: {
        title: `${alertData.scamName} - Scam Alert`,
        description:
          alertData.description || `Learn about the ${alertData.scamName} scam`,
        type: "article",
        url: canonicalUrl,
        images: ogImageUrl
          ? [
              {
                url: ogImageUrl,
                width: 1200,
                height: 630,
                alt: alertData.scamName,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${alertData.scamName} - Scam Alert`,
        description:
          alertData.description || `Learn about the ${alertData.scamName} scam`,
        images: ogImageUrl ? [ogImageUrl] : [],
      },
      alternates: {
        canonical: path,
      },
    };
  } catch (error) {
    return {
      title: "Scam Alert - BKK Honest",
      description: "View scam alert details and community discussion",
    };
  }
}

export default function ScamAlertDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
