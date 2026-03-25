import { Metadata } from "next";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import GalleryTab from "@/components/spots/tabs/gallery-tab";
import { SpotData } from "@/types/spot";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bkkhonest.com";

export async function generateMetadata({ params }: { params: Promise<{ citySlug: string; spotSlug: string }> }): Promise<Metadata> {
  const { citySlug, spotSlug } = await params;
  return {
    title: `Vibe Gallery - ${spotSlug} | BKK Honest`,
    description: `Browse photos and community images for ${spotSlug} to check the actual vibe.`,
    alternates: {
      canonical: `${siteUrl}/spots/${citySlug}/${spotSlug}/gallery`
    }
  };
}

async function getSpot(citySlug: string, spotSlug: string): Promise<SpotData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const endpoint = `${baseUrl}/spots/by-slug/${encodeURIComponent(citySlug)}/${encodeURIComponent(spotSlug)}`;
  try {
    const res = await fetch(endpoint, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json;
  } catch {
    return null;
  }
}

export default async function GalleryPage({ params }: { params: Promise<{ citySlug: string; spotSlug: string }> }) {
  const { citySlug, spotSlug } = await params;
  const spot = await getSpot(citySlug, spotSlug);
  
  if (!spot) {
    return <div>Spot not found</div>;
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["gallery", spot.id, 6, "newest"],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(
        `${baseUrl}/gallery/spot/${spot.id}?take=6&sort=newest`,
        { next: { revalidate: 60 } }
      );
      if (!res.ok) throw new Error("Gallery fetch failed");
      return res.json();
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GalleryTab spot={spot} />
    </HydrationBoundary>
  );
}