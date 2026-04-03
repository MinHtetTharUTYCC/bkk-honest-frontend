'use client';

import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { unwrapApiSuccessData } from '@/lib/api/api-envelope';
import { throwApiError } from '@/lib/errors/throw-api-error';
import { openApiClient } from '@/lib/api/openapi-client';
import type {
    CommentReactionResponseDto,
    CommentResponseDto,
    CreateCommentDto,
    MessageResponseDto,
    PaginatedCommentsDto,
} from '@/types/api-models';
import { getNextSkipFromPage } from './base';

export function useTipComments(tipId: string) {
    return useInfiniteQuery({
        queryKey: ['tip-comments', tipId],
        queryFn: async ({ pageParam = 0 }) => {
            const skip = pageParam > 0 ? pageParam : undefined;
            const { data, error } = await openApiClient.GET('/comments/tip/{communityTipId}', {
                params: { path: { communityTipId: tipId }, query: { take: 10, skip } },
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<PaginatedCommentsDto>(data);
        },
        getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage, true),
        enabled: !!tipId,
        initialPageParam: 0,
    });
}

export function useScamComments(scamAlertId: string) {
    return useInfiniteQuery({
        queryKey: ['scam-comments', scamAlertId],
        queryFn: async ({ pageParam = 0 }) => {
            const skip = pageParam > 0 ? pageParam : undefined;
            const { data, error } = await openApiClient.GET('/comments/alert/{scamAlertId}', {
                params: { path: { scamAlertId }, query: { take: 10, skip } },
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<PaginatedCommentsDto>(data);
        },
        getNextPageParam: (lastPage: unknown) => getNextSkipFromPage(lastPage, true),
        enabled: !!scamAlertId,
        initialPageParam: 0,
    });
}

export function useCreateComment() {
    return useMutation({
        mutationKey: ['comments-create'],
        mutationFn: async (payload: {
            scamAlertId?: string;
            communityTipId?: string;
            content: string;
        }) => {
            const apiPayload: CreateCommentDto = {
                text: payload.content,
                targetType: 'COMMUNITY_TIP',
            };
            if (payload.scamAlertId) {
                apiPayload.targetType = 'SCAM_ALERT';
                apiPayload.scamAlertId = payload.scamAlertId;
            } else if (payload.communityTipId) {
                apiPayload.targetType = 'COMMUNITY_TIP';
                apiPayload.communityTipId = payload.communityTipId;
            }

            const { data, error } = await openApiClient.POST('/comments', {
                body: apiPayload,
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<CommentResponseDto>(data);
        },
    });
}

export function useUpdateComment() {
    return useMutation({
        mutationKey: ['comments-update'],
        mutationFn: async (payload: {
            id: string;
            content: string;
            scamAlertId?: string;
            communityTipId?: string;
        }) => {
            const { data, error } = await openApiClient.PATCH('/comments/{id}', {
                params: { path: { id: payload.id } },
                body: { text: payload.content },
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<CommentResponseDto>(data);
        },
    });
}

export function useDeleteComment() {
    return useMutation({
        mutationKey: ['comments-delete'],
        mutationFn: async (payload: { id: string; scamAlertId?: string; communityTipId?: string }) => {
            const { data, error } = await openApiClient.DELETE('/comments/{id}', {
                params: { path: { id: payload.id } },
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<MessageResponseDto>(data);
        },
    });
}

export function useToggleCommentReaction() {
    return useMutation({
        mutationKey: ['comment-reaction-toggle'],
        mutationFn: async (commentId: string) => {
            const { data, error } = await openApiClient.POST('/comments/{commentId}/reactions', {
                params: { path: { commentId } },
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<CommentReactionResponseDto>(data);
        },
    });
}

export function useGetCommentReaction(commentId: string) {
    const query = useQuery({
        queryKey: ['comment-reaction', commentId],
        enabled: !!commentId,
        queryFn: async () => {
            const { data, error } = await openApiClient.GET('/comments/{commentId}/reactions', {
                params: { path: { commentId } },
            });

            if (error) {
                throwApiError(error);
            }

            return unwrapApiSuccessData<CommentReactionResponseDto>(data);
        },
    });
    return {
        ...query,
        data: query.data || { reactionCount: 0, userHasReacted: false },
    };
}
