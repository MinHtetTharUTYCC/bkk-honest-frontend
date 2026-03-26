import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSpot } from "@/services/spot";

interface SpotDetailLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    citySlug: string;
    spotSlug: string;
  }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bkkhonest.com";

export async function generateMetadata({ params }: { params: Promise<{ citySlug: string; spotSlug: string }> }): Promise<Metadata> {
  const { citySlug, spotSlug } = await params;
  const spot = await getSpot(citySlug, spotSlug);
  const path = `/spots/${citySlug}/${spotSlug}`;
  const canonicalUrl = `${siteUrl}${path}`;

  if (!spot) {
    return {
      title: "Spot Not Found - BKK Honest",
      description: "Explore spot details, prices, vibes, and community tips on BKK Honest",
      alternates: { canonical: path },
    };
  }

  const spotName = spot.name;
  const spotAddress = spot.address;
  const spotDescription = `Explore ${spotName} in ${spotAddress}. See prices, vibes, and community tips.`;
  const imageUrl = spot.imageUrl;

  return {
    title: `${spotName} - Spot Details | BKK Honest`,
    description: spotDescription,
    keywords: [spotName, spot.category?.name, spotAddress, "Bangkok", "spot", "prices", "tips"].filter(Boolean) as string[],
    alternates: { canonical: path },
    openGraph: {
      title: `${spotName} - Spot Details`,
      description: spotDescription,
      type: "article",
      url: canonicalUrl,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: spotName }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${spotName} - Spot Details`,
      description: spotDescription,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

import SpotHeaderClient from "./spot-header-client";

export default async function SpotDetailLayout({ children, params }: SpotDetailLayoutProps) {
  const { citySlug, spotSlug } = await params;
  const spot = await getSpot(citySlug, spotSlug);

  if (!spot) {
    notFound();
  }

  const basePath = `/spots/${citySlug}/${spotSlug}`;

  return (
    <div className="space-y-12 pb-24">
      <SpotHeaderClient 
        spot={spot} 
        citySlug={citySlug} 
        spotSlug={spotSlug} 
        basePath={basePath}
      >
        {children}
      </SpotHeaderClient>
    </div>
  );
}