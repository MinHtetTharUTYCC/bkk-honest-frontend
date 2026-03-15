'use client';

import { useState } from 'react';
import { MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LikeButton } from '@/components/ui/like-button';
import { TipActionsMenu } from './tip-actions-menu';
import Link from 'next/link';

interface TipCardProps {
  tip: any;
  authUser?: any;
  onCommentClick: () => void;
  onVoteClick: (tip: any) => Promise<any>;
  onEditClick: () => void;
  onDeleteClick: () => Promise<void>;
  isVotePending?: boolean;
}

export function TipCard({
  tip,
  authUser,
  onCommentClick,
  onVoteClick,
  onEditClick,
  onDeleteClick,
  isVotePending = false,
}: TipCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const isOwner = authUser?.id === tip.userId;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this tip?')) return;
    setIsDeleting(true);
    try {
      await onDeleteClick();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border p-6 md:p-8 space-y-6 transition-all',
        tip.type === 'AVOID'
          ? 'bg-red-500/10 border-red-500/20'
          : 'bg-emerald-500/10 border-emerald-500/20'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 flex-1 min-w-0">
          <Link
            href={`/profile/${tip.userId}`}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-border shrink-0 overflow-hidden hover:border-amber-400 transition-colors"
          >
            {tip.user?.avatarUrl ? (
              <img
                src={tip.user.avatarUrl}
                alt={tip.user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/40">
                <User size={20} />
              </div>
            )}
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/profile/${tip.userId}`}
                className="font-bold text-white text-sm md:text-base truncate hover:text-amber-400 transition-colors"
              >
                {tip.user?.name || 'Local'}
              </Link>
              {tip.user?.level && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-semibold shrink-0',
                    tip.type === 'AVOID'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  )}
                >
                  Lvl {tip.user.level === 'LOCAL_GURU' ? '3' : tip.user.level === 'EXPLORER' ? '2' : '1'}
                </span>
              )}
            </div>
            <p className="text-[10px] md:text-xs font-medium text-white/40 mt-1">
              {new Date(tip.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <TipActionsMenu
            tipId={tip.id}
            isOwner={isOwner}
            onEdit={onEditClick}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h4 className="text-base md:text-lg font-bold text-white leading-tight">
          {tip.title}
        </h4>
        <p className="text-sm md:text-base font-normal text-white/70 leading-relaxed">
          {tip.description}
        </p>
      </div>

      {/* Desktop Actions - Horizontal Layout */}
      <div className="hidden md:flex items-center gap-4">
        <button
          onClick={onCommentClick}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/8 hover:bg-white/12 text-white text-sm font-medium transition-colors active:scale-95"
          title="View comments"
        >
          <MessageSquare size={16} />
          <span>{tip._count?.comments || 0}</span>
        </button>

        <LikeButton
          count={tip._count?.votes || 0}
          isVoted={tip.hasVoted}
          onVote={() => onVoteClick(tip)}
          isPending={isVotePending || isDeleting}
          disabled={isDeleting}
          variant="default"
          size="md"
          title={tip.hasVoted ? 'Unlike this tip' : 'Like this tip'}
        />
      </div>

      {/* Mobile Actions - Vertical Layout (Below Content) */}
      <div className="md:hidden flex gap-3 pt-4 border-t border-white/10">
        <button
          onClick={onCommentClick}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-white/8 hover:bg-white/12 text-white text-xs font-medium transition-colors active:scale-95"
          title="View comments"
        >
          <MessageSquare size={14} />
          <span>{tip._count?.comments || 0}</span>
        </button>

        <div className="flex-1">
          <LikeButton
            count={tip._count?.votes || 0}
            isVoted={tip.hasVoted}
            onVote={() => onVoteClick(tip)}
            isPending={isVotePending || isDeleting}
            disabled={isDeleting}
            variant="default"
            size="sm"
            className="w-full justify-center"
            title={tip.hasVoted ? 'Unlike this tip' : 'Like this tip'}
          />
        </div>
      </div>
    </div>
  );
}
