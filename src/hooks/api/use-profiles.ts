'use client';

import { 
    useProfilesControllerGetMe, 
    useProfilesControllerGetLeaderboard, 
    useProfilesControllerFindOne,
    useProfilesControllerCreate,
    useProfilesControllerUpdate
} from '@/api/generated/profiles/profiles';
import type { CreateProfileDto } from '@/api/generated/model/createProfileDto';
import type { UpdateProfileDto } from '@/api/generated/model/updateProfileDto';
import { usePriceReportsControllerFindMyReportsInfinite, usePriceReportsControllerFindByUserInfinite } from '@/api/generated/price-reports/price-reports';
import { useScamAlertsControllerFindMyAlertsInfinite, useScamAlertsControllerFindByUserInfinite } from '@/api/generated/scam-alerts/scam-alerts';
import { useCommunityTipsControllerFindMyTipsInfinite, useCommunityTipsControllerFindByUserInfinite } from '@/api/generated/community-tips/community-tips';
import { useSpotsControllerFindMySpotsInfinite, useSpotsControllerFindByUserInfinite } from '@/api/generated/spots/spots';
import { getNextSkipFromPage } from './base';

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
        mutate: (data: CreateProfileDto) => mutation.mutate({ data }),
        mutateAsync: (data: CreateProfileDto) => mutation.mutateAsync({ data })
    };
}

export function useUpdateProfile() {
    const mutation = useProfilesControllerUpdate();
    return {
        ...mutation,
        mutate: (data: UpdateProfileDto) => mutation.mutate({ data }),
        mutateAsync: (data: UpdateProfileDto) => mutation.mutateAsync({ data })
    };
}

export function useInfiniteUserPriceReports(userId: string) {
    const isMe = userId === 'me';
    const myReports = usePriceReportsControllerFindMyReportsInfinite({ take: 10 }, {
        query: { 
            queryKey: ['user-price-reports-infinite', 'me'], 
            initialPageParam: 0, 
            getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage),
            enabled: isMe
        }
    });
    const userReports = usePriceReportsControllerFindByUserInfinite(userId, { take: 10 }, {
        query: { 
            queryKey: ['user-price-reports-infinite', userId], 
            initialPageParam: 0,
            getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage),
            enabled: !isMe && !!userId
        }
    });
    return isMe ? myReports : userReports;
}

export function useInfiniteUserScamAlerts(userId: string) {
    const isMe = userId === 'me';
    const myAlerts = useScamAlertsControllerFindMyAlertsInfinite({ take: 10 }, {
        query: { 
            queryKey: ['user-scam-alerts-infinite', 'me'], 
            initialPageParam: 0, 
            getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage),
            enabled: isMe
        }
    });
    const userAlerts = useScamAlertsControllerFindByUserInfinite(userId, { take: 10 }, {
        query: { 
            queryKey: ['user-scam-alerts-infinite', userId], 
            initialPageParam: 0,
            getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage),
            enabled: !isMe && !!userId 
        }
    });
    return isMe ? myAlerts : userAlerts;
}

export function useInfiniteUserCommunityTips(userId: string) {
    const isMe = userId === 'me';
    const myTips = useCommunityTipsControllerFindMyTipsInfinite({ take: 10 }, {
        query: { 
            queryKey: ['user-community-tips-infinite', 'me'], 
            initialPageParam: 0, 
            getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage),
            enabled: isMe
        }
    });
    const userTips = useCommunityTipsControllerFindByUserInfinite(userId, { take: 10 }, {
        query: { 
            queryKey: ['user-community-tips-infinite', userId], 
            initialPageParam: 0,
            getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage),
            enabled: !isMe && !!userId 
        }
    });
    return isMe ? myTips : userTips;
}

export function useInfiniteUserSpots(userId: string) {
    const isMe = userId === 'me';
    const mySpots = useSpotsControllerFindMySpotsInfinite({ take: 10 }, {
        query: { 
            queryKey: ['user-spots-infinite', 'me'], 
            initialPageParam: 0, 
            getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage),
            enabled: isMe
        }
    });
    const userSpots = useSpotsControllerFindByUserInfinite(userId, { take: 10 }, {
        query: { 
            queryKey: ['user-spots-infinite', userId], 
            initialPageParam: 0,
            getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage),
            enabled: !isMe && !!userId 
        }
    });
    return isMe ? mySpots : userSpots;
}
