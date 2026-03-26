import { Metadata } from "next";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import GalleryTab from "@/components/spots/tabs/gallery-tab";
import { getSpot } from "@/services/spot";
import { apiFetch } from "@/lib/api-server";

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

export default async function GalleryPage({ params }: { params: Promise<{ citySlug: string; spotSlug: string }> }) {
  const { citySlug, spotSlug } = await params;
  const spot = await getSpot(citySlug, spotSlug);
  
  if (!spot) {
    return <div>Spot not found</div>;
  }

  const queryClient = new QueryClient();

  // Prefetch the spot data so the shared header finds it in cache
  queryClient.setQueryData(["spot", citySlug, spotSlug], spot);

  await queryClient.prefetchQuery({
    queryKey: ["gallery", spot.id, 6, "newest"],
    queryFn: async () => {
      const res = await apiFetch(
        `/gallery/spot/${spot.id}?take=6&sort=newest`,
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