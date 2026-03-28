'use client';

import { useQueryClient, useMutation } from '@tanstack/react-query';
import { components } from '@/types/api';
import { AXIOS_INSTANCE } from '@/api/mutator/custom-instance';

import { 
    useCommentsControllerFindByTipInfinite, 
    useCommentsControllerFindByScamAlertInfinite,
    useCommentsControllerCreate,
    useCommentsControllerUpdate,
    useCommentsControllerDelete
} from '@/api/generated/comments/comments';
import { 
    useCommunityTipsControllerFindBySpotInfinite,
    useCommunityTipsControllerFindBySpot,
    useCommunityTipsControllerCreate,
    useCommunityTipsControllerUpdate,
    useCommunityTipsControllerDelete,
    useCommunityTipsControllerFindMyTipsInfinite,
    useCommunityTipsControllerFindByUserInfinite
} from '@/api/generated/community-tips/community-tips';
import { 
    useGalleryControllerGetGalleryInfinite,
    useGalleryControllerGetGallery,
    useGalleryControllerDeleteImage,
    useGalleryControllerFlagImage,
    useGalleryControllerUploadImage
} from '@/api/generated/gallery/gallery';
import { GalleryControllerGetGallerySort } from '@/api/generated/model/galleryControllerGetGallerySort';
import { 
    usePriceReportsControllerFindBySpotInfinite,
    usePriceReportsControllerFindBySpot,
    usePriceReportsControllerCreate,
    usePriceReportsControllerFindMyReportsInfinite,
    usePriceReportsControllerFindByUserInfinite
} from '@/api/generated/price-reports/price-reports';
import { 
    useLiveVibesControllerFindAllInfinite,
    useLiveVibesControllerFindAll as _useLiveVibesControllerFindAll,
    useLiveVibesControllerCreate 
} from '@/api/generated/live-vibes/live-vibes';
import { 
    useScamAlertsControllerFindAllInfinite,
    useScamAlertsControllerFindBySlug,
    useScamAlertsControllerFindAll,
    useScamAlertsControllerCreate,
    useScamAlertsControllerUpdate,
    useScamAlertsControllerDelete,
    useScamAlertsControllerFindMyAlertsInfinite,
    useScamAlertsControllerFindByUserInfinite
} from '@/api/generated/scam-alerts/scam-alerts';
import { 
    useSpotsControllerFindOne, 
    useSpotsControllerFindBySlug, 
    useSpotsControllerFindAll, 
    useSpotsControllerFindNearby, 
    useSpotsControllerSearch, 
    useSpotsControllerFindAllInfinite,
    useSpotsControllerCreate,
    useSpotsControllerUpdate,
    useSpotsControllerFindMySpotsInfinite,
    useSpotsControllerFindByUserInfinite,
    useSpotsControllerReverseGeocode
} from '@/api/generated/spots/spots';
import { 
    useVotesControllerCreateTipVote,
    useVotesControllerDeleteVote
} from '@/api/generated/votes/votes';
import { useCategoriesControllerFindAll } from '@/api/generated/categories/categories';
import { useCitiesControllerFindAll } from '@/api/generated/cities/cities';
import { 
    useProfilesControllerGetMe, 
    useProfilesControllerGetLeaderboard, 
    useProfilesControllerFindOne,
    useProfilesControllerCreate,
    useProfilesControllerUpdate
} from '@/api/generated/profiles/profiles';
import { 
    useChecklistControllerCreate, 
    useChecklistControllerUpdate, 
    useChecklistControllerDelete, 
    useChecklistControllerFindAllInfinite, 
    useChecklistControllerGetStats 
} from '@/api/generated/checklist/checklist';
import { 
    useReportsControllerCreateReport, 
    useReportsControllerGetReports 
} from '@/api/generated/reports/reports';
import { 
    useCommentReactionsControllerToggleReaction, 
    useCommentReactionsControllerGetReactionSummary
} from '@/api/generated/comment-reactions/comment-reactions';
import { useContactControllerSubmitContactForm } from '@/api/generated/contact/contact';

