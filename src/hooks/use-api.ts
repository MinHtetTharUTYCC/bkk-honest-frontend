'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/providers/auth-provider';
import api from '@/lib/api';
import { components } from '@/types/api';


type PaginatedSpots = components['schemas']['PaginatedSpotsWithStatsResponseDto'];
type PaginatedScamAlerts = components['schemas']['PaginatedScamAlertsResponseDto'];
type PaginatedGallery = components['schemas']['PaginatedGalleryImagesResponseDto'];
type PaginatedLiveVibes = { data: unknown[]; pagination?: { skip?: number; take?: number; total?: number; hasMore?: boolean }; skip?: number; take?: number; total?: number };
type PaginationLike = { pagination?: { skip?: number; take?: number; total?: number; hasMore?: boolean }; skip?: number; take?: number; total?: number };

function unwrapApiData(payload: unknown): unknown {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        return (payload as { data?: unknown }).data ?? payload;
    }
    return payload;
}

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
    const { user } = useAuth();
    return useQuery({
        queryKey: ['profile', 'me'],
        queryFn: async () => {
            const response = await api.get<unknown>('/profiles/me');
            const data = response.data;
            return unwrapApiData(data);
        },
        enabled: !!user,
        retry: false });
}

export function useLeaderboard(take = 5) {
    return useQuery({
        queryKey: ['leaderboard', take],
        queryFn: async () => {
            const { data } = await api.get(`/profiles/leaderboard/top?take=${take}`);
            return unwrapApiData(data);
        },
        staleTime: 5 * 60 * 1000 });
}

export function useProfile(id: string) {
    return useQuery({
        queryKey: ['profile', id],
        queryFn: async () => {
            const endpoint = id === 'me' ? '/profiles/me' : `/profiles/${id}`;
            const response = await api.get<unknown>(endpoint);
            const data = response.data;
            return unwrapApiData(data);
        },
        enabled: !!id,
        retry: false });
}

export function useUserPriceReports(userId: string) {
    return useQuery({
        queryKey: ['user-price-reports', userId],
        queryFn: async () => {
            const endpoint = userId === 'me' ? '/price-reports/mine' : `/price-reports/user/${userId}`;
            const { data } = await api.get(endpoint);
            const unwrapped = unwrapApiData(data);
            return Array.isArray(unwrapped) ? unwrapped : [];
        },
        enabled: !!userId });
}

export function useUserScamAlerts(userId: string) {
    return useQuery({
        queryKey: ['user-scam-alerts', userId],
        queryFn: async () => {
            const endpoint = userId === 'me' ? '/scam-alerts/mine' : `/scam-alerts/user/${userId}`;
            const { data } = await api.get(endpoint);
            const unwrapped = unwrapApiData(data);
            return Array.isArray(unwrapped) ? unwrapped : [];
        },
        enabled: !!userId });
}

export function useUserCommunityTips(userId: string) {
    return useQuery({
        queryKey: ['user-community-tips', userId],
        queryFn: async () => {
            const endpoint = userId === 'me' ? '/community-tips/mine' : `/community-tips/user/${userId}`;
            const { data } = await api.get(endpoint);
            const unwrapped = unwrapApiData(data);
            return Array.isArray(unwrapped) ? unwrapped : [];
        },
        enabled: !!userId });
}

export function useInfiniteUserPriceReports(userId: string) {
    return useInfiniteQuery({
        queryKey: ['user-price-reports-infinite', userId],
        queryFn: async ({ pageParam = 0 }) => {
            const endpoint = userId === 'me' ? '/price-reports/mine' : `/price-reports/user/${userId}`;
            const { data } = await api.get(endpoint, {
                params: { skip: pageParam, take: 10 }
            });
            return data;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage: unknown) => {
            return getNextSkipFromPage(lastPage);
        },
        enabled: !!userId });
}

export function useInfiniteUserScamAlerts(userId: string) {
    return useInfiniteQuery({
        queryKey: ['user-scam-alerts-infinite', userId],
        queryFn: async ({ pageParam = 0 }) => {
            const endpoint = userId === 'me' ? '/scam-alerts/mine' : `/scam-alerts/user/${userId}`;
            const { data } = await api.get(endpoint, {
                params: { skip: pageParam, take: 10 }
            });
            return data;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage: unknown) => {
            return getNextSkipFromPage(lastPage);
        },
        enabled: !!userId });
}

