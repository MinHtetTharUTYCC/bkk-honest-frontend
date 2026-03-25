import { Metadata } from "next";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import PricesTab from "@/components/spots/tabs/prices-tab";
import { SpotData } from "@/types/spot";

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

export default async function PricesPage({ params }: { params: Promise<{ citySlug: string; spotSlug: string }> }) {
  const { citySlug, spotSlug } = await params;
  const spot = await getSpot(citySlug, spotSlug);
  
  if (!spot) {
    return <div>Spot not found</div>;
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["price-reports-infinite", spot.id],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(
        `${baseUrl}/price-reports/spot/${spot.id}?skip=${pageParam}&take=10`,
        { next: { revalidate: 60 } }
      );
      if (!res.ok) throw new Error("Prices fetch failed");
      return res.json();
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PricesTab spot={spot} />
    </HydrationBoundary>
  );
}