import { ScamAlertsControllerFindAllSort } from '@/api/generated/model/scamAlertsControllerFindAllSort';

type PaginationLike = { pagination?: { skip?: number; take?: number; total?: number; hasMore?: boolean }; skip?: number; take?: number; total?: number };

function getNextSkipFromPage(lastPage: unknown, requireHasMore = false): number | undefined {
    if (!lastPage || typeof lastPage !== 'object') {
        return undefined;
    }

    const page = lastPage as PaginationLike;
    const source = page.pagination ?? page;
    const skip = source?.skip;
    const take = source?.take;
    const total = source?.total;

    if (typeof skip !== 'number' || typeof take !== 'number' || typeof total !== 'number') {
        return undefined;
    }

    if (requireHasMore && page.pagination?.hasMore === false) {
        return undefined;
    }

    const nextSkip = skip + take;
    return nextSkip < total ? nextSkip : undefined;
}

// --- Profiles ---

export function useMyProfile() {
    const query = useProfilesControllerGetMe({ query: { retry: false } });
    return { ...query, data: query.data?.data };
}

export function useLeaderboard(take = 5) {
    const query = useProfilesControllerGetLeaderboard({ take }, { query: { staleTime: 5 * 60 * 1000 } });
    return { ...query, data: query.data?.data };
}

export function useProfile(id: string) {
    const query = useProfilesControllerFindOne(id, { query: { enabled: !!id, retry: false } });
    return { ...query, data: query.data?.data };
}

export function useCreateProfile() {
    const mutation = useProfilesControllerCreate();
    return {
        ...mutation,
        mutate: (data) => mutation.mutate({ data }),
        mutateAsync: (data) => mutation.mutateAsync({ data })
    };
}

export function useUpdateProfile() {
    const mutation = useProfilesControllerUpdate();
    return {
        ...mutation,
        mutate: (data) => mutation.mutate({ data }),
        mutateAsync: (data) => mutation.mutateAsync({ data })
    };
}

export function useInfiniteUserPriceReports(userId: string) {
    const isMe = userId === 'me';
    return isMe 
        ? usePriceReportsControllerFindMyReportsInfinite({ take: 10 }, {
            query: { queryKey: ['user-price-reports-infinite', 'me'], initialPageParam: 0, getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage) }
        })
        : usePriceReportsControllerFindByUserInfinite(userId, { take: 10 }, {
            query: { 
                queryKey: ['user-price-reports-infinite', userId], 
                initialPageParam: 0,
                getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage),
                enabled: !!userId
            }
        });
}

export function useInfiniteUserScamAlerts(userId: string) {
    const isMe = userId === 'me';
    return isMe 
        ? useScamAlertsControllerFindMyAlertsInfinite({ take: 10 }, {
            query: { queryKey: ['user-scam-alerts-infinite', 'me'], initialPageParam: 0, getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage) }
        })
        : useScamAlertsControllerFindByUserInfinite(userId, { take: 10 }, {
            query: { 
                queryKey: ['user-scam-alerts-infinite', userId], 
                initialPageParam: 0,
                getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage),
                enabled: !!userId 
            }
        });
}

export function useInfiniteUserCommunityTips(userId: string) {
    const isMe = userId === 'me';
    return isMe 
        ? useCommunityTipsControllerFindMyTipsInfinite({ take: 10 }, {
            query: { queryKey: ['user-community-tips-infinite', 'me'], initialPageParam: 0, getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage) }
        })
        : useCommunityTipsControllerFindByUserInfinite(userId, { take: 10 }, {
            query: { 
                queryKey: ['user-community-tips-infinite', userId], 
                initialPageParam: 0,
                getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage),
                enabled: !!userId 
            }
        });
}

export function useInfiniteUserSpots(userId: string) {
    const isMe = userId === 'me';
    return isMe 
        ? useSpotsControllerFindMySpotsInfinite({ take: 10 }, {
            query: { queryKey: ['user-spots-infinite', 'me'], initialPageParam: 0, getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage) }
        })
        : useSpotsControllerFindByUserInfinite(userId, { take: 10 }, {
            query: { 
                queryKey: ['user-spots-infinite', userId], 
                initialPageParam: 0,
                getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage),
                enabled: !!userId 
            }
        });
}

