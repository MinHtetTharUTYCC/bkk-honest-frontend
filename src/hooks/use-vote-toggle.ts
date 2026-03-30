'use client';

import { useCreateVote, useDeleteVote } from '@/hooks/api';
import { Query, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
    CommunityTipResponseDto,
    ScamAlertResponseDto,
    GalleryImageResponseDto,
    SpotWithStatsResponseDto,
    CommentResponseDto,
    LiveVibeDto,
    PriceReportDto,
} from '@/api/generated/model';

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
    voteId?: string | Record<string, unknown> | null;
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
    | { pages?: Array<PaginatedPage<T> | { data?: T[] }>; [key: string]: unknown };

type VoteCreateResponse = {
    data?: { voteId?: string };
    voteId?: string;
};

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
                    key.startsWith('/gallery/spot/');
                return (
                    isGallery &&
                    (!spotId ||
                        query.queryKey.some((k) => k === spotId) ||
                        key.includes(spotId || ''))
                );
            };
        if (type === 'tip')
            return (query: Query) => {
                const key = query.queryKey[0];
                if (typeof key !== 'string') return false;
                const isTips =
                    key === 'tips' ||
                    key === 'tips-infinite' ||
                    key.startsWith('/community-tips/spot/');
                return (
                    isTips &&
                    (!spotId ||
                        query.queryKey.some((k) => k === spotId) ||
                        key.includes(spotId || ''))
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

        if ('voteCount' in target && typeof target.voteCount === 'number') {
            return {
                ...target,
                ...nextState,
                voteCount: Math.max(0, target.voteCount + (isRemoving ? -1 : 1)),
            } as Voteable;
        }

        return { ...target, ...nextState } as Voteable;
    };

    const applyUpdate = (
        old: CacheFormat | CacheFormat[] | undefined,
        item: VoteableItem,
    ): CacheFormat | CacheFormat[] | undefined => {
        if (!old) return old;
        if (Array.isArray(old))
            return old.map((t) => {
                if ('id' in t && typeof t.id === 'string') {
                    return updateItem(t as Voteable, item);
                }
                return t;
            });

        // Handle paginated/infinite query format with pages
        if ('pages' in old && Array.isArray(old.pages)) {
            return {
                ...old,
                pages: (old.pages as Array<PaginatedPage<Voteable> | { data?: Voteable[] }>).map(
                    (page) => {
                        if (!page || typeof page !== 'object') return page;
                        const pageData = page as PaginatedPage<Voteable> | { data?: Voteable[] };
                        if (!Array.isArray(pageData.data)) return page;
                        return {
                            ...page,
                            data: pageData.data.map((t) => updateItem(t, item)),
                        };
                    },
                ),
            };
        }

        // Handle wrapped response format { data: item }
        if ('data' in old && !Array.isArray(old.data)) {
            const data = old.data as Voteable;
            if ('id' in data && typeof data.id === 'string') {
                return { ...old, data: updateItem(data, item) };
            }
        }

        // Handle wrapped array format { data: [] }
        if ('data' in old && Array.isArray(old.data)) {
            return {
                ...old,
                data: (old.data as Voteable[]).map((t) => updateItem(t, item)),
            };
        }

        // Single item case
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

        // Array of items
        if (Array.isArray(data)) {
            for (const item of data) {
                if (item && 'id' in item && item.id === itemId) {
                    return item as Voteable;
                }
            }
            return null;
        }

        // Paginated/infinite query format
        if ('pages' in data && Array.isArray(data.pages)) {
            for (const page of data.pages as Array<
                PaginatedPage<Voteable> | { data?: Voteable[] }
            >) {
                if (!page || typeof page !== 'object') continue;
                const pageData = page as PaginatedPage<Voteable> | { data?: Voteable[] };
                if (!Array.isArray(pageData.data)) continue;
                const found = pageData.data.find((t) => t.id === itemId);
                if (found) return found;
            }
        }

        // Wrapped response format { data: item } or { data: [] }
        if ('data' in data && data.data) {
            if (Array.isArray(data.data)) {
                return (data.data as Voteable[]).find((t) => t.id === itemId) || null;
            }
            const singleData = data.data as Voteable;
            return singleData.id === itemId ? singleData : null;
        }

        // Single item case
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
            const updated = { ...target, ...newState } as Partial<Voteable>;
            return updated as Voteable;
        };

        // Array of items
        if (Array.isArray(oldData)) {
            return oldData.map((item) => {
                if (item && 'id' in item && typeof item.id === 'string') {
                    return updateTarget(item as Voteable);
                }
                return item;
            });
        }

        // Paginated/infinite query format
        if ('pages' in oldData && Array.isArray(oldData.pages)) {
            return {
                ...oldData,
                pages: (
                    oldData.pages as Array<PaginatedPage<Voteable> | { data?: Voteable[] }>
                ).map((page) => {
                    if (!page || typeof page !== 'object') return page;
                    const pageData = page as PaginatedPage<Voteable> | { data?: Voteable[] };
                    if (!Array.isArray(pageData.data)) return page;
                    return {
                        ...page,
                        data: pageData.data.map(updateTarget),
                    };
                }),
            };
        }

        // Wrapped array format { data: [] }
        if ('data' in oldData && Array.isArray(oldData.data)) {
            return {
                ...oldData,
                data: (oldData.data as Voteable[]).map(updateTarget),
            };
        }

        // Wrapped single item format { data: item }
        if ('data' in oldData && oldData.data && !Array.isArray(oldData.data)) {
            const singleData = oldData.data as Voteable;
            return { ...oldData, data: updateTarget(singleData) };
        }

        // Single item case
        if ('id' in oldData && typeof oldData.id === 'string') {
            return updateTarget(oldData as Voteable);
        }

        return oldData;
    };

    const toggleVote = async (item: VoteableItem): Promise<{ voteId: string | null }> => {
        const predicate = getQueryPredicate();

        // Snapshot all matching queries
        const snapshots = queryClient.getQueriesData<CacheFormat | CacheFormat[]>({ predicate });

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
                const response = await createVote.mutateAsync({ targetId: item.id, type });
                // After successful create, set state directly (not toggle)
                const voteResponse = response as VoteCreateResponse;
                const newVoteId = voteResponse.data?.voteId ?? voteResponse.voteId ?? null;
                queryClient.setQueriesData<CacheFormat | CacheFormat[]>({ predicate }, (old) =>
                    setItemState(old, item.id, { hasVoted: true, voteId: newVoteId ?? undefined }),
                );
                return { voteId: newVoteId };
            }
        } catch (error) {
            // Rollback all snapshots on error
            snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));

            if ((error as { response?: { status?: number } })?.response?.status === 401) {
                toast.error('Please join us first to like this!');
            } else {
                toast.error('Failed to update vote');
            }
            return { voteId: typeof item.voteId === 'string' ? item.voteId : null };
        }
    };

    return {
        toggleVote,
        isPending: createVote.isPending || deleteVote.isPending,
    };
}