export function useInfiniteUserCommunityTips(userId: string) {
    return useInfiniteQuery({
        queryKey: ['user-community-tips-infinite', userId],
        queryFn: async ({ pageParam = 0 }) => {
            const endpoint = userId === 'me' ? '/community-tips/mine' : `/community-tips/user/${userId}`;
            const { data } = await api.get(endpoint, {
                params: { skip: pageParam, take: 10 }
            });
            return data;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage: unknown) => {
            return getNextSkipFromPage(lastPage);
        },
        enabled: !!userId });
}

export function useInfiniteUserSpots(userId: string) {
    return useInfiniteQuery({
        queryKey: ['user-spots-infinite', userId],
        queryFn: async ({ pageParam = 0 }) => {
            const endpoint = userId === 'me' ? '/spots/mine' : `/spots/user/${userId}`;
            const { data } = await api.get(endpoint, {
                params: { skip: pageParam, take: 10 }
            });
            return data;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage: unknown) => {
            return getNextSkipFromPage(lastPage);
        },
        enabled: !!userId });
}

// --- Spots ---

export function useSpot(id: string) {
    return useQuery({
        queryKey: ['spot', id],
        queryFn: async () => {
            const { data } = await api.get<unknown>(`/spots/${id}`);
            return unwrapApiData(data);
        },
        enabled: !!id });
}

export function useSpotBySlug(citySlug: string, spotSlug: string) {
    return useQuery({
        queryKey: ['spot', citySlug, spotSlug],
        queryFn: async () => {
            const { data } = await api.get<unknown>(`/spots/by-slug/${citySlug}/${spotSlug}`);
            return unwrapApiData(data);
        },
        enabled: !!citySlug && !!spotSlug });
}

export function useScamAlertBySlug(citySlug: string, alertSlug: string) {
    return useQuery({
        queryKey: ['scam-alert', citySlug, alertSlug],
        queryFn: async () => {
            const { data } = await api.get<unknown>(`/scam-alerts/by-slug/${citySlug}/${alertSlug}`);
            return unwrapApiData(data);
        },
        enabled: !!citySlug && !!alertSlug });
}

export function useSpots(params?: {
    categoryId?: string;
    cityId?: string;
    search?: string;
    sort?: 'newest' | 'popular';
}) {
    // Clean up undefined parameters
    const cleanParams: Record<string, string> = {};
    if (params) {
        if (params.categoryId) cleanParams.categoryId = params.categoryId;
        if (params.cityId) cleanParams.cityId = params.cityId;
        if (params.search) cleanParams.search = params.search;
        if (params.sort) cleanParams.sort = params.sort;
    }

    return useQuery({
        queryKey: ['spots', cleanParams],
        queryFn: async () => {
            const { data } = await api.get<PaginatedSpots>('/spots', { params: cleanParams });
            // The backend returns { data: [...] }
            const unwrapped = unwrapApiData(data);
            return Array.isArray(unwrapped) ? unwrapped : [];
        },
        staleTime: 5 * 60 * 1000, // Increased to 5 minutes
    });
}

export function useInfiniteSpots(params?: {
    categoryId?: string;
    cityId?: string;
    search?: string;
    sort?: 'newest' | 'popular';
    take?: number;
}) {
    const cleanParams: Record<string, string> = {};
    if (params) {
        if (params.categoryId) cleanParams.categoryId = params.categoryId;
        if (params.cityId) cleanParams.cityId = params.cityId;
        if (params.search) cleanParams.search = params.search;
        if (params.sort) cleanParams.sort = params.sort;
    }

    return useInfiniteQuery({
        queryKey: ['spots-infinite', cleanParams],
        queryFn: async ({ pageParam = 0 }) => {
            const { data } = await api.get<PaginatedSpots>('/spots', {
                params: {
                    ...cleanParams,
                    skip: pageParam,
                    take: params?.take || 10 } });
            return data;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage: PaginationLike) => {
            return getNextSkipFromPage(lastPage);
        },
        staleTime: 5 * 60 * 1000, // Increased to 5 minutes
    });
}

export function useNearbySpots(params: { latitude: number; longitude: number; distance?: number; categoryId?: string; limit?: number }, enabled = true) {
    return useQuery({
        queryKey: ['spots-nearby', params],
        queryFn: async () => {
            const { data } = await api.get<PaginatedSpots>('/spots/nearby', { params });
            const unwrapped = unwrapApiData(data);
            return Array.isArray(unwrapped) ? unwrapped : [];
        },
        enabled: enabled && !!params.latitude && !!params.longitude,
        placeholderData: (prev) => prev,
        staleTime: 60_000 });
}

