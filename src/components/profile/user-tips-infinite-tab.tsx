'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useInfiniteUserCommunityTips } from '@/hooks/use-api';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { TipCard } from '@/components/tips/tip-card';
import { useVoteToggle } from '@/hooks/use-vote-toggle';
import { toast } from 'sonner';
import type { PaginatedCommunityTipsResponseDto } from '@/types/api-models';

interface UserTipsInfiniteTabProps {
    userId: string;
}

export default function UserTipsInfiniteTab({ userId }: UserTipsInfiniteTabProps) {
    const { user: authUser } = useAuth();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: tipsLoading,
    } = useInfiniteUserCommunityTips(userId);

    const tips = useMemo(
        () =>
            data?.pages.flatMap(
                (page) => (page.data as PaginatedCommunityTipsResponseDto).data ?? [],
            ) ?? [],
        [data],
    );

    const { ref: observerTarget, inView } = useInView({
        threshold: 0.1,
        rootMargin: '200px',
    });
    const hasFetchedTipsRef = useRef(false);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        if (!inView) hasFetchedTipsRef.current = false;
    }, [inView]);

    const { toggleVote: toggleTipVote } = useVoteToggle('tip');

    return (
        <div className="space-y-4 w-full max-w-2xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Community Tips</h2>
            </div>

            {tipsLoading ? (
                <div className="py-20 flex justify-center">
                    <Loader2 size={24} className="text-amber-400 animate-spin" />
                </div>
            ) : tips.length === 0 ? (
                <div className="py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/20 text-xs font-medium text-white/40">
                    No tips shared yet
                </div>
            ) : (
                <div className="space-y-2.5 pb-8">
                    {tips.map((tip) => (
                        <TipCard
                            key={tip.id}
                            tip={tip}
                            authUser={authUser}
                            onCommentClick={() => {}}
                            onVoteClick={async () => {
                                if (!authUser) {
                                    toast.error('Join us to like tips!', {
                                        description: 'Login to help the community.',
                                    });
                                    return;
                                }
                                return toggleTipVote(tip);
                            }}
                        />
                    ))}

                    <div ref={observerTarget} className="py-6 flex justify-center">
                        {isFetchingNextPage ? (
                            <Loader2 size={20} className="text-amber-400 animate-spin" />
                        ) : hasNextPage ? (
                            <div className="h-4 w-4" />
                        ) : (
                            <p className="text-[10px] font-semibold text-white/40 tracking-wide">
                                End of tips
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
