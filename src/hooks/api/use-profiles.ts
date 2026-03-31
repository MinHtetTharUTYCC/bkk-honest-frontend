'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import {
    useProfilesControllerGetMe,
    useProfilesControllerFindOne,
    useProfilesControllerGetLeaderboard,
    useProfilesControllerCreate,
    useProfilesControllerUpdate,
} from '@/api/generated/profiles/profiles';
import type { CreateProfileDto } from '@/api/generated/model/createProfileDto';
import type { UpdateProfileDto } from '@/api/generated/model/updateProfileDto';
import {
    priceReportsControllerFindMyReports,
    priceReportsControllerFindByUser,
} from '@/api/generated/price-reports/price-reports';
import {
    scamAlertsControllerFindMyAlerts,
    scamAlertsControllerFindByUser,
} from '@/api/generated/scam-alerts/scam-alerts';
import {
    communityTipsControllerFindMyTips,
    communityTipsControllerFindByUser,
} from '@/api/generated/community-tips/community-tips';
import { spotsControllerFindMySpots, spotsControllerFindByUser } from '@/api/generated/spots/spots';
import { getNextSkipFromPage } from './base';

export function useMyProfile() {
    const query = useProfilesControllerGetMe({ query: { retry: false } });
    return { ...query, data: query.data?.data };
}

export function useVisitProfile(id: string) {
    const query = useProfilesControllerFindOne(id, { query: { retry: false } });
    return { ...query, data: query.data?.data };
}

export function useLeaderboard(take = 5) {
    const params = { take: String(take) };
    const query = useProfilesControllerGetLeaderboard(params, {
        query: { staleTime: 5 * 60 * 1000 },
    });
    return { ...query, data: query.data?.data };
}

export function useCreateProfile() {
    const mutation = useProfilesControllerCreate();
    return {
        ...mutation,
        mutate: (data: CreateProfileDto) => mutation.mutate({ data }),
        mutateAsync: (data: CreateProfileDto) => mutation.mutateAsync({ data }),
    };
}

export function useUpdateProfile() {
    const mutation = useProfilesControllerUpdate();
    return {
        ...mutation,
        mutate: (data: UpdateProfileDto) => mutation.mutate({ data }),
        mutateAsync: (data: UpdateProfileDto) => mutation.mutateAsync({ data }),
    };
}

export function useInfiniteUserPriceReports(userId: string) {
    const isMe = userId === 'me';
    return useInfiniteQuery({
        queryKey: ['user-price-reports-infinite', userId],
        queryFn: async ({ pageParam = 0 }) => {
            const skip = pageParam > 0 ? pageParam : undefined;
            return isMe
                ? priceReportsControllerFindMyReports({ take: 10, skip })
                : priceReportsControllerFindByUser(userId, { take: 10, skip });
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
            return isMe
                ? scamAlertsControllerFindMyAlerts({ take: 10, skip })
                : scamAlertsControllerFindByUser(userId, { take: 10, skip });
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
            return isMe
                ? communityTipsControllerFindMyTips({ take: 10, skip })
                : communityTipsControllerFindByUser(userId, { take: 10, skip });
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
            return isMe
                ? spotsControllerFindMySpots({ take: 10, skip })
                : spotsControllerFindByUser(userId, { take: 10, skip });
        },
        getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage),
        enabled: !!userId,
        initialPageParam: 0,
    });

    return userSpots;
}