export function usePopularArea() {
    return useQuery({
        queryKey: ['popular-area'],
        queryFn: async () => {
            const { data } = await api.get<{ latitude: number; longitude: number; cityName: string; spotCount: number }>('/spots/popular-area');
            return data;
        } });
}

export function useSpotSearch(query: string, cityId?: string, limit: number = 20) {
    return useQuery({
        queryKey: ['spot-search', query, cityId],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (query) params.set('q', query);
            if (cityId) params.set('cityId', cityId);
            if (limit !== 20) params.set('limit', limit.toString());
            const { data } = await api.get(`/spots/search${params.toString() ? `?${params}` : ''}`);
            const unwrapped = unwrapApiData(data);
            return Array.isArray(unwrapped) ? unwrapped : [];
        },
        enabled: query.trim().length >= 1 });
}

export function useSpotPriceReports(spotId: string) {
    return useQuery({
        queryKey: ['price-reports', spotId],
        queryFn: async () => {
            const { data } = await api.get(`/price-reports/spot/${spotId}`);
            const unwrapped = unwrapApiData(data);
            return Array.isArray(unwrapped) ? unwrapped : [];
        },
        enabled: !!spotId });
}

export function useInfiniteSpotPriceReports(spotId: string) {
    return useInfiniteQuery({
        queryKey: ['price-reports-infinite', spotId],
        queryFn: async ({ pageParam = 0 }) => {
            const { data } = await api.get(`/price-reports/spot/${spotId}`, {
                params: {
                    skip: pageParam,
                    take: 10 } });
            return data;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage: PaginationLike) => {
            return getNextSkipFromPage(lastPage);
        },
        enabled: !!spotId });
}

export function useSpotTips(spotId: string) {
    return useQuery({
        queryKey: ['tips', spotId],
        queryFn: async () => {
            const { data } = await api.get(`/community-tips/spot/${spotId}`);
            const unwrapped = unwrapApiData(data);
            return Array.isArray(unwrapped) ? unwrapped : [];
        },
        enabled: !!spotId });
}

export function useInfiniteSpotTips(
    spotId: string,
    type: 'TRY' | 'AVOID',
    sort: 'newest' | 'popular' = 'popular',
) {
    return useInfiniteQuery({
        queryKey: ['tips-infinite', spotId, type, sort],
        queryFn: async ({ pageParam = 0 }) => {
            const { data } = await api.get(`/community-tips/spot/${spotId}`, {
                params: {
                    skip: pageParam,
                    take: 10,
                    type,
                    sort } });
            return data;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage: PaginationLike) => {
            return getNextSkipFromPage(lastPage, true);
        },
        enabled: !!spotId });
}

export function useSpotGallery(spotId: string, limit: number = 12, sort: 'newest' | 'popular' = 'newest') {
    return useQuery({
        queryKey: ['gallery', spotId, limit, sort],
        queryFn: async () => {
            const { data } = await api.get<PaginatedGallery>(
                `/gallery/spot/${spotId}?take=${limit}&sort=${sort}`,
            );
            return data;
        },
        enabled: !!spotId });
}

export function useInfiniteSpotGallery(spotId: string, sort: 'newest' | 'popular' = 'newest') {
    return useInfiniteQuery({
        queryKey: ['gallery-infinite', spotId, sort],
        queryFn: async ({ pageParam = 0 }) => {
            const { data } = await api.get<PaginatedGallery>(`/gallery/spot/${spotId}`, {
                params: {
                    skip: pageParam,
                    take: 12,
                    sort } });
            return data;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage: PaginationLike) => {
            return getNextSkipFromPage(lastPage, true);
        },
        enabled: !!spotId });
}