// --- Spots ---

export function useSpot(id: string) {
    const query = useSpotsControllerFindOne(id, { query: { enabled: !!id } });
    return { ...query, data: query.data?.data };
}

export function useSpotBySlug(citySlug: string, spotSlug: string) {
    const query = useSpotsControllerFindBySlug(citySlug, spotSlug, { query: { enabled: !!citySlug && !!spotSlug } });
    return { ...query, data: query.data?.data };
}

export function useScamAlertBySlug(citySlug: string, alertSlug: string) {
    const query = useScamAlertsControllerFindBySlug(citySlug, alertSlug, { query: { enabled: !!citySlug && !!alertSlug } });
    return { ...query, data: query.data?.data };
}

export function useSpots(params?: {
    categoryId?: string;
    cityId?: string;
    search?: string;
    sort?: 'newest' | 'popular';
}) {
    const cleanParams: any = {};
    if (params) {
        if (params.categoryId) cleanParams.categoryId = params.categoryId;
        if (params.cityId) cleanParams.cityId = params.cityId;
        if (params.search) cleanParams.search = params.search;
        if (params.sort) cleanParams.sort = params.sort;
    }

    const query = useSpotsControllerFindAll(cleanParams, { query: { staleTime: 5 * 60 * 1000 } });
    return { ...query, data: query.data?.data ? (Array.isArray(query.data.data) ? query.data.data : [query.data.data]) : [] };
}

export function useInfiniteSpots(params?: {
    categoryId?: string;
    cityId?: string;
    search?: string;
    sort?: 'newest' | 'popular';
    take?: number;
}) {
    const cleanParams: any = {};
    if (params) {
        if (params.categoryId) cleanParams.categoryId = params.categoryId;
        if (params.cityId) cleanParams.cityId = params.cityId;
        if (params.search) cleanParams.search = params.search;
        if (params.sort) cleanParams.sort = params.sort;
        cleanParams.take = params.take || 10;
    }

    return useSpotsControllerFindAllInfinite(cleanParams, {
        query: {
            queryKey: ['spots-infinite', cleanParams],
            getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage),
            staleTime: 5 * 60 * 1000,
        }
    });
}

export function useNearbySpots(params: { latitude: number; longitude: number; distance?: number; categoryId?: string; limit?: number }, enabled = true) {
    const query = useSpotsControllerFindNearby(params, {
        query: {
            queryKey: ['spots-nearby', params],
            enabled: enabled && !!params.latitude && !!params.longitude,
            placeholderData: (prev: any) => prev,
            staleTime: 60_000
        }
    });
    return { ...query, data: Array.isArray(query.data?.data) ? query.data?.data : [] };
}

export function useSpotSearch(queryStr: string, cityId?: string, limit: number = 20) {
    const params: any = { q: queryStr };
    if (cityId) params.cityId = cityId;
    if (limit !== 20) params.limit = limit;

    const query = useSpotsControllerSearch(params, {
        query: {
            queryKey: ['spot-search', queryStr, cityId],
            enabled: queryStr.trim().length >= 1
        }
    });
    return { ...query, data: Array.isArray(query.data?.data) ? query.data?.data : [] };
}

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

export function useSpotTips(spotId: string) {
    const query = useCommunityTipsControllerFindBySpot(spotId, {}, { query: { enabled: !!spotId } });
    return { ...query, data: Array.isArray(query.data?.data) ? query.data?.data : [] };
}

export function useInfiniteSpotTips(
    spotId: string,
    type: 'TRY' | 'AVOID',
    sort: 'newest' | 'popular' = 'popular',
) {
    const normalizedType = type === 'TRY' 
      ? 'TRY' 
      : 'AVOID';
      
    const normalizedSort = sort === 'popular'
      ? 'popular'
      : 'newest';

    return useCommunityTipsControllerFindBySpotInfinite(spotId, {
        type: normalizedType,
        sort: normalizedSort,
        take: 10,
    }, {
        query: {
            queryKey: ['tips-infinite', spotId, normalizedType, normalizedSort],
            staleTime: 5 * 60 * 1000,
            initialPageParam: 0,
            getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage, true),
        },
    });
}

