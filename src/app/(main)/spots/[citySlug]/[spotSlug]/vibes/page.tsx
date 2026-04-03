import { Metadata } from "next";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import VibesTab from "@/components/spots/tabs/vibes-tab";
import { PaginatedLiveVibesDto, SpotWithStatsResponseDto } from "@/types/api-models";
import { getSpot } from "@/services/spot";
import { apiFetch } from "@/lib/api/api-server";
import { unwrapApiSuccessData } from "@/lib/api/api-envelope";
import { getNextSkipFromPage } from "@/hooks/api/base";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bkkhonest.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ citySlug: string; spotSlug: string }>;
}): Promise<Metadata> {
  const { citySlug, spotSlug } = await params;
  return {
    title: `Live Vibes - ${spotSlug} | BKK Honest`,
    description: `Check live crowd levels and wait times for ${spotSlug} before you go.`,
    alternates: {
      canonical: `${siteUrl}/spots/${citySlug}/${spotSlug}/vibes`,
    },
  };
}

export default async function VibesPage({
  params,
}: {
  params: Promise<{ citySlug: string; spotSlug: string }>;
}) {
  const { citySlug, spotSlug } = await params;
  const spot = await getSpot(citySlug, spotSlug);

  if (!spot) {
    return <div>Spot not found</div>;
  }

  const queryClient = new QueryClient();

  // Prefetch the spot data so the shared header finds it in cache
  queryClient.setQueryData(["spot-by-slug", citySlug, spotSlug], spot);

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["live-vibes-infinite", { spotId: spot.id }],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const query = new URLSearchParams();
      query.set("spotId", spot.id);
      query.set("take", "10");
      if (typeof pageParam === "number" && pageParam > 0) {
        query.set("skip", String(pageParam));
      }

      const response = await apiFetch(`/live-vibes?${query.toString()}`, {
        next: { revalidate: 60 },
      });
      const payload: unknown = await response.json();

      return {
        data: unwrapApiSuccessData<PaginatedLiveVibesDto>(payload),
      };
    },
    getNextPageParam: (lastPage: unknown) => {
      const pageData =
        typeof lastPage === "object" && lastPage !== null && "data" in lastPage
          ? (lastPage as { data: unknown }).data
          : lastPage;
      return getNextSkipFromPage(pageData, true);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <VibesTab spot={spot as SpotWithStatsResponseDto} />
    </HydrationBoundary>
  );
}
