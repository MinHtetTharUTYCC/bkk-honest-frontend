'use client';

import { useCreateVote, useDeleteVote } from '@/hooks/api';
import { Query, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { 
  CommunityTipResponseDto, 
  ScamAlertResponseDto, 
  GalleryImageResponseDto, 
  SpotWithStatsResponseDto 
} from '@/api/generated/model';


type VoteableItem = 
  | CommunityTipResponseDto 
  | ScamAlertResponseDto 
  | GalleryImageResponseDto 
  | SpotWithStatsResponseDto;

type CacheData = {
  id?: string;
  data?: CacheData | CacheData[];
  pages?: Array<{ data?: CacheData[] }>;
  _count?: { votes?: number; [key: string]: number | undefined };
  voteCount?: number;
  hasVoted?: boolean;
  voteId?: string | null;
  [key: string]: unknown;
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

  const updateItem = (target: CacheData, item: VoteableItem): CacheData => {
    if (target.id !== item.id) return target;
    const isRemoving = !!item.hasVoted;
    
    const nextState: Partial<CacheData> = {
      hasVoted: !isRemoving,
      voteId: isRemoving ? null : 'temp-id',
    };

    if ('voteCount' in target && typeof target.voteCount === 'number') {
      nextState.voteCount = Math.max(0, target.voteCount + (isRemoving ? -1 : 1));
    } else if (target._count && typeof target._count.votes === 'number') {
      nextState._count = {
        ...target._count,
        votes: Math.max(0, target._count.votes + (isRemoving ? -1 : 1))
      };
    }

    return { ...target, ...nextState };
  };

  const applyUpdate = (old: CacheData | CacheData[] | undefined, item: VoteableItem): CacheData | CacheData[] | undefined => {
    if (!old) return old;
    if (Array.isArray(old)) return old.map(t => updateItem(t, item));
    
    if (old.pages) {
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data?.map((t) => updateItem(t, item)) ?? [] })) };
    }
    
    if (old.data) {
      if (Array.isArray(old.data)) {
        return { ...old, data: old.data.map((t) => updateItem(t, item)) };
      }
      return { ...old, data: updateItem(old.data, item) };
    }
    
    // Single item case (e.g., spot detail query)
    return updateItem(old, item);
  };

  const findItemInCache = (data: CacheData | CacheData[] | undefined, itemId: string): CacheData | null => {
    if (!data) return null;
    if (Array.isArray(data)) return data.find((t) => t.id === itemId) || null;
    if (data.pages) {
      for (const page of data.pages) {
        const items = page.data || page;
        if (Array.isArray(items)) {
          const found = items.find((t) => (t as CacheData).id === itemId);
          if (found) return found as CacheData;
        }
      }
    }
    if (data.data) {
      if (Array.isArray(data.data)) {
        return data.data.find((t) => t.id === itemId) || null;
      }
      return data.data.id === itemId ? data.data : null;
    }
    
    // Single item case
    return data.id === itemId ? data : null;
  };

  const setItemState = (oldData: CacheData | CacheData[] | undefined, itemId: string, newState: Partial<VoteableItem>) => {
    if (!oldData) return oldData;
    const updateTarget = (target: CacheData) => target.id === itemId ? { ...target, ...newState } : target;
    if (Array.isArray(oldData)) return oldData.map(updateTarget);
    if (oldData.pages) {
      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
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
    const snapshots = queryClient.getQueriesData<CacheData | CacheData[]>({ predicate });

    // Get current voteId from cache (in case item passed in is stale)
    let currentVoteId = item.voteId as string | null | undefined;
    for (const [, data] of snapshots) {
      const found = findItemInCache(data, item.id);
      if (found?.voteId && found.voteId !== 'temp-id') {
        currentVoteId = found.voteId;
        break;
      }
    }

    // Optimistically update all matching queries
    queryClient.setQueriesData<CacheData | CacheData[]>({ predicate }, (old) => applyUpdate(old, item));

    try {
      if (item.hasVoted && currentVoteId && currentVoteId !== 'temp-id') {
        await deleteVote.mutateAsync({ voteId: currentVoteId, type });
        // After successful delete, set state directly (not toggle)
        queryClient.setQueriesData<CacheData | CacheData[]>({ predicate }, (old) => 
          setItemState(old, item.id, { hasVoted: false, voteId: undefined })
        );
        return { voteId: null };
      } else {
        const response = await createVote.mutateAsync({ targetId: item.id, type });
        // After successful create, set state directly (not toggle)
        queryClient.setQueriesData<CacheData | CacheData[]>({ predicate }, (old) =>
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
      return { voteId: (item.voteId as string | null) ?? null };
    }
  };

  return {
    toggleVote,
    isPending: createVote.isPending || deleteVote.isPending };
}
