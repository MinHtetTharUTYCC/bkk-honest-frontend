'use client';

import { 
    useProfilesControllerGetMe, 
    useProfilesControllerGetLeaderboard, 
    useProfilesControllerFindOne,
    useProfilesControllerCreate,
    useProfilesControllerUpdate
} from '@/api/generated/profiles/profiles';
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
        mutate: (data: any) => mutation.mutate({ data }),
        mutateAsync: (data: any) => mutation.mutateAsync({ data })
    };
}

export function useUpdateProfile() {
    const mutation = useProfilesControllerUpdate();
    return {
        ...mutation,
        mutate: (data: any) => mutation.mutate({ data }),
        mutateAsync: (data: any) => mutation.mutateAsync({ data })
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
