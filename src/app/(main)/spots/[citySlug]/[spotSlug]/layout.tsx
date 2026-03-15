import { Metadata } from 'next';

interface SpotDetailLayoutProps {
  params: Promise<{
    citySlug: string;
    spotSlug: string;
  }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bkkhonest.com';

export async function generateMetadata({ params }: SpotDetailLayoutProps): Promise<Metadata> {
  try {
    const { citySlug, spotSlug } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const path = `/spots/${citySlug}/${spotSlug}`;
    const canonicalUrl = `${siteUrl}${path}`;
    const endpoint = `${baseUrl}/spots/by-slug/${encodeURIComponent(citySlug)}/${encodeURIComponent(spotSlug)}`;

    const response = await fetch(endpoint, { next: { revalidate: 3600 } }).catch(() => null);
    if (!response?.ok) {
      return {
        title: 'Spot Details - BKK Honest',
        description: 'Explore spot details, prices, vibes, and community tips on BKK Honest',
        alternates: { canonical: path },
      };
    }

    const payload = await response.json();
    const spot = payload?.data || payload;
    const spotName = spot?.name || 'Spot Details';
    const spotAddress = spot?.address || 'Bangkok';
    const spotDescription =
      spot?.description || `Explore ${spotName} in ${spotAddress}. See prices, vibes, and community tips.`;
    const imageUrl = spot?.imageUrl;

    return {
      title: `${spotName} - Spot Details | BKK Honest`,
      description: spotDescription,
      keywords: [spotName, spot?.category?.name, spotAddress, 'Bangkok', 'spot', 'prices', 'tips'].filter(Boolean),
      alternates: {
        canonical: path,
      },
      openGraph: {
        title: `${spotName} - Spot Details`,
        description: spotDescription,
        type: 'article',
        url: canonicalUrl,
        images: imageUrl
          ? [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: spotName,
              },
            ]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${spotName} - Spot Details`,
        description: spotDescription,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch {
    return {
      title: 'Spot Details - BKK Honest',
      description: 'Explore spot details, prices, vibes, and community tips on BKK Honest',
    };
  }
}

export default function SpotDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
