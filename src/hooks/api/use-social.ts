'use client';

import { useMutation } from '@tanstack/react-query';
import {
    useReportsControllerCreateReport,
    useReportsControllerGetReports,
} from '@/api/generated/reports/reports';
import {
    votesControllerCreateTipVote,
    votesControllerCreateAlertVote,
    votesControllerCreateImageVote,
    votesControllerCreateSpotVote,
    votesControllerDeleteVote,
} from '@/api/generated/votes/votes';

export function useCreateVote() {
    return useMutation({
        mutationFn: async ({
            targetId,
            type,
        }: {
            targetId: string;
            type: 'tip' | 'alert' | 'image' | 'spot';
        }) => {
            if (type === 'tip') {
                return await votesControllerCreateTipVote({ communityTipId: targetId });
            } else if (type === 'alert') {
                return await votesControllerCreateAlertVote({ scamAlertId: targetId });
            } else if (type === 'image') {
                return await votesControllerCreateImageVote({
                    galleryImageId: targetId,
                });
            } else if (type === 'spot') {
                return await votesControllerCreateSpotVote({ spotId: targetId });
            }
            throw new Error('Invalid vote type');
        },
    });
}

export function useDeleteVote() {
    return useMutation({
        mutationFn: async ({
            voteId,
            type: _type,
        }: {
            voteId: string;
            type: 'tip' | 'alert' | 'image' | 'spot';
        }) => {
            return await votesControllerDeleteVote(voteId);
        },
    });
}

export function useCreateReport() {
    const mutation = useReportsControllerCreateReport();
    return {
        ...mutation,
        mutate: (payload: {
            reportType: 'SPOT' | 'COMMUNITY_TIP' | 'SCAM_ALERT' | 'COMMENT' | 'PROFILE';
            targetId: string;
            reason: string;
            description?: string;
        }) => mutation.mutate({ data: payload }),
        mutateAsync: (payload: {
            reportType: 'SPOT' | 'COMMUNITY_TIP' | 'SCAM_ALERT' | 'COMMENT' | 'PROFILE';
            targetId: string;
            reason: string;
            description?: string;
        }) => mutation.mutateAsync({ data: payload }),
    };
}

export function useGetReports(status?: string, limit = 10, offset = 0) {
    const query = useReportsControllerGetReports(
        {
            status: status || '',
            limit,
            offset,
        },
        { query: { queryKey: ['reports', status, limit, offset] } },
    );
    return { ...query, data: query.data?.data || [] };
}
