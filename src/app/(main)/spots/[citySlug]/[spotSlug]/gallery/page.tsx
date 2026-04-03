import { Metadata } from 'next';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import GalleryTab from '@/components/spots/tabs/gallery-tab';
import { PaginatedGalleryImagesResponseDto, SpotWithStatsResponseDto } from '@/types/api-models';
import { getSpot } from '@/services/spot';
import { GalleryControllerGetGallerySort } from '@/types/api-models';
import { apiFetch } from '@/lib/api/api-server';
import { unwrapApiSuccessData } from '@/lib/api/api-envelope';
import { getNextSkipFromPage } from '@/hooks/api/base';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bkkhonest.com';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ citySlug: string; spotSlug: string }>;
}): Promise<Metadata> {
    const { citySlug, spotSlug } = await params;
    return {
        title: `Vibe Gallery - ${spotSlug} | BKK Honest`,
        description: `Browse photos and community images for ${spotSlug} to check the actual vibe.`,
        alternates: {
            canonical: `${siteUrl}/spots/${citySlug}/${spotSlug}/gallery`,
        },
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
    const { sort = 'newest' } = await searchParams;
    const spot = await getSpot(citySlug, spotSlug);

    if (!spot) {
        return <div>Spot not found</div>;
    }

    const queryClient = new QueryClient();

    queryClient.setQueryData(['spot-by-slug', citySlug, spotSlug], spot);

    const normalizedSort =
        sort === 'popular'
            ? GalleryControllerGetGallerySort.popular
            : GalleryControllerGetGallerySort.newest;

    await queryClient.prefetchInfiniteQuery({
        queryKey: ['gallery-infinite', spot.id, normalizedSort],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }) => {
            const query = new URLSearchParams();
            query.set('take', '12');
            query.set('sort', normalizedSort);
            if (typeof pageParam === 'number' && pageParam > 0) {
                query.set('skip', String(pageParam));
            }

            const response = await apiFetch(`/gallery/spot/${spot.id}?${query.toString()}`, {
                next: { revalidate: 60 },
            });
            const payload: unknown = await response.json();

            return {
                data: unwrapApiSuccessData<PaginatedGalleryImagesResponseDto>(payload),
            };
        },
        getNextPageParam: (lastPage: unknown) => {
            const pageData =
                typeof lastPage === 'object' && lastPage !== null && 'data' in lastPage
                    ? (lastPage as { data: unknown }).data
                    : lastPage;
            return getNextSkipFromPage(pageData, true);
        },
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <GalleryTab spot={spot as SpotWithStatsResponseDto} />
        </HydrationBoundary>
    );
}
