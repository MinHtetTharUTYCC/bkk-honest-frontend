'use client';

import { useCreateVote, useDeleteVote } from './use-api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';


interface VoteableItem {
  id: string;
  hasVoted?: boolean;
  voteId?: string | null;
  _count?: {
    votes: number;
  };
}

export function useVoteToggle(type: 'tip' | 'alert' | 'image' | 'spot', spotId?: string) {
  const createVote = useCreateVote();
  const deleteVote = useDeleteVote();
  const queryClient = useQueryClient();

  const getQueryPredicate = () => {
    if (type === 'image') return (query: unknown) => (query.queryKey[0] === 'gallery' || query.queryKey[0] === 'gallery-infinite') && (!spotId || query.queryKey[1] === spotId);
    if (type === 'tip') return (query: unknown) => (query.queryKey[0] === 'tips' || query.queryKey[0] === 'tips-infinite') && (!spotId || query.queryKey[1] === spotId);
    if (type === 'alert') return (query: unknown) => ['scam-alerts', 'scam-alerts-infinite', 'scam-alert'].includes(query.queryKey[0]?.toString());
    if (type === 'spot') return (query: unknown) => {
      const key = query.queryKey[0]?.toString();
      return ['spots', 'spots-infinite', 'spot', 'spot-search', 'user-spots-infinite', 'spots-nearby'].includes(key);
    };
    return () => false;
  };

  const updateItem = (target: unknown, item: VoteableItem) => {
    if (target.id !== item.id) return target;
    const isRemoving = !!item.hasVoted;
    return {
      ...target,
      hasVoted: !isRemoving,
      voteId: isRemoving ? null : 'temp-id',
      _count: {
        ...target._count,
        votes: (target._count?.votes || 0) + (isRemoving ? -1 : 1) } };
  };

  const applyUpdate = (old: unknown, item: VoteableItem): unknown => {
    if (!old) return old;
    if (Array.isArray(old)) return old.map(t => updateItem(t, item));
    if (old.pages) {
      return {
        ...old,
        pages: old.pages.map((page: unknown) => ({
          ...page,
          data: page.data?.map((t: unknown) => updateItem(t, item)) ?? page.map?.((t: unknown) => updateItem(t, item)) })) };
    }
    if (old.data) return { ...old, data: old.data.map((t: unknown) => updateItem(t, item)) };
    return old;
  };

  const findItemInCache = (data: unknown, itemId: string): unknown => {
    if (!data) return null;
    if (Array.isArray(data)) return data.find((t: unknown) => t.id === itemId);
    if (data.pages) {
      for (const page of data.pages) {
        const items = page.data || page;
        if (Array.isArray(items)) {
          const found = items.find((t: unknown) => t.id === itemId);
          if (found) return found;
        }
      }
    }
    if (data.data) return data.data.find((t: unknown) => t.id === itemId);
    return null;
  };

  const setItemState = (oldData: unknown, itemId: string, newState: unknown): unknown => {
    if (!oldData) return oldData;
    const updateTarget = (target: unknown) => target.id === itemId ? { ...target, ...newState } : target;
    if (Array.isArray(oldData)) return oldData.map(updateTarget);
    if (oldData.pages) {
      return {
        ...oldData,
        pages: oldData.pages.map((page: unknown) => ({
          ...page,
          data: page.data?.map(updateTarget) ?? page.map?.(updateTarget) })) };
    }
    if (oldData.data) return { ...oldData, data: oldData.data.map(updateTarget) };
    return oldData;
  };

  const toggleVote = async (item: VoteableItem): Promise<{ voteId: string | null }> => {
    const predicate = getQueryPredicate();

    // Snapshot all matching queries
    const snapshots = queryClient.getQueriesData<unknown>({ predicate });

    // Get current voteId from cache (in case item passed in is stale)
    let currentVoteId = item.voteId;
    for (const [, data] of snapshots) {
      const found = findItemInCache(data, item.id);
      if (found?.voteId && found.voteId !== 'temp-id') {
        currentVoteId = found.voteId;
        break;
      }
    }

    // Optimistically update all matching queries
    queryClient.setQueriesData<unknown>({ predicate }, (old: unknown) => applyUpdate(old, item));

    try {
      if (item.hasVoted && currentVoteId && currentVoteId !== 'temp-id') {
        await deleteVote.mutateAsync({ voteId: currentVoteId, type: type === 'spot' ? 'image' : (type as unknown) });
        // After successful delete, set state directly (not toggle)
        queryClient.setQueriesData<unknown>({ predicate }, (old: unknown) => 
          setItemState(old, item.id, { hasVoted: false, voteId: null })
        );
        return { voteId: null };
      } else {
        const response = await createVote.mutateAsync({ targetId: item.id, type });
        // After successful create, set state directly (not toggle)
        queryClient.setQueriesData<unknown>({ predicate }, (old: unknown) =>
          setItemState(old, item.id, { hasVoted: true, voteId: response.voteId })
        );
        return { voteId: response.voteId };
      }
    } catch (error: unknown) {
      // Rollback all snapshots on error
      snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
      
      if (error?.response?.status === 401) {
        toast.error('Please join us first to like this!');
      } else {
        toast.error('Failed to update vote');
      }
      return { voteId: item.voteId ?? null };
    }
  };

  return {
    toggleVote,
    isPending: createVote.isPending || deleteVote.isPending };
}
