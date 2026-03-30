import { Metadata } from 'next';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import TipsTab from '@/components/spots/tabs/tips-tab';
import { SpotWithStatsResponseDto } from '@/api/generated/model';
import { getSpot } from '@/services/spot';
import { communityTipsControllerFindBySpot } from '@/api/generated/community-tips/community-tips';
import { createClient as createServerClient } from '@/lib/supabase/server';
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

    const supabase = await createServerClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const headers = session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {};

    const queryClient = new QueryClient();

    queryClient.setQueryData(['spot', citySlug, spotSlug], spot);

    const normalizedType = type === 'AVOID' ? 'AVOID' : 'TRY';
    const normalizedSort = sort === 'newest' ? 'newest' : 'popular';

    await queryClient.prefetchInfiniteQuery({
        queryKey: ['tips-infinite', spot.id, normalizedType, normalizedSort],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }) => {
            const res = await communityTipsControllerFindBySpot(
                spot.id,
                {
                    skip: pageParam,
                    take: 10,
                    type: normalizedType,
                    sort: normalizedSort,
                },
                { headers, next: { revalidate: 60 } } as RequestInit,
            );
            return res;
        },
        getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage, true),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <TipsTab spot={spot as SpotWithStatsResponseDto} />
        </HydrationBoundary>
    );
}
