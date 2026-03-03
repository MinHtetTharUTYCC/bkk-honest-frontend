'use client';

import { useCreateVote, useDeleteVote } from './use-api';
import { useQueryClient } from '@tanstack/react-query';

interface VoteableItem {
  id: string;
  hasVoted?: boolean;
  voteId?: string | null;
}

export function useVoteToggle(type: 'tip' | 'alert' | 'image', spotId?: string) {
  const createVote = useCreateVote();
  const deleteVote = useDeleteVote();
  const queryClient = useQueryClient();

  const toggleVote = async (item: VoteableItem) => {
    if (item.hasVoted && item.voteId) {
      // Unlike
      await deleteVote.mutateAsync({ voteId: item.voteId, type });
    } else {
      // Like
      await createVote.mutateAsync({ targetId: item.id, type });
    }

    // Targeted invalidation to keep the UI snappy
    if (type === 'image' && spotId) {
      queryClient.invalidateQueries({ queryKey: ['gallery', spotId] });
      queryClient.invalidateQueries({ queryKey: ['gallery-infinite', spotId] });
    } else if (type === 'tip' && spotId) {
      queryClient.invalidateQueries({ queryKey: ['tips', spotId] });
      queryClient.invalidateQueries({ queryKey: ['tips-infinite', spotId] });
    } else if (type === 'alert') {
      queryClient.invalidateQueries({ queryKey: ['scam-alerts'] });
    }
  };

  return {
    toggleVote,
    isPending: createVote.isPending || deleteVote.isPending,
  };
}
