'use client';

import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useCommentReaction } from '@/hooks/use-comment-reactions';

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

  // Sync with props when they change (e.g. after refetch)
  useEffect(() => {
    setCount(initialCount);
    setUserReacted(initialUserReacted);
  }, [initialCount, initialUserReacted]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors group"
      title={userReacted ? 'Unlike this comment' : 'Like this comment'}
    >
      <Heart
        size={16}
        className={`transition-all duration-200 ${
          userReacted
            ? 'fill-red-500 text-red-500'
            : 'text-white/60 group-hover:text-red-500'
        }`}
      />
      <span
        className={`text-sm font-medium ${
          userReacted ? 'text-red-500' : 'text-white/60'
        }`}
      >
        {userReacted ? count : count}
      </span>
    </button>
  );
}