export function useSpotGallery(spotId: string, limit: number = 12, sort: 'newest' | 'popular' = 'newest') {
    const normalizedSort = sort === 'popular'
        ? GalleryControllerGetGallerySort.popular
        : GalleryControllerGetGallerySort.newest;
        
    const query = useGalleryControllerGetGallery(spotId, { take: limit, sort: normalizedSort }, { query: { enabled: !!spotId } });
    return { ...query, data: query.data?.data };
}

export function useInfiniteSpotGallery(spotId: string, sort: 'newest' | 'popular' = 'newest') {
    const normalizedSort = sort === 'popular'
        ? GalleryControllerGetGallerySort.popular
        : GalleryControllerGetGallerySort.newest;
        
    return useGalleryControllerGetGalleryInfinite(spotId, {
        take: 12,
        sort: normalizedSort,
    }, {
        query: {
            queryKey: ['gallery-infinite', spotId, normalizedSort],
            initialPageParam: 0,
            getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage, true),
            enabled: !!spotId
        },
    });
}

// --- Metadata ---

export function useCategories() {
    const query = useCategoriesControllerFindAll({ query: { staleTime: 24 * 60 * 60 * 1000, gcTime: 48 * 60 * 60 * 1000 } });
    return { ...query, data: Array.isArray(query.data) ? query.data : [] };
}

export function useCities() {
    const query = useCitiesControllerFindAll({ query: { staleTime: 24 * 60 * 60 * 1000, gcTime: 48 * 60 * 60 * 1000 } });
    return { ...query, data: Array.isArray(query.data) ? query.data : [] };
}

// --- Social & Alerts ---

export function useCreateSpot() {
    const mutation = useSpotsControllerCreate();
    return {
        ...mutation,
        mutate: (payload: {
            name: string;
            address: string;
            categoryId: string;
            cityId: string;
            latitude: number;
            longitude: number;
            image?: File;
        }) => mutation.mutate({ data: payload as any }),
        mutateAsync: (payload: {
            name: string;
            address: string;
            categoryId: string;
            cityId: string;
            latitude: number;
            longitude: number;
            image?: File;
        }) => mutation.mutateAsync({ data: payload as any })
    };
}

export function useUpdateSpot() {
    const mutation = useSpotsControllerUpdate();
    return {
        ...mutation,
        mutate: ({ id, payload }: { id: string; payload: any }) => mutation.mutate({ id, data: payload }),
        mutateAsync: ({ id, payload }: { id: string; payload: any }) => mutation.mutateAsync({ id, data: payload })
    };
}

export function useScamAlerts(params?: {
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
        if (params.sort) cleanParams.sort = params.sort === 'popular' ? ScamAlertsControllerFindAllSort.popular : ScamAlertsControllerFindAllSort.newest;
        if (params.search) cleanParams.search = params.search;
        if (params.take) cleanParams.take = params.take;
    }

    const query = useScamAlertsControllerFindAll(cleanParams, {
        query: {
            queryKey: ['scam-alerts', cleanParams],
            staleTime: 5 * 60 * 1000,
        }
    });
    return { ...query, data: Array.isArray(query.data?.data) ? query.data?.data : [] };
}

export function useInfiniteScamAlerts(params?: {
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
            getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage, false),
        }
    });
}

export function useLiveVibes(params?: { spotId?: string; cityId?: string; take?: number }) {
    const query = _useLiveVibesControllerFindAll({
        ...params,
        take: params?.take || 10
    }, {
        query: {
            queryKey: ['live-vibes', params],
            staleTime: 60 * 1000,
        }
    });
    return { ...query, data: Array.isArray(query.data?.data) ? query.data?.data : [] };
}

