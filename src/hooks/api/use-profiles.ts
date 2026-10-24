'use client';

import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import type {
    CreateProfileDto,
    LeaderboardProfileDto,
    ProfileResponseDto,
    UpdateProfileDto,
} from '@/types/api-models';
import { unwrapApiSuccessData } from '@/lib/api/api-envelope';
import { throwApiError } from '@/lib/errors/throw-api-error';
import { openApiClient } from '@/lib/api/openapi-client';
import type {
    PaginatedCommunityTipsResponseDto,
    PaginatedPriceReportsDto,
    PaginatedScamAlertsResponseDto,
    PaginatedSpotsWithStatsResponseDto,
} from '@/types/api-models';
import { getNextSkipFromPage } from './base';

export function useMyProfile() {
    const query = useQuery({
        queryKey: ['profile-me'],
        retry: false,
        queryFn: async () => {
            const { data, error } = await openApiClient.GET('/profiles/me');

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<ProfileResponseDto>(data);
        },
    });
    return { ...query, data: query.data };
}

export function useVisitProfile(id: string) {
    const query = useQuery({
        queryKey: ['profile', id],
        enabled: !!id,
        retry: false,
        queryFn: async () => {
            const { data, error } = await openApiClient.GET('/profiles/{id}', {
                params: { path: { id } },
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<ProfileResponseDto>(data);
        },
    });
    return { ...query, data: query.data };
}

export function useLeaderboard(take = 5) {
    const query = useQuery({
        queryKey: ['leaderboard', take],
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
            const { data, error } = await openApiClient.GET('/profiles/leaderboard/top', {
                params: { query: { take: String(take) } },
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<LeaderboardProfileDto[]>(data);
        },
    });
    return { ...query, data: query.data };
}

export function useCreateProfile() {
    return useMutation({
        mutationKey: ['profile-create'],
        mutationFn: async (data: CreateProfileDto) => {
            const { data: responseData, error } = await openApiClient.POST('/profiles', {
                body: data,
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<ProfileResponseDto>(responseData);
        },
    });
}

export function useUpdateProfile() {
    return useMutation({
        mutationKey: ['profile-update'],
        mutationFn: async (data: UpdateProfileDto) => {
            const { data: responseData, error } = await openApiClient.PATCH('/profiles/me', {
                body: data,
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<ProfileResponseDto>(responseData);
        },
    });
}

export function useInfiniteUserPriceReports(userId: string) {
    const isMe = userId === 'me';
    return useInfiniteQuery({
        queryKey: ['user-price-reports-infinite', userId],
        queryFn: async ({ pageParam = 0 }) => {
            const skip = pageParam > 0 ? pageParam : undefined;
            const response = isMe
                ? await openApiClient.GET('/price-reports/mine', {
                      params: { query: { take: 10, skip } },
                  })
                : await openApiClient.GET('/price-reports/user/{userId}', {
                      params: { path: { userId }, query: { take: 10, skip } },
                  });

            const { data, error } = response;

            if (error) {
                throwApiError(error);
            }

            return {
                data: unwrapApiSuccessData<PaginatedPriceReportsDto>(data),
            };
        },
        getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage),
        enabled: !!userId,
        initialPageParam: 0,
    });
}

export function useInfiniteUserScamAlerts(userId: string) {
    const isMe = userId === 'me';
    const userAlerts = useInfiniteQuery({
        queryKey: ['user-scam-alerts-infinite', userId],
        queryFn: async ({ pageParam = 0 }) => {
            const skip = pageParam > 0 ? pageParam : undefined;
            const response = isMe
                ? await openApiClient.GET('/scam-alerts/mine', {
                      params: { query: { take: 10, skip } },
                  })
                : await openApiClient.GET('/scam-alerts/user/{userId}', {
                      params: { path: { userId }, query: { take: 10, skip } },
                  });

            const { data, error } = response;

            if (error) {
                throwApiError(error);
            }

            return {
                data: unwrapApiSuccessData<PaginatedScamAlertsResponseDto>(data),
            };
        },
        getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage),
        enabled: !!userId,
        initialPageParam: 0,
    });

    return userAlerts;
}

export function useInfiniteUserCommunityTips(userId: string) {
    const isMe = userId === 'me';
    const userTips = useInfiniteQuery({
        queryKey: ['user-community-tips-infinite', userId],
        queryFn: async ({ pageParam = 0 }) => {
            const skip = pageParam > 0 ? pageParam : undefined;
            const response = isMe
                ? await openApiClient.GET('/community-tips/mine', {
                      params: { query: { take: 10, skip } },
                  })
                : await openApiClient.GET('/community-tips/user/{userId}', {
                      params: { path: { userId }, query: { take: 10, skip } },
                  });

            const { data, error } = response;

            if (error) {
                throwApiError(error);
            }

            return {
                data: unwrapApiSuccessData<PaginatedCommunityTipsResponseDto>(data),
            };
        },
        getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage),
        enabled: !!userId,
        initialPageParam: 0,
    });
    return userTips;
}

export function useInfiniteUserSpots(userId: string) {
    const isMe = userId === 'me';
    const userSpots = useInfiniteQuery({
        queryKey: ['user-spots-infinite', userId],
        queryFn: async ({ pageParam = 0 }) => {
            const skip = pageParam > 0 ? pageParam : undefined;
            const response = isMe
                ? await openApiClient.GET('/spots/mine', {
                      params: { query: { take: 10, skip } },
                  })
                : await openApiClient.GET('/spots/user/{userId}', {
                      params: { path: { userId }, query: { take: 10, skip } },
                  });

            const { data, error } = response;

            if (error) {
                throwApiError(error);
            }

            return {
                data: unwrapApiSuccessData<PaginatedSpotsWithStatsResponseDto>(data),
            };
        },
        getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage),
        enabled: !!userId,
        initialPageParam: 0,
    });

    return userSpots;
}