export function useUploadSpotImage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ spotId, file }: { spotId: string; file: File }) => {
            const formData = new FormData();
            formData.append('image', file);
            const { data } = await api.post(`/gallery/upload/${spotId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' } });
            return data;
        },
        onSuccess: (_, { spotId }) => {
            queryClient.invalidateQueries({ queryKey: ['gallery', spotId] });
            queryClient.invalidateQueries({ queryKey: ['gallery-infinite', spotId] });
        } });
}

// --- Metadata ---

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await api.get<unknown>('/categories');
            const unwrapped = unwrapApiData(data);
            return Array.isArray(unwrapped) ? unwrapped : [];
        },
        staleTime: 24 * 60 * 60 * 1000, // 24 hours (Managed by developer)
        gcTime: 48 * 60 * 60 * 1000, // Keep in cache for 48 hours
    });
}

export function useCities() {
    return useQuery({
        queryKey: ['cities'],
        queryFn: async () => {
            const { data } = await api.get<unknown[]>('/cities');
            const unwrapped = unwrapApiData(data);
            return Array.isArray(unwrapped) ? unwrapped : [];
        },
        staleTime: 24 * 60 * 60 * 1000, // 24 hours (Managed by developer)
        gcTime: 48 * 60 * 60 * 1000, // Keep in cache for 48 hours
    });
}

// --- Social & Alerts ---

export function useCreateSpot() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: {
            name: string;
            address: string;
            categoryId: string;
            cityId: string;
            latitude: number;
            longitude: number;
            image?: File;
        }) => {
            const formData = new FormData();
            formData.append('name', payload.name);
            formData.append('address', payload.address);
            formData.append('categoryId', payload.categoryId);
            formData.append('cityId', payload.cityId);
            formData.append('latitude', payload.latitude.toString());
            formData.append('longitude', payload.longitude.toString());
            
            if (payload.image) {
                formData.append('image', payload.image);
            }

            const { data } = await api.post('/spots', formData, {
                headers: { 'Content-Type': 'multipart/form-data' } });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['spots'] });
            queryClient.invalidateQueries({ queryKey: ['spots-nearby'] });
        } });
}

export function useUpdateSpot() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: Record<string, string | Blob | number | undefined> }) => {
            const formData = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                if (value !== undefined) {
                    formData.append(key, typeof value === 'number' ? value.toString() : value);
                }
            });
            const { data } = await api.patch(`/spots/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' } });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['spot'] });
            queryClient.invalidateQueries({ queryKey: ['spots'] });
            queryClient.invalidateQueries({ queryKey: ['user-spots-infinite'] });
        } });
}

