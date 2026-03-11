import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface ScamAlertLayoutProps {
  params: {
    citySlug: string;
    alertSlug: string;
  };
}

export async function generateMetadata({ params }: ScamAlertLayoutProps): Promise<Metadata> {
  try {
    const { citySlug, alertSlug } = params;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Fetch alert data for dynamic metadata
    const response = await fetch(
      `${baseUrl}/api/scam-alerts/${alertSlug}`,
      { next: { revalidate: 3600 } }
    ).catch(() => null);

    if (!response?.ok) {
      return {
        title: 'Scam Alert - BKK Honest',
        description: 'View scam alert details and community discussion',
      };
    }

    const alert = await response.json();
    const alertData = alert.data || alert;

    return {
      title: `${alertData.scamName} - Scam Alert | BKK Honest`,
      description: alertData.description || `Learn about the ${alertData.scamName} scam and how to protect yourself`,
      keywords: [alertData.scamName, alertData.category?.name, 'scam', 'alert', 'Bangkok'].filter(Boolean),
      openGraph: {
        title: `${alertData.scamName} - Scam Alert`,
        description: alertData.description || `Learn about the ${alertData.scamName} scam`,
        type: 'article',
        url: `https://bkkhonest.com/scam-alerts/${citySlug}/${alertSlug}`,
        images: alertData.imageUrl ? [{
          url: alertData.imageUrl,
          width: 1200,
          height: 630,
          alt: alertData.scamName,
        }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${alertData.scamName} - Scam Alert`,
        description: alertData.description || `Learn about the ${alertData.scamName} scam`,
        images: alertData.imageUrl ? [alertData.imageUrl] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Scam Alert - BKK Honest',
      description: 'View scam alert details and community discussion',
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
