'use client';

import { useState, useEffect } from 'react';
import { useCommentReaction } from '@/hooks/use-comment-reactions';
import { LikeButton } from '@/components/ui/like-button';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';

interface ReactionButtonProps {
  commentId: string;
  initialCount?: number;
  initialUserReacted?: boolean;
}

export default function ReactionButton({
  commentId,
  initialCount = 0,
  initialUserReacted = false,
}: ReactionButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [userReacted, setUserReacted] = useState(initialUserReacted);
  const toggleMutation = useCommentReaction();
  const { user } = useAuth();

  // Sync with props when they change (e.g. after refetch)
  useEffect(() => {
    let mounted = true;
    Promise.resolve().then(() => {
      if (mounted) {
        setCount(initialCount);
        setUserReacted(initialUserReacted);
      }
    });
    return () => { mounted = false; };
  }, [initialCount, initialUserReacted]);

  const handleVote = async () => {
    if (!user) {
      toast.error('Please join us first to like this!');
      return;
    }

    // Prevent double-clicking while pending
    if (toggleMutation.isPending) return;

    // Capture current state before change
    const wasReacted = userReacted;
    const currentCount = count;

    try {
      // Step 1: Optimistic Update (Immediate UI change)
      setUserReacted(!wasReacted);
      setCount(prev => wasReacted ? prev - 1 : prev + 1);

      // Step 2: Fire API call
      await toggleMutation.mutateAsync(commentId);
    } catch (error) {
      // Step 3: Rollback on failure
      console.error('Reaction failed:', error);
      setUserReacted(wasReacted);
      setCount(currentCount);
    }
  };

  return (
    <LikeButton
      count={count}
      isVoted={userReacted}
      onVote={handleVote}
      isPending={toggleMutation.isPending}
      variant="compact"
      size="md"
      title={userReacted ? 'Unlike this comment' : 'Like this comment'}
    />
  );
}