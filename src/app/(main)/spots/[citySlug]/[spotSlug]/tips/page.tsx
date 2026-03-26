import { Metadata } from "next";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import TipsTab from "@/components/spots/tabs/tips-tab";
import { getSpot } from "@/services/spot";
import { apiFetch } from "@/lib/api-server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bkkhonest.com";

export async function generateMetadata({ params }: { params: Promise<{ citySlug: string; spotSlug: string }> }): Promise<Metadata> {
  const { citySlug, spotSlug } = await params;
  
  return {
    title: `Community Tips - ${spotSlug} | BKK Honest`,
    description: `Read the latest community tips and scam alerts for ${spotSlug} in Bangkok.`,
    alternates: {
      canonical: `${siteUrl}/spots/${citySlug}/${spotSlug}/tips`
    }
  };
}

export default async function TipsPage({ params }: { params: Promise<{ citySlug: string; spotSlug: string }> }) {
  const { citySlug, spotSlug } = await params;
  const spot = await getSpot(citySlug, spotSlug);
  
  if (!spot) {
    return <div>Spot not found</div>;
  }

  const queryClient = new QueryClient();

  // Prefetch the spot data so the shared header finds it in cache
  queryClient.setQueryData(["spot", citySlug, spotSlug], spot);

  // Prefetch the first page of tips on the server
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["tips-infinite", spot.id, "TRY", "popular"],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const res = await apiFetch(
        `/community-tips/spot/${spot.id}?skip=${pageParam}&take=10&type=TRY&sort=popular`,
        { next: { revalidate: 60 } }
      );
      if (!res.ok) throw new Error("Tips fetch failed");
      return res.json();
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TipsTab spot={spot} />
    </HydrationBoundary>
  );
}