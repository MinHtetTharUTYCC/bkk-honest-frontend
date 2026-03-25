'use client';

import { useCreateVote, useDeleteVote } from './use-api';
import { Query, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';


interface VoteableItem {
  id: string;
  hasVoted?: boolean;
  voteId?: string | null;
  _count?: {
    votes: number;
  };
}

type CacheNode = {
  id?: string;
  data?: CacheNode[];
  pages?: Array<{ data?: CacheNode[] }>;
  queryKey?: unknown[];
  _count?: { votes?: number };
  hasVoted?: boolean;
  voteId?: string | null;
};

export function useVoteToggle(type: 'tip' | 'alert' | 'image' | 'spot', spotId?: string) {
  const createVote = useCreateVote();
  const deleteVote = useDeleteVote();
  const queryClient = useQueryClient();

  const getQueryPredicate = () => {
    if (type === 'image') return (query: Query) => (query.queryKey[0] === 'gallery' || query.queryKey[0] === 'gallery-infinite') && (!spotId || query.queryKey[1] === spotId);
    if (type === 'tip') return (query: Query) => (query.queryKey[0] === 'tips' || query.queryKey[0] === 'tips-infinite') && (!spotId || query.queryKey[1] === spotId);
    if (type === 'alert') return (query: Query) => {
      const key = query.queryKey[0];
      return typeof key === 'string' && ['scam-alerts', 'scam-alerts-infinite', 'scam-alert'].includes(key);
    };
    if (type === 'spot') return (query: Query) => {
      const key = query.queryKey[0];
      return typeof key === 'string' && ['spots', 'spots-infinite', 'spot', 'spot-search', 'user-spots-infinite', 'spots-nearby'].includes(key);
    };
    return () => false;
  };

  const updateItem = (target: CacheNode, item: VoteableItem): CacheNode => {
    if (target.id !== item.id) return target;
    const isRemoving = !!item.hasVoted;
    return {
      ...target,
      hasVoted: !isRemoving,
      voteId: isRemoving ? null : 'temp-id',
      _count: {
        ...target._count,
        votes: Math.max(0, (target._count?.votes || 0) + (isRemoving ? -1 : 1)) } };
  };

  const applyUpdate = (old: CacheNode | CacheNode[] | undefined, item: VoteableItem) => {
    if (!old) return old;
    if (Array.isArray(old)) return old.map(t => updateItem(t, item));
    if (old.pages) {
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data?.map((t) => updateItem(t, item)) ?? [] })) };
    }
    if (old.data && Array.isArray(old.data)) return { ...old, data: old.data.map(t => updateItem(t, item)) };
    
    // Single item case (e.g., spot detail query)
    return updateItem(old, item);
  };

  const findItemInCache = (data: CacheNode | CacheNode[] | null | undefined, itemId: string): CacheNode | null => {
    if (!data) return null;
    if (Array.isArray(data)) return data.find((t) => t.id === itemId) || null;
    if (data.pages) {
      for (const page of data.pages) {
        const items = page.data || page;
        if (Array.isArray(items)) {
          const found = items.find((t) => t.id === itemId);
          if (found) return found;
        }
      }
    }
    if (data.data && Array.isArray(data.data)) return data.data.find((t) => t.id === itemId) || null;
    
    // Single item case
    return data.id === itemId ? data : null;
  };

  const setItemState = (oldData: CacheNode | CacheNode[] | undefined, itemId: string, newState: Partial<VoteableItem>) => {
    if (!oldData) return oldData;
    const updateTarget = (target: CacheNode) => target.id === itemId ? { ...target, ...newState } : target;
    if (Array.isArray(oldData)) return oldData.map(updateTarget);
    if (oldData.pages) {
      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          data: page.data?.map(updateTarget) ?? [] })) };
    }
    if (oldData.data && Array.isArray(oldData.data)) return { ...oldData, data: oldData.data.map(updateTarget) };
    
    // Single item case
    return updateTarget(oldData);
  };

  const toggleVote = async (item: VoteableItem): Promise<{ voteId: string | null }> => {
    const predicate = getQueryPredicate();

    // Snapshot all matching queries
    const snapshots = queryClient.getQueriesData<CacheNode | CacheNode[]>({ predicate });

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
    queryClient.setQueriesData<CacheNode | CacheNode[]>({ predicate }, (old) => applyUpdate(old, item));

    try {
      if (item.hasVoted && currentVoteId && currentVoteId !== 'temp-id') {
        await deleteVote.mutateAsync({ voteId: currentVoteId, type });
        // After successful delete, set state directly (not toggle)
        queryClient.setQueriesData<CacheNode | CacheNode[]>({ predicate }, (old) => 
          setItemState(old, item.id, { hasVoted: false, voteId: null })
        );
        return { voteId: null };
      } else {
        const response = await createVote.mutateAsync({ targetId: item.id, type });
        // After successful create, set state directly (not toggle)
        queryClient.setQueriesData<CacheNode | CacheNode[]>({ predicate }, (old) =>
          setItemState(old, item.id, { hasVoted: true, voteId: response.voteId })
        );
        return { voteId: response.voteId };
      }
    } catch (error) {
      // Rollback all snapshots on error
      snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
      
      if ((error as { response?: { status?: number } })?.response?.status === 401) {
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
