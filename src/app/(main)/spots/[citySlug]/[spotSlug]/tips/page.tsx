import { Metadata } from "next";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import TipsTab from "@/components/spots/tabs/tips-tab";
import { getSpot } from "@/services/spot";
import { communityTipsControllerFindBySpot } from "@/api/generated/community-tips/community-tips";

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

export default async function TipsPage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ citySlug: string; spotSlug: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { citySlug, spotSlug } = await params;
  const { type = "TRY" } = await searchParams;
  const spot = await getSpot(citySlug, spotSlug);
  
  if (!spot) {
    return <div>Spot not found</div>;
  }

  const queryClient = new QueryClient();

  queryClient.setQueryData(["spot", citySlug, spotSlug], spot);

  const normalizedType = type === "AVOID" ? "AVOID" : "TRY";

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["tips-infinite", spot.id, normalizedType, "popular"],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const res = await communityTipsControllerFindBySpot(spot.id, {
        skip: pageParam.toString(),
        take: 10,
        type: normalizedType,
        sort: "popular"
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
      <TipsTab spot={spot} />
    </HydrationBoundary>
  );
}
