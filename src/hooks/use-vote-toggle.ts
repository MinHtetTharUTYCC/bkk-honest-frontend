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

  const getQueryKey = () => {
    if (type === 'image' && spotId) return ['gallery-infinite', spotId];
    if (type === 'tip' && spotId) return ['tips-infinite', spotId];
    if (type === 'alert') return ['scam-alerts'];
    return null;
  };

  const toggleVote = async (item: VoteableItem) => {
    const queryKey = getQueryKey();
    if (!queryKey) return;

    // Snapshot of previous state
    const previousData = queryClient.getQueryData(queryKey);

    // Optimistically update
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;

      const updateItem = (target: any) => {
        if (target.id === item.id) {
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
        }
        return target;
      };

      // Handle both flat arrays and infinite query structures
      if (Array.isArray(old)) {
        return old.map(updateItem);
      } else if (old.pages) {
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data?.map(updateItem) || page.map(updateItem),
          })),
        };
      } else if (old.data) {
        return {
          ...old,
          data: old.data.map(updateItem),
        };
      }
      return old;
    });

    try {
      if (item.hasVoted && item.voteId) {
        await deleteVote.mutateAsync({ voteId: item.voteId, type });
      } else {
        await createVote.mutateAsync({ targetId: item.id, type });
      }
    } catch (error) {
      // Rollback on error
      queryClient.setQueryData(queryKey, previousData);
      toast.error('Failed to update vote');
    } finally {
      // Refresh to get actual DB state (IDs, counts)
      queryClient.invalidateQueries({ queryKey });
      if (type === 'image' && spotId) queryClient.invalidateQueries({ queryKey: ['gallery', spotId] });
      if (type === 'tip' && spotId) queryClient.invalidateQueries({ queryKey: ['tips', spotId] });
    }
  };

  return {
    toggleVote,
    isPending: createVote.isPending || deleteVote.isPending,
  };
}
