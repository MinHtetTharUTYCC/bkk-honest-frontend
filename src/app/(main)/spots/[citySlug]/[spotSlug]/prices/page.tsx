import { Metadata } from "next";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import PricesTab from "@/components/spots/tabs/prices-tab";
import { getSpot } from "@/services/spot";
import { priceReportsControllerFindBySpot } from "@/api/generated/price-reports/price-reports";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bkkhonest.com";

export async function generateMetadata({ params }: { params: Promise<{ citySlug: string; spotSlug: string }> }): Promise<Metadata> {
  const { citySlug, spotSlug } = await params;
  return {
    title: `Price Reports - ${spotSlug} | BKK Honest`,
    description: `Check recent price reports to see if ${spotSlug} is fair or overpriced.`,
    alternates: {
      canonical: `${siteUrl}/spots/${citySlug}/${spotSlug}/prices`
    }
  };
}

export default async function PricesPage({ params }: { params: Promise<{ citySlug: string; spotSlug: string }> }) {
  const { citySlug, spotSlug } = await params;
  const spot = await getSpot(citySlug, spotSlug);
  
  if (!spot) {
    return <div>Spot not found</div>;
  }

  const queryClient = new QueryClient();

  // Prefetch the spot data so the shared header finds it in cache
  queryClient.setQueryData(["spot", citySlug, spotSlug], spot);

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["price-reports-infinite", spot.id],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const res = await priceReportsControllerFindBySpot(spot.id, {
        skip: pageParam as number,
        take: 10
      }, { next: { revalidate: 60 } } as RequestInit);
      return res.data;
    },
    getNextPageParam: (lastPage: any) => {
      const { skip, take, total } = lastPage.pagination || {};
      if (skip === undefined || take === undefined || total === undefined) return undefined;
      const nextSkip = skip + take;
      return nextSkip < total ? nextSkip : undefined;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PricesTab spot={spot} />
    </HydrationBoundary>
  );
}