export function useScamAlerts(params?: {
    cityId?: string;
    categoryId?: string;
    sort?: 'newest' | 'popular';
    search?: string;
    take?: number;
}) {
    // Clean up undefined parameters
    const cleanParams: Record<string, string | number> = {};
    if (params) {
        if (params.cityId) cleanParams.cityId = params.cityId;
        if (params.categoryId) cleanParams.categoryId = params.categoryId;
        if (params.sort) cleanParams.sort = params.sort;
        if (params.search) cleanParams.search = params.search;
        if (params.take) cleanParams.take = params.take;
    }

    return useQuery({
        queryKey: ['scam-alerts', cleanParams],
        queryFn: async () => {
            const { data } = await api.get<PaginatedScamAlerts>('/scam-alerts', {
                params: cleanParams });
            const unwrapped = unwrapApiData(data);
            return Array.isArray(unwrapped) ? unwrapped : [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useInfiniteScamAlerts(params?: {
    cityId?: string;
    categoryId?: string;
    sort?: 'newest' | 'popular';
    search?: string;
    take?: number;
}) {
    const cleanParams: Record<string, string> = {};
    if (params) {
        if (params.cityId) cleanParams.cityId = params.cityId;
        if (params.categoryId) cleanParams.categoryId = params.categoryId;
        if (params.sort) cleanParams.sort = params.sort;
        if (params.search) cleanParams.search = params.search;
    }

    return useInfiniteQuery({
        queryKey: ['scam-alerts-infinite', cleanParams],
        queryFn: async ({ pageParam = 0 }) => {
            const { data } = await api.get<PaginatedScamAlerts>('/scam-alerts', {
                params: {
                    ...cleanParams,
                    skip: pageParam,
                    take: params?.take || 10 } });
            return data;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage: PaginationLike) => {
            return getNextSkipFromPage(lastPage);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useLiveVibes(params?: { spotId?: string; cityId?: string; take?: number }) {
    const query = new URLSearchParams();
    if (params?.spotId) query.set('spotId', params.spotId);
    if (params?.cityId) query.set('cityId', params.cityId);
    if (params?.take) query.set('take', params.take.toString());
    const qs = query.toString();
    return useQuery({
        queryKey: ['live-vibes', params],
        queryFn: async () => {
            const { data } = await api.get<unknown>(`/live-vibes${qs ? `?${qs}` : ''}`);
            const unwrapped = unwrapApiData(data);
            return Array.isArray(unwrapped) ? unwrapped : [];
        },
        staleTime: 60 * 1000, // 1 minute
    });
}

export function useInfiniteLiveVibes(params?: { spotId?: string; cityId?: string; categoryId?: string; take?: number }) {
    return useInfiniteQuery({
        queryKey: ['live-vibes-infinite', params],
        queryFn: async ({ pageParam = 0 }) => {
            const { data } = await api.get<unknown>('/live-vibes', {
                params: {
                    ...params,
                    skip: pageParam,
                    take: params?.take || 10 } });
            const unwrapped = unwrapApiData(data);
            if (unwrapped && typeof unwrapped === 'object' && 'data' in unwrapped) {
                return unwrapped as PaginatedLiveVibes;
            }
            return {
                data: Array.isArray(unwrapped) ? unwrapped : [],
                pagination: { skip: Number(pageParam) || 0, take: params?.take || 10, total: Array.isArray(unwrapped) ? unwrapped.length : 0, hasMore: false }
            } satisfies PaginatedLiveVibes;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage: PaginatedLiveVibes) => {
            return getNextSkipFromPage(lastPage);
        },
        staleTime: 60 * 1000, // 1 minute
    });
}

// --- Comments ---

export function useTipComments(tipId: string) {
    return useInfiniteQuery({
        queryKey: ['tip-comments', tipId],
        queryFn: async ({ pageParam = 0 }) => {
            const { data } = await api.get(`/comments/tip/${tipId}?skip=${pageParam}&take=10`);
            return data;
        },
        getNextPageParam: (lastPage: PaginationLike) => {
            return getNextSkipFromPage(lastPage, true);
        },
        initialPageParam: 0,
        enabled: !!tipId });
}


 
export function useScamComments(scamAlertId: string) {
    return useInfiniteQuery({
        queryKey: ['scam-comments', scamAlertId],
        queryFn: async ({ pageParam = 0 }) => {
            const { data } = await api.get(`/comments/alert/${scamAlertId}?skip=${pageParam}&take=10`);
            return data;
        },
        getNextPageParam: (lastPage) => {
            return getNextSkipFromPage(lastPage, true);
        },
        initialPageParam: 0,
        enabled: !!scamAlertId });
}
export function useCreateComment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: {
            scamAlertId?: string;
            communityTipId?: string;
            content: string;
        }) => {
            const apiPayload: Record<string, string> = {
                text: payload.content };
            
            if (payload.scamAlertId) {
                apiPayload.targetType = 'SCAM_ALERT';
                apiPayload.scamAlertId = payload.scamAlertId;
            } else if (payload.communityTipId) {
                apiPayload.targetType = 'COMMUNITY_TIP';
                apiPayload.communityTipId = payload.communityTipId;
            }

            const { data } = await api.post('/comments', apiPayload);
            return data;
        },
        onSuccess: (_, variables) => {
            if (variables.scamAlertId) {
                queryClient.invalidateQueries({ queryKey: ['scam-comments', variables.scamAlertId] });
                queryClient.invalidateQueries({ queryKey: ['scam-alerts-infinite'] });
            }
            if (variables.communityTipId) {
                queryClient.invalidateQueries({ queryKey: ['tip-comments', variables.communityTipId] });
                queryClient.invalidateQueries({ queryKey: ['tips-infinite'] });
            }
        } });
}

export function useUpdateComment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { id: string; content: string; scamAlertId?: string; communityTipId?: string }) => {
            const { data } = await api.patch(`/comments/${payload.id}`, { text: payload.content });
            return data;
        },
        onSuccess: (_, variables) => {
            if (variables.scamAlertId) {
                queryClient.invalidateQueries({ queryKey: ['scam-comments', variables.scamAlertId] });
            }
            if (variables.communityTipId) {
                queryClient.invalidateQueries({ queryKey: ['tip-comments', variables.communityTipId] });
            }
        }
    });
}

export function useDeleteComment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { id: string; scamAlertId?: string; communityTipId?: string }) => {
            const { data } = await api.delete(`/comments/${payload.id}`);
            return data;
        },
        onSuccess: (_, variables) => {
            if (variables.scamAlertId) {
                queryClient.invalidateQueries({ queryKey: ['scam-comments', variables.scamAlertId] });
                queryClient.invalidateQueries({ queryKey: ['scam-alerts-infinite'] });
            }
            if (variables.communityTipId) {
                queryClient.invalidateQueries({ queryKey: ['tip-comments', variables.communityTipId] });
                queryClient.invalidateQueries({ queryKey: ['tips-infinite'] });
            }
        }
    });
}