export function useInfiniteLiveVibes(params?: { spotId?: string; cityId?: string; categoryId?: string; take?: number }) {
    return useLiveVibesControllerFindAllInfinite({
        ...params,
        take: params?.take || 10
    }, {
        query: {
            queryKey: ['live-vibes-infinite', params],
            staleTime: 60 * 1000,
            initialPageParam: 0,
            getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage, false),
        }
    });
}

// --- Comments ---

export function useTipComments(tipId: string) {
    return useCommentsControllerFindByTipInfinite(tipId, {
        take: 10,
    }, {
        query: {
            queryKey: ['tip-comments', tipId],
            getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage, true),
            enabled: !!tipId
        }
    });
}

export function useScamComments(scamAlertId: string) {
    return useCommentsControllerFindByScamAlertInfinite(scamAlertId, {
        take: 10,
    }, {
        query: {
            queryKey: ['scam-comments', scamAlertId],
            getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage, true),
            enabled: !!scamAlertId
        }
    });
}

export function useCreateComment() {
    const mutation = useCommentsControllerCreate();
    return {
        ...mutation,
        mutate: (payload: { scamAlertId?: string; communityTipId?: string; content: string }) => {
            const apiPayload: any = { text: payload.content };
            if (payload.scamAlertId) {
                apiPayload.targetType = 'SCAM_ALERT';
                apiPayload.scamAlertId = payload.scamAlertId;
            } else if (payload.communityTipId) {
                apiPayload.targetType = 'COMMUNITY_TIP';
                apiPayload.communityTipId = payload.communityTipId;
            }
            return mutation.mutate({ data: apiPayload });
        },
        mutateAsync: async (payload: { scamAlertId?: string; communityTipId?: string; content: string }) => {
            const apiPayload: any = { text: payload.content };
            if (payload.scamAlertId) {
                apiPayload.targetType = 'SCAM_ALERT';
                apiPayload.scamAlertId = payload.scamAlertId;
            } else if (payload.communityTipId) {
                apiPayload.targetType = 'COMMUNITY_TIP';
                apiPayload.communityTipId = payload.communityTipId;
            }
            return mutation.mutateAsync({ data: apiPayload });
        }
    };
}

export function useUpdateComment() {
    const mutation = useCommentsControllerUpdate();
    return {
        ...mutation,
        mutate: (payload: { id: string; content: string; scamAlertId?: string; communityTipId?: string }) => 
            mutation.mutate({ id: payload.id, data: { text: payload.content } }),
        mutateAsync: (payload: { id: string; content: string; scamAlertId?: string; communityTipId?: string }) => 
            mutation.mutateAsync({ id: payload.id, data: { text: payload.content } })
    };
}

export function useDeleteComment() {
    const mutation = useCommentsControllerDelete();
    return {
        ...mutation,
        mutate: (payload: { id: string; scamAlertId?: string; communityTipId?: string }) => 
            mutation.mutate({ id: payload.id }),
        mutateAsync: (payload: { id: string; scamAlertId?: string; communityTipId?: string }) => 
            mutation.mutateAsync({ id: payload.id })
    };
}

export function useCreateCommunityTip() {
    const mutation = useCommunityTipsControllerCreate();
    return {
        ...mutation,
        mutate: (payload: { spotId: string; type: 'TRY' | 'AVOID'; title: string; description: string }) => 
            mutation.mutate({ data: payload }),
        mutateAsync: (payload: { spotId: string; type: 'TRY' | 'AVOID'; title: string; description: string }) => 
            mutation.mutateAsync({ data: payload })
    };
}

export function useUpdateCommunityTip() {
    const mutation = useCommunityTipsControllerUpdate();
    return {
        ...mutation,
        mutate: (payload: { id: string; spotId: string; type?: 'TRY' | 'AVOID'; title?: string; description?: string }) => {
            const { id, spotId, ...data } = payload;
            return mutation.mutate({ id, data });
        },
        mutateAsync: (payload: { id: string; spotId: string; type?: 'TRY' | 'AVOID'; title?: string; description?: string }) => {
            const { id, spotId, ...data } = payload;
            return mutation.mutateAsync({ id, data });
        }
    };
}

