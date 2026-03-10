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

  const handleClick = async () => {
    try {
      setUserReacted(!userReacted);
      setCount((prev) => (userReacted ? prev - 1 : prev + 1));

      await toggleMutation.mutateAsync(commentId);
    } catch (error) {
      // Revert on error
      setUserReacted(initialUserReacted);
      setCount(initialCount);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={toggleMutation.isPending}
      className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/8 hover:bg-white/12 disabled:bg-white/8 disabled:cursor-not-allowed transition-colors group"
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
        {count}
      </span>
      {toggleMutation.isPending && (
        <Loader2 size={14} className="animate-spin" />
      )}
    </button>
  );
}
