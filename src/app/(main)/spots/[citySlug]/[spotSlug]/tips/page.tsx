import { Metadata } from 'next';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import TipsTab from '@/components/spots/tabs/tips-tab';
import { PaginatedCommunityTipsResponseDto, SpotWithStatsResponseDto } from '@/types/api-models';
import { getSpot } from '@/services/spot';
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
        title: `Community Tips - ${spotSlug} | BKK Honest`,
        description: `Read the latest community tips and scam alerts for ${spotSlug} in Bangkok.`,
        alternates: {
            canonical: `${siteUrl}/spots/${citySlug}/${spotSlug}/tips`,
        },
    };
}

export default async function TipsPage({
    params,
    searchParams,
}: {
    params: Promise<{ citySlug: string; spotSlug: string }>;
    searchParams: Promise<{ type?: string; sort?: string }>;
}) {
    const { citySlug, spotSlug } = await params;
    const { type = 'TRY', sort = 'popular' } = await searchParams;
    const spot = await getSpot(citySlug, spotSlug);

    if (!spot) {
        return <div>Spot not found</div>;
    }

    const queryClient = new QueryClient();

    queryClient.setQueryData(['spot-by-slug', citySlug, spotSlug], spot);

    const normalizedType = type === 'AVOID' ? 'AVOID' : 'TRY';
    const normalizedSort = sort === 'newest' ? 'newest' : 'popular';

    await queryClient.prefetchInfiniteQuery({
        queryKey: ['tips-infinite', spot.id, normalizedType, normalizedSort],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }) => {
            const query = new URLSearchParams();
            query.set('take', '10');
            query.set('type', normalizedType);
            query.set('sort', normalizedSort);
            if (typeof pageParam === 'number' && pageParam > 0) {
                query.set('skip', String(pageParam));
            }

            const response = await apiFetch(`/community-tips/spot/${spot.id}?${query.toString()}`, {
                next: { revalidate: 60 },
            });
            const payload: unknown = await response.json();

            return {
                data: unwrapApiSuccessData<PaginatedCommunityTipsResponseDto>(payload),
            };
        },
        getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage, true),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <TipsTab spot={spot as SpotWithStatsResponseDto} />
        </HydrationBoundary>
    );
}
