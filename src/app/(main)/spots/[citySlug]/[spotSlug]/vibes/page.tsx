import { Metadata } from "next";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import VibesTab from "@/components/spots/tabs/vibes-tab";
import { getSpot } from "@/services/spot";
import { apiFetch } from "@/lib/api-server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bkkhonest.com";

export async function generateMetadata({ params }: { params: Promise<{ citySlug: string; spotSlug: string }> }): Promise<Metadata> {
  const { citySlug, spotSlug } = await params;
  return {
    title: `Live Vibes - ${spotSlug} | BKK Honest`,
    description: `Check live crowd levels and wait times for ${spotSlug} before you go.`,
    alternates: {
      canonical: `${siteUrl}/spots/${citySlug}/${spotSlug}/vibes`
    }
  };
}

export default async function VibesPage({ params }: { params: Promise<{ citySlug: string; spotSlug: string }> }) {
  const { citySlug, spotSlug } = await params;
  const spot = await getSpot(citySlug, spotSlug);
  
  if (!spot) {
    return <div>Spot not found</div>;
  }

  const queryClient = new QueryClient();

  // Prefetch the spot data so the shared header finds it in cache
  queryClient.setQueryData(["spot", citySlug, spotSlug], spot);

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["live-vibes-infinite", { spotId: spot.id }],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const res = await apiFetch(
        `/live-vibes?spotId=${spot.id}&skip=${pageParam}&take=10`,
        { next: { revalidate: 60 } }
      );
      if (!res.ok) throw new Error("Vibes fetch failed");
      return res.json();
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <VibesTab spot={spot} />
    </HydrationBoundary>
  );
}