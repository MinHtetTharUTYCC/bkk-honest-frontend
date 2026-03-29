import { Metadata } from "next";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import GalleryTab from "@/components/spots/tabs/gallery-tab";
import { getSpot } from "@/services/spot";
import { galleryControllerGetGallery } from "@/api/generated/gallery/gallery";
import { GalleryControllerGetGallerySort } from "@/api/generated/model/galleryControllerGetGallerySort";
import { createClient as createServerClient } from "@/lib/supabase/server";

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

export default async function GalleryPage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ citySlug: string; spotSlug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { citySlug, spotSlug } = await params;
  const { sort = "newest" } = await searchParams;
  const spot = await getSpot(citySlug, spotSlug);
  
  if (!spot) {
    return <div>Spot not found</div>;
  }

  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const headers = session?.access_token 
    ? { Authorization: `Bearer ${session.access_token}` } 
    : {};

  const queryClient = new QueryClient();

  queryClient.setQueryData(["spot", citySlug, spotSlug], spot);

  const normalizedSort = sort === "popular" 
    ? GalleryControllerGetGallerySort.popular 
    : GalleryControllerGetGallerySort.newest;

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["gallery-infinite", spot.id, normalizedSort],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const res = await galleryControllerGetGallery(spot.id, {
        skip: pageParam as number,
        take: 12,
        sort: normalizedSort
      }, { headers, next: { revalidate: 60 } } as RequestInit);
      return res;
    },
    getNextPageParam: (lastPage: unknown) => {
      if (!lastPage || typeof lastPage !== 'object') return undefined;
      const p = lastPage as Record<string, unknown>;
      const pagination = p.pagination;
      if (!pagination || typeof pagination !== 'object') return undefined;
      const pag = pagination as { skip?: number; take?: number; total?: number };
      const { skip, take, total } = pag;
      if (skip === undefined || take === undefined || total === undefined) return undefined;
      const nextSkip = (skip as number) + (take as number);
      return nextSkip < (total as number) ? nextSkip : undefined;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GalleryTab spot={spot} />
    </HydrationBoundary>
  );
}
