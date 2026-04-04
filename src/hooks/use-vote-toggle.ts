'use client';

import { useCreateVote, useDeleteVote } from '@/hooks/api';
import { Query, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
    CommunityTipResponseDto,
    CreateVoteResponseDto,
    ScamAlertResponseDto,
    GalleryImageResponseDto,
    SpotWithStatsResponseDto,
    CommentResponseDto,
    LiveVibeDto,
    PriceReportDto,
    UnauthorizedErrorDto,
} from '@/types/api-models';

type Voteable =
    | (CommunityTipResponseDto & { hasVoted?: boolean; voteId?: string | null })
    | (ScamAlertResponseDto & { hasVoted?: boolean; voteId?: string | null })
    | (GalleryImageResponseDto & { hasVoted?: boolean; voteId?: string | null })
    | (SpotWithStatsResponseDto & { hasVoted?: boolean; voteId?: string | null })
    | (CommentResponseDto & { hasVoted?: boolean; voteId?: string | null })
    | (LiveVibeDto & { hasVoted?: boolean; voteId?: string | null })
    | (PriceReportDto & { hasVoted?: boolean; voteId?: string | null });

type VoteableItem = {
    id: string;
    hasVoted?: boolean;
    voteId?: string | null;
};

// Paginated response with items
type PaginatedPage<T> = {
    data: T[];
    pagination?: Record<string, unknown>;
};

// Single item wrapped response format (alternative API response)
type ItemResponse<T> = {
    data: T;
};

// Single item case
type SingleItem<T> = T;

// All possible cache format types
type CacheFormat<T = Voteable> =
    | SingleItem<T>
    | ItemResponse<T>
    | PaginatedPage<T>
    | {
          pages?: Array<PaginatedPage<T> | { data?: T[] }>;
          [key: string]: unknown;
      };

type OrvalPage = {
    data: PaginatedPage<Voteable>;
    status: number;
    headers: unknown;
};

function extractVoteId(response: unknown): string {
    if (
        response &&
        typeof response === 'object' &&
        'data' in response &&
        response.data &&
        typeof response.data === 'object' &&
        'voteId' in response.data
    ) {
        const voteId = (response.data as Partial<CreateVoteResponseDto>).voteId;
        if (typeof voteId === 'string') return voteId;
    }

    if (response && typeof response === 'object' && 'voteId' in response) {
        const voteId = (response as Partial<CreateVoteResponseDto>).voteId;
        if (typeof voteId === 'string') return voteId;
    }

    throw new Error('Vote created but no voteId returned');
}

