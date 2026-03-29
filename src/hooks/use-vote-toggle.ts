'use client';

import { useCreateVote, useDeleteVote } from '@/hooks/api';
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
    if (type === 'image') return (query: Query) => {
      const key = query.queryKey[0];
      if (typeof key !== 'string') return false;
      const isGallery = key === 'gallery' || key === 'gallery-infinite' || key.startsWith('/gallery/spot/');
      return isGallery && (!spotId || query.queryKey.some(k => k === spotId) || key.includes(spotId || ''));
    };
    if (type === 'tip') return (query: Query) => {
      const key = query.queryKey[0];
      if (typeof key !== 'string') return false;
      const isTips = key === 'tips' || key === 'tips-infinite' || key.startsWith('/community-tips/spot/');
      return isTips && (!spotId || query.queryKey.some(k => k === spotId) || key.includes(spotId || ''));
    };
    if (type === 'alert') return (query: Query) => {
      const key = query.queryKey[0];
      if (typeof key !== 'string') return false;
      return ['scam-alerts', 'scam-alerts-infinite', 'scam-alert'].includes(key) || key.startsWith('/scam-alerts');
    };
    if (type === 'spot') return (query: Query) => {
      const key = query.queryKey[0];
      if (typeof key !== 'string') return false;
      return ['spots', 'spots-infinite', 'spot', 'spot-search', 'user-spots-infinite', 'spots-nearby'].includes(key) || key.startsWith('/spots');
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

  const applyUpdate = (old: any, item: VoteableItem): any => {
    if (!old) return old;
    if (Array.isArray(old)) return old.map(t => updateItem(t, item));
    if (old.pages) {
      return {
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          data: page.data?.map((t: any) => updateItem(t, item)) ?? [] })) };
    }
    if (old.data) {
      if (Array.isArray(old.data)) {
        return { ...old, data: old.data.map((t: any) => updateItem(t, item)) };
      }
      return { ...old, data: updateItem(old.data, item) };
    }
    
    // Single item case (e.g., spot detail query)
    return updateItem(old, item);
  };

  const findItemInCache = (data: any, itemId: string): CacheNode | null => {
    if (!data) return null;
    if (Array.isArray(data)) return data.find((t: any) => t.id === itemId) || null;
    if (data.pages) {
      for (const page of data.pages) {
        const items = page.data || page;
        if (Array.isArray(items)) {
          const found = items.find((t: any) => t.id === itemId);
          if (found) return found;
        }
      }
    }
    if (data.data) {
      if (Array.isArray(data.data)) {
        return data.data.find((t: any) => t.id === itemId) || null;
      }
      return data.data.id === itemId ? data.data : null;
    }
    
    // Single item case
    return data.id === itemId ? data : null;
  };

  const setItemState = (oldData: any, itemId: string, newState: Partial<VoteableItem>) => {
    if (!oldData) return oldData;
    const updateTarget = (target: any) => target.id === itemId ? { ...target, ...newState } : target;
    if (Array.isArray(oldData)) return oldData.map(updateTarget);
    if (oldData.pages) {
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          data: page.data?.map(updateTarget) ?? [] })) };
    }
    if (oldData.data) {
      if (Array.isArray(oldData.data)) {
        return { ...oldData, data: oldData.data.map(updateTarget) };
      }
      return { ...oldData, data: updateTarget(oldData.data) };
    }
    
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
