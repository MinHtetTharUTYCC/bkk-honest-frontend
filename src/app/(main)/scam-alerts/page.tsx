import type { Metadata } from 'next';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import ScamAlertsPageClient from '@/components/scams/scam-alerts-page-client';
import { getScamAlertsPage } from '@/services/scam-alert';

type ScamAlertsPageProps = {
    searchParams: Promise<{
        q?: string;
        sort?: 'newest' | 'popular';
        categoryId?: string;
    }>;
};

export async function generateMetadata({ searchParams }: ScamAlertsPageProps): Promise<Metadata> {
    const params = await searchParams;
    const query = params.q?.trim();
    const sort = params.sort === 'popular' ? 'popular' : 'newest';
    const path = '/scam-alerts';

    if (query) {
        return {
            title: `Scam Alerts for "${query}" | BKK Honest`,
            description: `Browse recent and community-verified scam alerts related to "${query}" in Bangkok and Thailand.`,
            alternates: {
                canonical: path,
            },
            robots: {
                index: true,
                follow: true,
            },
        };
    }

    return {
        title: `Scam Alerts (${sort === 'popular' ? 'Popular' : 'Latest'}) | BKK Honest`,
        description:
            'Real-time scam alerts shared by the community in Bangkok and across Thailand.',
        alternates: {
            canonical: path,
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

export default async function ScamAlertsPage({ searchParams }: ScamAlertsPageProps) {
    const params = await searchParams;
    const queryClient = new QueryClient();

    // Parse search parameters
    const search = params.q?.trim() || '';
    const sort = params.sort === 'popular' ? 'popular' : 'newest';
    const categoryId = params.categoryId || '';

    // Prefetch the first page of alerts
    await queryClient.prefetchInfiniteQuery({
        queryKey: [
            'scam-alerts-infinite',
            {
                cityId: '', // Will be set by client based on city context
                categoryId,
                sort,
                search,
            },
        ],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }) => {
            const data = await getScamAlertsPage(pageParam * 10, 10, {
                categoryId,
                sort,
                search,
            });
            return data;
        },
        getNextPageParam: (lastPage: unknown) => {
            if (!lastPage || typeof lastPage !== 'object') return undefined;
            const p = lastPage as Record<string, unknown>;
            const pagination = p.pagination;
            if (!pagination || typeof pagination !== 'object') return undefined;
            const pag = pagination as {
                skip?: number;
                take?: number;
                total?: number;
            };
            const skip = pag.skip as number | undefined;
            const take = pag.take as number | undefined;
            const total = pag.total as number | undefined;
            if (skip === undefined || take === undefined || total === undefined) return undefined;
            const nextSkip = skip + take;
            return nextSkip < total ? Math.floor(nextSkip / take) : undefined;
        },
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ScamAlertsPageClient searchParams={params} />
        </HydrationBoundary>
    );
}
