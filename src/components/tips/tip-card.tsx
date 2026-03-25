'use client';

import { useState } from 'react';
import { MessageSquare, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LikeButton } from '@/components/ui/like-button';
import { TipActionsMenu } from './tip-actions-menu';
import Link from 'next/link';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface TipCardUser {
  id: string;
  name?: string;
  level?: 'NEWBIE' | 'EXPLORER' | 'LOCAL_GURU' | string;
  avatarUrl?: string | null;
}

interface TipCardItem {
  id: string;
  userId: string;
  type: 'TRY' | 'AVOID' | string;
  title: string;
  description: string;
  hasVoted?: boolean;
  _count?: { votes?: number; comments?: number };
  createdAt?: string;
  user?: TipCardUser;
}

interface TipCardProps {
  tip: TipCardItem;
  authUser?: { id?: string | null } | null;
  onCommentClick: () => void;
  onVoteClick: () => Promise<unknown>;
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
  isVotePending = false }: TipCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isOwner = authUser?.id === tip.userId;
  const createdAtLabel = tip.createdAt
    ? new Date(tip.createdAt).toLocaleDateString()
    : '';
  const handleVote = async () => {
    await onVoteClick();
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteClick();
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border-2 p-6 md:p-8 space-y-6 transition-all relative overflow-hidden bg-white/[0.03]',
        tip.type === 'AVOID'
          ? 'border-red-500/80'
          : 'border-emerald-500/80'
      )}
    >
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your tip.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 relative z-20">
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
                <UserIcon size={20} />
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
              {createdAtLabel}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <TipActionsMenu
            tipId={tip.id}
            isOwner={isOwner}
            onEdit={onEditClick}
            onDelete={() => setShowDeleteDialog(true)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 relative z-10">
        <h4 className="text-base md:text-lg font-bold text-white leading-tight">
          {tip.title}
        </h4>
        <p className="text-sm md:text-base font-normal text-white/70 leading-relaxed">
          {tip.description}
        </p>
      </div>

      {/* Desktop Actions - Horizontal Layout */}
      <div className="hidden md:flex items-center gap-4 relative z-10">
        <button
          onClick={onCommentClick}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-amber-400 text-sm font-medium transition-all duration-200 active:scale-95 group"
          title="View comments"
        >
          <MessageSquare size={16} className="transition-colors duration-200" />
          <span className="transition-colors duration-200">{tip._count?.comments || 0}</span>
        </button>

        <LikeButton
          count={tip._count?.votes || 0}
          isVoted={tip.hasVoted}
          onVote={handleVote}
          isPending={isVotePending || isDeleting}
          disabled={isDeleting}
          variant="default"
          size="md"
          title={tip.hasVoted ? 'Unlike this tip' : 'Like this tip'}
        />
      </div>

      {/* Mobile Actions - Vertical Layout (Below Content) */}
      <div className="md:hidden flex gap-3 pt-4 border-t border-white/10 relative z-10">
        <button
          onClick={onCommentClick}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-amber-400 text-xs font-medium transition-all duration-200 active:scale-95 group"
          title="View comments"
        >
          <MessageSquare size={14} className="transition-colors duration-200" />
          <span className="transition-colors duration-200">{tip._count?.comments || 0}</span>
        </button>

        <div className="flex-1">
          <LikeButton
            count={tip._count?.votes || 0}
            isVoted={tip.hasVoted}
            onVote={handleVote}
            isPending={isVotePending || isDeleting}
            disabled={isDeleting}
            variant="default"
            size="md"
            className="w-full justify-center"
            title={tip.hasVoted ? 'Unlike this tip' : 'Like this tip'}
          />
        </div>
      </div>
    </div>
  );
}
