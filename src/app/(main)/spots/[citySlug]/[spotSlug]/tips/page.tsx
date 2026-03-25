import { Metadata } from "next";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import TipsTab from "@/components/spots/tabs/tips-tab";
import { SpotData } from "@/types/spot";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bkkhonest.com";

export async function generateMetadata({ params }: { params: Promise<{ citySlug: string; spotSlug: string }> }): Promise<Metadata> {
  const { citySlug, spotSlug } = await params;
  
  // We can fetch spot details to include in metadata if needed, but the main layout already sets general SEO.
  // Setting specific SEO for the Tips tab.
  return {
    title: `Community Tips - ${spotSlug} | BKK Honest`,
    description: `Read the latest community tips and scam alerts for ${spotSlug} in Bangkok.`,
    alternates: {
      canonical: `${siteUrl}/spots/${citySlug}/${spotSlug}/tips`
    }
  };
}

// Function to fetch the core spot data
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

export default async function TipsPage({ params }: { params: Promise<{ citySlug: string; spotSlug: string }> }) {
  const { citySlug, spotSlug } = await params;
  const spot = await getSpot(citySlug, spotSlug);
  
  if (!spot) {
    return <div>Spot not found</div>;
  }

  const queryClient = new QueryClient();

  // Prefetch the first page of tips on the server
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["tips-infinite", spot.id, "TRY", "popular"],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(
        `${baseUrl}/community-tips/spot/${spot.id}?skip=${pageParam}&take=10&type=TRY&sort=popular`,
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