export function useDeleteCommunityTip() {
    const mutation = useCommunityTipsControllerDelete();
    return {
        ...mutation,
        mutate: ({ id, spotId }: { id: string; spotId: string }) => mutation.mutate({ id }),
        mutateAsync: ({ id, spotId }: { id: string; spotId: string }) => mutation.mutateAsync({ id })
    };
}

// --- Mutations ---

export function useCreatePriceReport() {
    const mutation = usePriceReportsControllerCreate();
    return {
        ...mutation,
        mutate: (payload: { spotId: string; itemName: string; priceThb: number }) => mutation.mutate({ data: payload }),
        mutateAsync: (payload: { spotId: string; itemName: string; priceThb: number }) => mutation.mutateAsync({ data: payload })
    };
}

export function useCreateScamAlert() {
    const mutation = useScamAlertsControllerCreate();
    return {
        ...mutation,
        mutate: (payload: { scamName: string; description: string; preventionTip: string; cityId: string; categoryId: string; image?: File }) => 
            mutation.mutate({ data: payload }),
        mutateAsync: (payload: { scamName: string; description: string; preventionTip: string; cityId: string; categoryId: string; image?: File }) => 
            mutation.mutateAsync({ data: payload })
    };
}

export function useUpdateScamAlert() {
    const mutation = useScamAlertsControllerUpdate();
    return {
        ...mutation,
        mutate: ({ id, payload }: { id: string; payload: any }) => mutation.mutate({ id, data: payload }),
        mutateAsync: ({ id, payload }: { id: string; payload: any }) => mutation.mutateAsync({ id, data: payload })
    };
}

export function useDeleteScamAlert() {
    const mutation = useScamAlertsControllerDelete();
    return {
        ...mutation,
        mutate: (id: string) => mutation.mutate({ id }),
        mutateAsync: (id: string) => mutation.mutateAsync({ id })
    };
}

export function useCreateLiveVibe() {
    const mutation = useLiveVibesControllerCreate();
    return {
        ...mutation,
        mutate: (payload: { spotId: string; crowdLevel: number; waitTimeMinutes?: number }) => mutation.mutate({ data: payload }),
        mutateAsync: (payload: { spotId: string; crowdLevel: number; waitTimeMinutes?: number }) => mutation.mutateAsync({ data: payload })
    };
}

// --- Votes ---

export function useCreateVote() {
    const mutation = useVotesControllerCreateTipVote();
    return {
        ...mutation,
        mutate: ({ targetId, type }: { targetId: string; type: 'tip' | 'alert' | 'image' | 'spot' }) => {
            const payload: any = {};
            if (type === 'tip') payload.communityTipId = targetId;
            else if (type === 'alert') payload.scamAlertId = targetId;
            else if (type === 'image') payload.galleryImageId = targetId;
            else if (type === 'spot') payload.spotId = targetId;
            return mutation.mutate({ data: payload });
        },
        mutateAsync: ({ targetId, type }: { targetId: string; type: 'tip' | 'alert' | 'image' | 'spot' }) => {
            const payload: any = {};
            if (type === 'tip') payload.communityTipId = targetId;
            else if (type === 'alert') payload.scamAlertId = targetId;
            else if (type === 'image') payload.galleryImageId = targetId;
            else if (type === 'spot') payload.spotId = targetId;
            return mutation.mutateAsync({ data: payload });
        }
    };
}

export function useDeleteVote() {
    const mutation = useVotesControllerDeleteVote();
    return {
        ...mutation,
        mutate: ({ voteId, type }: { voteId: string; type: 'tip' | 'alert' | 'image' | 'spot' }) => 
            mutation.mutate({ id: voteId }),
        mutateAsync: ({ voteId, type }: { voteId: string; type: 'tip' | 'alert' | 'image' | 'spot' }) => 
            mutation.mutateAsync({ id: voteId })
    };
}

// --- Missions (Checklist) ---

