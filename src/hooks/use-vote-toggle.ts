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

export function useVoteToggle(type: 'tip' | 'alert' | 'image', spotId?: string) {
  const createVote = useCreateVote();
  const deleteVote = useDeleteVote();
  const queryClient = useQueryClient();

  const getQueryKeyPrefix = () => {
    if (type === 'image' && spotId) return ['gallery-infinite', spotId];
    if (type === 'tip' && spotId) return ['tips-infinite', spotId];
    if (type === 'alert') return ['scam-alerts'];
    return null;
  };

  const updateItem = (target: any, item: VoteableItem) => {
    if (target.id !== item.id) return target;
    const isRemoving = !!item.hasVoted;
    return {
      ...target,
      hasVoted: !isRemoving,
      voteId: isRemoving ? null : 'temp-id',
      _count: {
        ...target._count,
        votes: (target._count?.votes || 0) + (isRemoving ? -1 : 1),
      },
    };
  };

  const applyUpdate = (old: any, item: VoteableItem): any => {
    if (!old) return old;
    if (Array.isArray(old)) return old.map(t => updateItem(t, item));
    if (old.pages) {
      return {
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          data: page.data?.map((t: any) => updateItem(t, item)) ?? page.map?.((t: any) => updateItem(t, item)),
        })),
      };
    }
    if (old.data) return { ...old, data: old.data.map((t: any) => updateItem(t, item)) };
    return old;
  };

  const toggleVote = async (item: VoteableItem) => {
    const keyPrefix = getQueryKeyPrefix();
    if (!keyPrefix) return;

    // Snapshot all matching queries (handles parameterized keys like ['scam-alerts', {cityId}])
    const snapshots = queryClient.getQueriesData<any>({ queryKey: keyPrefix });

    // Optimistically update all matching queries
    queryClient.setQueriesData<any>({ queryKey: keyPrefix }, (old: any) => applyUpdate(old, item));

    try {
      if (item.hasVoted && item.voteId) {
        await deleteVote.mutateAsync({ voteId: item.voteId, type });
      } else {
        await createVote.mutateAsync({ targetId: item.id, type });
      }
    } catch (error) {
      // Rollback all snapshots on error
      snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error('Failed to update vote');
    } finally {
      // Refresh to get actual DB state (real voteId, counts)
      queryClient.invalidateQueries({ queryKey: keyPrefix });
      if (type === 'image' && spotId) queryClient.invalidateQueries({ queryKey: ['gallery', spotId] });
      if (type === 'tip' && spotId) queryClient.invalidateQueries({ queryKey: ['tips', spotId] });
    }
  };

  return {
    toggleVote,
    isPending: createVote.isPending || deleteVote.isPending,
  };
}