export function useVoteToggle(type: 'tip' | 'alert' | 'image' | 'spot', spotId?: string) {
    const createVote = useCreateVote();
    const deleteVote = useDeleteVote();
    const queryClient = useQueryClient();

    const getQueryPredicate = () => {
        if (type === 'image')
            return (query: Query) => {
                const key = query.queryKey[0];
                if (typeof key !== 'string') return false;
                const isGallery =
                    key === 'gallery' ||
                    key === 'gallery-infinite' ||
                    (typeof key === 'string' && key.startsWith('/gallery/spot/'));
                return (
                    isGallery &&
                    (!spotId ||
                        query.queryKey.some((k) => k === spotId) ||
                        (typeof key === 'string' && key.includes(spotId || '')))
                );
            };
        if (type === 'tip')
            return (query: Query) => {
                const key = query.queryKey[0];
                if (typeof key !== 'string') return false;
                const isTips =
                    key === 'tips' ||
                    key === 'tips-infinite' ||
                    (typeof key === 'string' && key.startsWith('/community-tips/spot/'));
                return (
                    isTips &&
                    (!spotId ||
                        query.queryKey.some((k) => k === spotId) ||
                        (typeof key === 'string' && key.includes(spotId || '')))
                );
            };
        if (type === 'alert')
            return (query: Query) => {
                const key = query.queryKey[0];
                if (typeof key !== 'string') return false;
                return (
                    ['scam-alerts', 'scam-alerts-infinite', 'scam-alert'].includes(key) ||
                    key.startsWith('/scam-alerts')
                );
            };
        if (type === 'spot')
            return (query: Query) => {
                const key = query.queryKey[0];
                if (typeof key !== 'string') return false;
                return (
                    [
                        'spots',
                        'spots-infinite',
                        'spot',
                        'spot-by-slug',
                        'spot-search',
                        'user-spots-infinite',
                        'spots-nearby',
                    ].includes(key) || key.startsWith('/spots')
                );
            };
        return () => false;
    };

    const updateItem = (target: Voteable, item: VoteableItem): Voteable => {
        if (target.id !== item.id) return target;
        const isRemoving = !!item.hasVoted;

        const nextState: Partial<Voteable> = {
            hasVoted: !isRemoving,
            voteId: isRemoving ? null : 'temp-id',
        } as Partial<Voteable>;

        // Ensure we update 'voteCount' at the top level if it exists
        if ('voteCount' in target) {
            const currentCount = (target as { voteCount?: number }).voteCount ?? 0;
            nextState.voteCount = Math.max(0, currentCount + (isRemoving ? -1 : 1));
        }

        // Support for SpotWithStatsResponseDto which uses _count.votes
        // Also supports generic objects where counts are in _count
        if (
            '_count' in target &&
            target._count &&
            typeof target._count === 'object'
        ) {
            const countObj = target._count as Record<string, unknown>;
            const nextCountState = { ...countObj };

            // Update 'votes' if it exists
            if ('votes' in countObj && typeof countObj.votes === 'number') {
                nextCountState.votes = Math.max(0, countObj.votes + (isRemoving ? -1 : 1));
            }
            
            // Update 'voteCount' if it exists inside _count (backend variation)
            if ('voteCount' in countObj && typeof countObj.voteCount === 'number') {
                nextCountState.voteCount = Math.max(0, countObj.voteCount + (isRemoving ? -1 : 1));
            }

            return {
                ...target,
                ...nextState,
                _count: nextCountState,
            } as Voteable;
        }

        return { ...target, ...nextState } as Voteable;
    };

    const getPageItems = (page: unknown): Voteable[] => {
        // Handle TanStack Query InfiniteData page structure
        const pageData = page && typeof page === 'object' && 'data' in page ? page.data : page;

        // Try PaginatedDto structure first: { data: items[], pagination: ... }
        const paginatedDto = pageData as { data?: Voteable[] };
        if (paginatedDto?.data && Array.isArray(paginatedDto.data)) {
            return paginatedDto.data;
        }
        // Fallback: direct array
        if (Array.isArray(pageData)) return pageData;
        return [];
    };

    const setPageItems = (page: unknown, items: Voteable[]): unknown => {
        // Match the structure we found in getPageItems
        const isWrapped = page && typeof page === 'object' && 'data' in page;
        const pageData = isWrapped ? (page as { data: unknown }).data : page;

        const paginatedDto = pageData as { data?: Voteable[]; pagination?: unknown };
        let updatedData: unknown;

        if (paginatedDto?.data && Array.isArray(paginatedDto.data)) {
            updatedData = {
                ...paginatedDto,
                data: items,
            };
        } else {
            updatedData = items;
        }

        return isWrapped ? { ...page, data: updatedData } : updatedData;
    };

    const applyUpdate = (
        old: CacheFormat | CacheFormat[] | undefined,
        item: VoteableItem,
    ): CacheFormat | CacheFormat[] | undefined => {
        if (!old) return old;

        if (Array.isArray(old)) {
            return old.map((t) =>
                'id' in t && typeof t.id === 'string' ? updateItem(t as Voteable, item) : t,
            );
        }

        if ('pages' in old && Array.isArray(old.pages)) {
            return {
                ...old,
                pages: old.pages.map((page) =>
                    setPageItems(
                        page,
                        getPageItems(page).map((t) => updateItem(t, item)),
                    ),
                ),
            } as CacheFormat;
        }

        if ('data' in old && Array.isArray(old.data)) {
            return { ...old, data: (old.data as Voteable[]).map((t) => updateItem(t, item)) };
        }

        if ('data' in old && !Array.isArray(old.data)) {
            const data = old.data as Voteable;
            if ('id' in data && typeof data.id === 'string') {
                return { ...old, data: updateItem(data, item) };
            }
        }

        if ('id' in old && typeof old.id === 'string') {
            return updateItem(old as Voteable, item);
        }

        return old;
    };

    const findItemInCache = (
        data: CacheFormat | CacheFormat[] | undefined,
        itemId: string,
    ): Voteable | null => {
        if (!data) return null;

        if (Array.isArray(data)) {
            return (data.find((t) => 'id' in t && t.id === itemId) as Voteable) ?? null;
        }

        if ('pages' in data && Array.isArray(data.pages)) {
            for (const page of data.pages) {
                const found = getPageItems(page).find((t) => t.id === itemId);
                if (found) return found;
            }
            return null;
        }

        if ('data' in data && Array.isArray(data.data)) {
            return (data.data as Voteable[]).find((t) => t.id === itemId) ?? null;
        }

        if ('data' in data && data.data) {
            const single = data.data as Voteable;
            return single.id === itemId ? single : null;
        }

        if ('id' in data && data.id === itemId) {
            return data as Voteable;
        }

        return null;
    };

    const setItemState = (
        oldData: CacheFormat | CacheFormat[] | undefined,
        itemId: string,
        newState: Partial<VoteableItem>,
    ): CacheFormat | CacheFormat[] | undefined => {
        if (!oldData) return oldData;

        const updateTarget = (target: Voteable): Voteable => {
            if (target.id !== itemId) return target;
            return { ...target, ...newState } as Voteable;
        };

        if (Array.isArray(oldData)) {
            return oldData.map((t) =>
                'id' in t && typeof t.id === 'string' ? updateTarget(t as Voteable) : t,
            );
        }

        if ('pages' in oldData && Array.isArray(oldData.pages)) {
            return {
                ...oldData,
                pages: oldData.pages.map((page) =>
                    setPageItems(page, getPageItems(page).map(updateTarget)),
                ),
            } as CacheFormat;
        }

        if ('data' in oldData && Array.isArray(oldData.data)) {
            return { ...oldData, data: (oldData.data as Voteable[]).map(updateTarget) };
        }

        if ('data' in oldData && !Array.isArray(oldData.data)) {
            const single = oldData.data as Voteable;
            if ('id' in single && typeof single.id === 'string') {
                return { ...oldData, data: updateTarget(single) };
            }
        }

        if ('id' in oldData && typeof oldData.id === 'string') {
            return updateTarget(oldData as Voteable);
        }

        return oldData;
    };

    const toggleVote = async (item: VoteableItem): Promise<{ voteId: string | null }> => {
        const predicate = getQueryPredicate();

        // Snapshot all matching queries
        const snapshots = queryClient.getQueriesData<CacheFormat | CacheFormat[]>({
            predicate,
        });

        // Get current voteId from cache (in case item passed in is stale)
        let currentVoteId = typeof item.voteId === 'string' ? item.voteId : null;
        for (const [, data] of snapshots) {
            const found = findItemInCache(data, item.id);
            if (found && 'voteId' in found) {
                const voteId = (found as Partial<Voteable>).voteId;
                if (voteId && typeof voteId === 'string' && voteId !== 'temp-id') {
                    currentVoteId = voteId;
                    break;
                }
            }
        }

        // Optimistically update all matching queries
        queryClient.setQueriesData<CacheFormat | CacheFormat[]>({ predicate }, (old) =>
            applyUpdate(old, item),
        );

        try {
            if (item.hasVoted && currentVoteId && currentVoteId !== 'temp-id') {
                await deleteVote.mutateAsync({ voteId: currentVoteId, type });
                // After successful delete, set state directly (not toggle)
                queryClient.setQueriesData<CacheFormat | CacheFormat[]>({ predicate }, (old) =>
                    setItemState(old, item.id, { hasVoted: false, voteId: null }),
                );
                return { voteId: null };
            } else {
                const response = await createVote.mutateAsync({
                    targetId: item.id,
                    type,
                });
                // After successful create, set state directly (not toggle)
                const newVoteId = extractVoteId(response);

                queryClient.setQueriesData<CacheFormat | CacheFormat[]>({ predicate }, (old) =>
                    setItemState(old, item.id, {
                        hasVoted: true,
                        voteId: newVoteId ?? undefined,
                    }),
                );
                return { voteId: newVoteId };
            }
        } catch (err: unknown) {
            // Rollback all snapshots on error
            snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));

            const error = err as { response?: { data?: UnauthorizedErrorDto; status?: number } };
            const isUnauthorized = error.response?.status === 401;

            toast.error(
                isUnauthorized ? 'Please join us first to like this!' : 'Failed to update vote',
            );

            return { voteId: item.voteId ?? null };
        }
    };

    return {
        toggleVote,
        isPending: createVote.isPending || deleteVote.isPending,
    };
}
