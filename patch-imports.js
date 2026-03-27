const fs = require('fs');
const file = 'src/hooks/use-api.ts';
let code = fs.readFileSync(file, 'utf8');

const imports = `
import { useCommunityTipsControllerFindBySpotInfinite } from '@/api/generated/community-tips/community-tips';
import { CommunityTipsControllerFindBySpotType } from '@/api/generated/model/communityTipsControllerFindBySpotType';
import { CommunityTipsControllerFindBySpotSort } from '@/api/generated/model/communityTipsControllerFindBySpotSort';
import { useGalleryControllerGetGalleryInfinite } from '@/api/generated/gallery/gallery';
import { GalleryControllerGetGallerySort } from '@/api/generated/model/galleryControllerGetGallerySort';
import { usePriceReportsControllerFindBySpotInfinite } from '@/api/generated/price-reports/price-reports';
import { useLiveVibesControllerFindAllInfinite } from '@/api/generated/live-vibes/live-vibes';
import { useScamAlertsControllerFindAllInfinite } from '@/api/generated/scam-alerts/scam-alerts';
import { ScamAlertsControllerFindAllSort } from '@/api/generated/model/scamAlertsControllerFindAllSort';
`;

code = code.replace("type PaginatedScamAlerts = components['schemas']['PaginatedScamAlertsResponseDto'];", "type PaginatedScamAlerts = components['schemas']['PaginatedScamAlertsResponseDto'];\n" + imports);

// Fix tips
const tipsHook = `export function useInfiniteSpotTips(
    spotId: string,
    type: 'TRY' | 'AVOID',
    sort: 'newest' | 'popular' = 'popular',
) {
    const normalizedType = type === 'TRY' 
      ? CommunityTipsControllerFindBySpotType.TRY 
      : CommunityTipsControllerFindBySpotType.AVOID;
      
    const normalizedSort = sort === 'popular'
      ? CommunityTipsControllerFindBySpotSort.popular
      : CommunityTipsControllerFindBySpotSort.newest;

    return useCommunityTipsControllerFindBySpotInfinite(spotId, {
        type: normalizedType,
        sort: normalizedSort,
        take: 10,
    }, {
        query: {
            queryKey: ['tips-infinite', spotId, normalizedType, normalizedSort],
            staleTime: 5 * 60 * 1000,
            getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage.data, true),
        },
    });
}`;
code = code.replace(/export function useInfiniteSpotTips\([\s\S]*?enabled: !!spotId,\n\s*staleTime: 5 \* 60 \* 1000, \/\/ 5 minutes \(Matches Discovery spots\)\n\s*}\);\n}/, tipsHook);

// Fix gallery
const galleryHook = `export function useInfiniteSpotGallery(spotId: string, sort: 'newest' | 'popular' = 'newest') {
    const normalizedSort = sort === 'popular'
        ? GalleryControllerGetGallerySort.popular
        : GalleryControllerGetGallerySort.newest;
        
    return useGalleryControllerGetGalleryInfinite(spotId, {
        take: 12,
        sort: normalizedSort,
    }, {
        query: {
            queryKey: ['gallery-infinite', spotId, normalizedSort],
            getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage.data, true),
        },
    });
}`;
code = code.replace(/export function useInfiniteSpotGallery\([\s\S]*?enabled: !!spotId \}\);\n}/, galleryHook);

// Fix price reports
const pricesHook = `export function useInfiniteSpotPriceReports(spotId: string) {
    return usePriceReportsControllerFindBySpotInfinite(spotId, {
        take: 10,
    }, {
        query: {
            queryKey: ['price-reports-infinite', spotId],
            getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage.data, false),
        },
    });
}`;
code = code.replace(/export function useInfiniteSpotPriceReports\([\s\S]*?enabled: !!spotId \}\);\n}/, pricesHook);

// Fix live vibes
const vibesHook = `export function useInfiniteLiveVibes(params?: { spotId?: string; cityId?: string; categoryId?: string; take?: number }) {
    return useLiveVibesControllerFindAllInfinite({
        ...params,
        take: params?.take || 10
    }, {
        query: {
            queryKey: ['live-vibes-infinite', params],
            staleTime: 60 * 1000,
            getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage.data, false),
        }
    });
}`;
code = code.replace(/export function useInfiniteLiveVibes\([\s\S]*?staleTime: 60 \* 1000, \/\/ 1 minute\n\s*}\);\n}/, vibesHook);

// Fix Scam Alerts
const scamsHook = `export function useInfiniteScamAlerts(params?: {
    cityId?: string;
    categoryId?: string;
    sort?: 'newest' | 'popular';
    search?: string;
    take?: number;
}) {
    const cleanParams: any = {};
    if (params) {
        if (params.cityId) cleanParams.cityId = params.cityId;
        if (params.categoryId) cleanParams.categoryId = params.categoryId;
        if (params.sort) {
             cleanParams.sort = params.sort === 'popular' ? ScamAlertsControllerFindAllSort.popular : ScamAlertsControllerFindAllSort.newest;
        }
        if (params.search) cleanParams.search = params.search;
        cleanParams.take = params.take || 10;
    }

    return useScamAlertsControllerFindAllInfinite(cleanParams, {
        query: {
            queryKey: ['scam-alerts-infinite', cleanParams],
            staleTime: 5 * 60 * 1000,
            getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage.data, false),
        }
    });
}`;
code = code.replace(/export function useInfiniteScamAlerts\([\s\S]*?staleTime: 5 \* 60 \* 1000, \/\/ 5 minutes\n\s*}\);\n}/, scamsHook);

fs.writeFileSync(file, code);
