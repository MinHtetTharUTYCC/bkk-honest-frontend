'use client';

import { 
    usePriceReportsControllerFindBySpotInfinite,
    usePriceReportsControllerFindBySpot,
    usePriceReportsControllerCreate
} from '@/api/generated/price-reports/price-reports';
import { getNextSkipFromPage } from './base';

export function useSpotPriceReports(spotId: string) {
    const query = usePriceReportsControllerFindBySpot(spotId, { query: { enabled: !!spotId } });
    return { ...query, data: Array.isArray(query.data?.data) ? query.data?.data : [] };
}

export function useInfiniteSpotPriceReports(spotId: string) {
    return usePriceReportsControllerFindBySpotInfinite(spotId, {
        take: 10,
    }, {
        query: {
            queryKey: ['price-reports-infinite', spotId],
            initialPageParam: 0,
            getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage, false),
            enabled: !!spotId
        },
    });
}

export function useCreatePriceReport() {
    const mutation = usePriceReportsControllerCreate();
    return {
        ...mutation,
        mutate: (payload: { spotId: string; itemName: string; priceThb: number }) => mutation.mutate({ data: payload }),
        mutateAsync: (payload: { spotId: string; itemName: string; priceThb: number }) => mutation.mutateAsync({ data: payload })
    };
}