export function useCreateCommunityTip() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: {
            spotId: string;
            type: 'TRY' | 'AVOID';
            title: string;
            description: string;
        }) => {
            const { data } = await api.post('/community-tips', payload);
            return data;
        },
        onSuccess: (_, { spotId }) => {
            queryClient.invalidateQueries({ queryKey: ['tips', spotId] });
            queryClient.invalidateQueries({ queryKey: ['tips-infinite', spotId] });
        } });
}

export function useUpdateCommunityTip() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: {
            id: string;
            spotId: string;
            type?: 'TRY' | 'AVOID';
            title?: string;
            description?: string;
        }) => {
            const { id, spotId, ...updateData } = payload;
            const { data } = await api.patch(`/community-tips/${id}`, updateData);
            return data;
        },
        onSuccess: (_, { spotId }) => {
            queryClient.invalidateQueries({ queryKey: ['tips', spotId] });
            queryClient.invalidateQueries({ queryKey: ['tips-infinite', spotId] });
        } });
}

export function useDeleteCommunityTip() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, spotId }: { id: string; spotId: string }) => {
            const { data } = await api.delete(`/community-tips/${id}`);
            return data;
        },
        onSuccess: (_, { spotId }) => {
            queryClient.invalidateQueries({ queryKey: ['tips', spotId] });
            queryClient.invalidateQueries({ queryKey: ['tips-infinite', spotId] });
        } });
}

// --- Mutations ---

export function useCreatePriceReport() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { spotId: string; itemName: string; priceThb: number }) => {
            const { data } = await api.post('/price-reports', payload);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['spots'] });
            queryClient.invalidateQueries({ queryKey: ['price-reports', variables.spotId] });
            queryClient.invalidateQueries({ queryKey: ['price-reports-infinite', variables.spotId] });
        } });
}

export function useCreateScamAlert() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: {
            scamName: string;
            description: string;
            preventionTip: string;
            cityId: string;
            categoryId: string;
            image?: File;
        }) => {
            const formData = new FormData();
            formData.append('scamName', payload.scamName);
            formData.append('description', payload.description);
            formData.append('preventionTip', payload.preventionTip);
            formData.append('cityId', payload.cityId);
            formData.append('categoryId', payload.categoryId);
            
            if (payload.image) {
                formData.append('image', payload.image);
            }

            const { data } = await api.post('/scam-alerts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' } });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scam-alerts'] });
        } });
}

export function useUpdateScamAlert() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: Record<string, string | Blob | number | undefined> }) => {
            const formData = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                if (value !== undefined) {
                    formData.append(key, typeof value === 'number' ? value.toString() : value);
                }
            });
            const { data } = await api.patch(`/scam-alerts/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' } });
            return data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['scam-alerts'] });
            queryClient.invalidateQueries({ queryKey: ['user-scam-alerts-infinite'] });
        } });
}

export function useDeleteScamAlert() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete(`/scam-alerts/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scam-alerts'] });
            queryClient.invalidateQueries({ queryKey: ['user-scam-alerts-infinite'] });
        } });
}

export function useCreateLiveVibe() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: {
            spotId: string;
            crowdLevel: number;
            waitTimeMinutes?: number;
        }) => {
            const { data } = await api.post('/live-vibes', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['live-vibes'] });
            queryClient.invalidateQueries({ queryKey: ['spots'] });
        } });
}

// --- Votes ---

export function useCreateVote() {
    return useMutation({
        mutationFn: async ({
            targetId,
            type }: {
            targetId: string;
            type: 'tip' | 'alert' | 'image' | 'spot';
        }) => {
            let endpoint = '';
            const payload: Record<string, string> = {};

            if (type === 'tip') {
                endpoint = '/votes/tip';
                payload.communityTipId = targetId;
            } else if (type === 'alert') {
                endpoint = '/votes/alert';
                payload.scamAlertId = targetId;
            } else if (type === 'image') {
                endpoint = '/votes/image';
                payload.galleryImageId = targetId;
            } else if (type === 'spot') {
                endpoint = '/votes/spot';
                payload.spotId = targetId;
            }

            const { data } = await api.post(endpoint, payload);
            return data;
        } });
}

