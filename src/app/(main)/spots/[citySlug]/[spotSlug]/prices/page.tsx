import { Metadata } from "next";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import PricesTab from "@/components/spots/tabs/prices-tab";
import { PaginatedPriceReportsDto, SpotWithStatsResponseDto } from "@/types/api-models";
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
    title: `Price Reports - ${spotSlug} | BKK Honest`,
    description: `Check recent price reports to see if ${spotSlug} is fair or overpriced.`,
    alternates: {
      canonical: `${siteUrl}/spots/${citySlug}/${spotSlug}/prices`,
    },
  };
}

export default async function PricesPage({
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
    queryKey: ["price-reports-infinite", spot.id],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const query = new URLSearchParams();
      query.set("take", "10");
      if (typeof pageParam === "number" && pageParam > 0) {
        query.set("skip", String(pageParam));
      }

      const response = await apiFetch(
        `/price-reports/spot/${spot.id}?${query.toString()}`,
        { next: { revalidate: 60 } },
      );
      const payload: unknown = await response.json();

      return {
        data: unwrapApiSuccessData<PaginatedPriceReportsDto>(payload),
      };
    },
    getNextPageParam: (lastPage: unknown) =>
      getNextSkipFromPage(lastPage, true),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PricesTab spot={spot as SpotWithStatsResponseDto} />
    </HydrationBoundary>
  );
}