export function useMissions(status: string = 'all', sort: string = 'newest', userId: string = 'me') {
    return useChecklistControllerFindAllInfinite({
        status: status === 'all' ? undefined : status as any,
        sort: sort as any,
        take: 10
    }, {
        query: {
            queryKey: ['missions-infinite', userId, status, sort],
            getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage),
            enabled: userId === 'me'
        }
    });
}

export function useMissionStats() {
    const query = useChecklistControllerGetStats({ query: { queryKey: ['mission-stats'] } });
    return { ...query, data: query.data?.data };
}

export function useAddMission() {
    const mutation = useChecklistControllerCreate();
    return {
        ...mutation,
        mutate: (spotId: string) => mutation.mutate({ data: { spotId } }),
        mutateAsync: (spotId: string) => mutation.mutateAsync({ data: { spotId } })
    };
}

export function useUpdateMission() {
    const mutation = useChecklistControllerUpdate();
    return {
        ...mutation,
        mutate: ({ id, completed }: { id: string; completed: boolean }) => mutation.mutate({ id, data: { completed } }),
        mutateAsync: ({ id, completed }: { id: string; completed: boolean }) => mutation.mutateAsync({ id, data: { completed } })
    };
}

export function useDeleteMission() {
    const mutation = useChecklistControllerDelete();
    return {
        ...mutation,
        mutate: (id: string) => mutation.mutate({ id }),
        mutateAsync: (id: string) => mutation.mutateAsync({ id })
    };
}

// --- Uploads ---

export function useUploadSpotImage() {
    return useMutation({
        mutationFn: async ({ spotId, file }: { spotId: string; file: File }) => {
            const formData = new FormData();
            formData.append('image', file);
            
            const { data } = await AXIOS_INSTANCE.post(`/gallery/upload/${spotId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        }
    });
}


export function useReverseGeocode() {
    const mutation = useSpotsControllerReverseGeocode();
    return {
        ...mutation,
        mutate: ({ latitude, longitude }: { latitude: number; longitude: number }) => 
            mutation.mutate({ data: { latitude, longitude } }),
        mutateAsync: ({ latitude, longitude }: { latitude: number; longitude: number }) => 
            mutation.mutateAsync({ data: { latitude, longitude } })
    };
}

// --- Reports ---

export function useCreateReport() {
    const mutation = useReportsControllerCreateReport();
    return {
        ...mutation,
        mutate: (payload: { reportType: 'SPOT' | 'COMMUNITY_TIP' | 'SCAM_ALERT' | 'COMMENT' | 'PROFILE'; targetId: string; reason: string; description?: string }) => 
            mutation.mutate({ data: payload }),
        mutateAsync: (payload: { reportType: 'SPOT' | 'COMMUNITY_TIP' | 'SCAM_ALERT' | 'COMMENT' | 'PROFILE'; targetId: string; reason: string; description?: string }) => 
            mutation.mutateAsync({ data: payload })
    };
}

export function useGetReports(status?: string) {
    const query = useReportsControllerGetReports({ status: status as any }, { query: { queryKey: ['reports', status] } });
    return { ...query, data: query.data?.data || [] };
}

// ---  Reactions ---

export function useToggleCommentReaction() {
    const mutation = useCommentReactionsControllerToggleReaction();
    return {
        ...mutation,
        mutate: (commentId: string) => mutation.mutate({ id: commentId }),
        mutateAsync: (commentId: string) => mutation.mutateAsync({ id: commentId })
    };
}

export function useGetCommentReaction(commentId: string) {
    const query = useCommentReactionsControllerGetReactionSummary(commentId, { 
        query: { enabled: !!commentId, queryKey: ['comment-reaction', commentId] } 
    });
    return { ...query, data: query.data?.data || { reactionCount: 0, userHasReacted: false } };
}


export { useGalleryControllerDeleteImage as useDeleteGalleryImage };
export { useGalleryControllerFlagImage as useFlagGalleryImage };

// --- Popular Area (deprecated, returns empty) ---
export function usePopularArea() {
    return { data: null, isLoading: false, error: null };
}