export function useDeleteVote() {
    return useMutation({
        mutationFn: async ({
            voteId,
            type }: {
            voteId: string;
            type: 'tip' | 'alert' | 'image' | 'spot';
        }) => {
            const { data } = await api.delete(`/votes/${type}/${voteId}`);
            return data;
        } });
}

// --- Missions (Checklist) ---

export function useMissions(status: string = 'all', sort: string = 'newest', userId: string = 'me') {
    return useInfiniteQuery({
        queryKey: ['missions-infinite', userId, status, sort],
        queryFn: async ({ pageParam = 0 }) => {
            const params: Record<string, string | number> = { skip: pageParam, take: 10, sort };
            if (status !== 'all') {
                params.status = status;
            }
            const { data } = await api.get('/checklist', { params });
            return data;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage: PaginationLike) => {
            return getNextSkipFromPage(lastPage);
        },
        enabled: !!userId });
}

export function useMissionStats() {
    return useQuery({
        queryKey: ['mission-stats'],
        queryFn: async () => {
            const { data } = await api.get('/checklist/stats');
            return data;
        } });
}

export function useAddMission() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (spotId: string) => {
            const { data } = await api.post('/checklist', { spotId });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['missions-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['mission-stats'] });
            queryClient.invalidateQueries({ queryKey: ['spot'] });
            queryClient.invalidateQueries({ queryKey: ['spots'] });
        } });
}

export function useUpdateMission() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
            const { data } = await api.patch(`/checklist/${id}`, { completed });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['missions-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['mission-stats'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['spot'] });
            queryClient.invalidateQueries({ queryKey: ['spots'] });
        } });
}

export function useDeleteMission() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete(`/checklist/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['missions-infinite'] });
            queryClient.invalidateQueries({ queryKey: ['mission-stats'] });
        } });
}

export function useReverseGeocode() {
    return useMutation({
        mutationFn: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
            const { data } = await api.post('/spots/reverse-geocode', { latitude, longitude });
            return data?.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        } });
}

// --- Reports ---

export function useCreateReport() {
    return useMutation({
        mutationFn: async ({
            reportType,
            targetId,
            reason,
            description }: {
            reportType: 'SPOT' | 'COMMUNITY_TIP' | 'SCAM_ALERT' | 'COMMENT' | 'PROFILE';
            targetId: string;
            reason: string;
            description?: string;
        }) => {
            const { data } = await api.post('/reports', {
                reportType,
                targetId,
                reason,
                description });
            return data;
        } });
}

export function useGetReports(status?: string) {
    return useQuery({
        queryKey: ['reports', status],
        queryFn: async () => {
            const params = status ? { status } : {};
            const { data } = await api.get('/reports', { params });
            return data?.data || [];
        } });
}

// ---  Reactions ---

export function useToggleCommentReaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (commentId: string) => {
            const { data } = await api.post(`/comments/${commentId}/reactions`);
            return data;
        },
        onSuccess: (data, commentId) => {
            // updateInfiniteQueryData is a helper or we can do it inline
            const updatePage = (page: { data?: Array<{ id?: string } & Record<string, unknown>> }) => ({
                ...page,
                data: page.data?.map((c) => c.id === commentId ? { ...c, ...data } : c)
            });

            queryClient.setQueriesData({ queryKey: ['tip-comments'] }, (old: { pages?: Array<{ data?: Array<{ id?: string } & Record<string, unknown>> }> } | undefined) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages?.map(updatePage)
                };
            });

            queryClient.setQueriesData({ queryKey: ['scam-comments'] }, (old: { pages?: Array<{ data?: Array<{ id?: string } & Record<string, unknown>> }> } | undefined) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages?.map(updatePage)
                };
            });
        } });
}

export function useGetCommentReaction(commentId: string) {
    return useQuery({
        queryKey: ['comment-reaction', commentId],
        queryFn: async () => {
            const { data } = await api.get(`/comments/${commentId}/reactions`);
            return data?.data || { reactionCount: 0, userHasReacted: false };
        },
        enabled: !!commentId });
}
