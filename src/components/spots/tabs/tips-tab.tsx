'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useInfiniteSpotTips, useUpdateCommunityTip, useDeleteCommunityTip } from '@/hooks/use-api';
import { useQueryClient, InfiniteData } from '@tanstack/react-query';
import { Zap, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/core';
import { TipCard } from '@/components/tips/tip-card';
import CreateTipModal from '@/components/tips/create-tip-modal';
import EditTipModal from '@/components/tips/edit-tip-modal';
import TipCommentsModal from '@/components/tips/tip-comments-modal';
import { useInView } from 'react-intersection-observer';
import { TipFormValues } from '@/lib/validations/tip';
import { toast } from 'sonner';
import { toastApiError } from '@/lib/errors/throw-api-error';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useVoteToggle } from '@/hooks/use-vote-toggle';
import { EndOfList } from '@/components/ui/end-of-list';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    CommunityTipResponseDto,
    PaginatedCommunityTipsResponseDto,
    SpotWithStatsResponseDto,
} from '@/types/api-models';

type TipsPage = { data: PaginatedCommunityTipsResponseDto };

function getUpdatedAt(value: unknown): string | undefined {
    if (typeof value !== 'object' || value === null || !('updatedAt' in value)) return undefined;
    const updatedAt = (value as { updatedAt?: unknown }).updatedAt;
    return typeof updatedAt === 'string' ? updatedAt : undefined;
}

// TODO - extract from api
const sortTypes = ['popular', 'newest'] as const;

interface TipsTabProps {
    spot: SpotWithStatsResponseDto;
}

export default function TipsTab({ spot }: TipsTabProps) {
    const { user: authUser } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const spotId = spot.id;
    const queryClient = useQueryClient();

    const [showTipModal, setShowTipModal] = useState(false);
    const [selectedTip, setSelectedTip] = useState<CommunityTipResponseDto | null>(null);
    const [editingTip, setEditingTip] = useState<CommunityTipResponseDto | null>(null);

    // Sync state with URL params
    const tipType = (searchParams.get('type') as 'TRY' | 'AVOID') || 'TRY';
    const tipSort = (searchParams.get('sort') as 'popular' | 'newest') || 'popular';

    const {
        data: tipsData,
        fetchNextPage: fetchNextTips,
        hasNextPage: hasNextTips,
        isFetchingNextPage: isFetchingNextTips,
        isLoading: tipsLoading,
    } = useInfiniteSpotTips(spotId, tipType, tipSort);

    const handleTypeChange = (newType: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('type', newType);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleSortChange = (newSort: 'popular' | 'newest') => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', newSort);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const tips: CommunityTipResponseDto[] = useMemo(() => {
        // We can merge initialTips with react-query data, but for simplicity we rely on React Query hydration.
        const rawTips =
            tipsData?.pages.flatMap(
                (page) => (page.data as unknown as PaginatedCommunityTipsResponseDto)?.data || [],
            ) || [];
        return rawTips;
    }, [tipsData]);

    const { ref: observerTarget, inView } = useInView({
        threshold: 0.1,
        rootMargin: '200px',
    });
    const hasFetchedTipsRef = useRef(false);

    useEffect(() => {
        if (inView && hasNextTips && !isFetchingNextTips && !hasFetchedTipsRef.current) {
            hasFetchedTipsRef.current = true;
            fetchNextTips();
        }
    }, [inView, hasNextTips, isFetchingNextTips, fetchNextTips]);

    useEffect(() => {
        if (!inView) hasFetchedTipsRef.current = false;
    }, [inView]);

    const updateTipMutation = useUpdateCommunityTip();
    const deleteTipMutation = useDeleteCommunityTip();
    const { toggleVote: toggleTipVote } = useVoteToggle('tip', spotId);

    const handleEditTip = (tip: CommunityTipResponseDto) => setEditingTip(tip);

    function getPageItems(page: TipsPage): CommunityTipResponseDto[] {
        return (page.data as PaginatedCommunityTipsResponseDto).data ?? [];
    }

    const handleSaveEditedTip = async (values: TipFormValues) => {
        if (!editingTip) return;
        try {
            const response = await updateTipMutation.mutateAsync({
                id: editingTip.id,
                spotId,
                ...values,
            });
            const updatedTip = response as unknown as CommunityTipResponseDto;
            const updatedAt = getUpdatedAt(updatedTip);

            // Manually update all sort variations of the infinite query cache
            sortTypes.forEach((sortType) => {
                queryClient.setQueryData<InfiniteData<TipsPage>>(
                    ['tips-infinite', spotId, editingTip.type, sortType],
                    (oldData) => {
                        if (!oldData || !oldData.pages) return oldData;
                        return {
                            ...oldData,
                            pages: oldData.pages.map((page) => ({
                                ...page,
                                data: {
                                    ...(page.data as PaginatedCommunityTipsResponseDto),
                                    data: getPageItems(page).map((tip) =>
                                        tip.id === editingTip.id
                                            ? {
                                                  ...tip,
                                                  title: values.title,
                                                  description: values.description,
                                                  type: values.type,
                                                  ...(updatedAt ? { updatedAt } : {}),
                                              }
                                            : tip,
                                    ),
                                },
                            })),
                        } as InfiniteData<TipsPage>;
                    },
                );
            });

            setEditingTip(null);
            toast.success('Tip updated');
        } catch (err: unknown) {
            toastApiError(err, 'Failed to update tip');
        }
    };

    const handleDeleteTip = async (tipId: string) => {
        try {
            await deleteTipMutation.mutateAsync({ id: tipId, _spotId: spotId });

            // Get the type of the tip being deleted to target the correct cache
            const deletedTip = tips.find((t) => t.id === tipId);
            if (!deletedTip) return;

            sortTypes.forEach((sortType) => {
                queryClient.setQueryData<InfiniteData<TipsPage>>(
                    ['tips-infinite', spotId, deletedTip.type, sortType],
                    (oldData) => {
                        if (!oldData || !oldData.pages) return oldData;
                        return {
                            ...oldData,
                            pages: oldData.pages.map((page) => ({
                                ...page,
                                data: {
                                    ...(page.data as PaginatedCommunityTipsResponseDto),
                                    data: getPageItems(page).filter((tip) => tip.id !== tipId),
                                },
                            })),
                        } as InfiniteData<TipsPage>;
                    },
                );
            });

            toast.success('Tip deleted');
        } catch (err: unknown) {
            toastApiError(err, 'Failed to delete tip');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {showTipModal && (
                <CreateTipModal spotId={spotId} onClose={() => setShowTipModal(false)} />
            )}
            {editingTip && (
                <EditTipModal
                    tip={editingTip}
                    onSave={handleSaveEditedTip}
                    onClose={() => setEditingTip(null)}
                    isLoading={updateTipMutation.isPending}
                />
            )}
            {selectedTip && (
                <TipCommentsModal
                    tip={{
                        id: selectedTip.id,
                        title: selectedTip.title,
                        type: selectedTip.type,
                    }}
                    onClose={() => setSelectedTip(null)}
                />
            )}

            {/* Optimized Header Row */}
            <header className="flex items-center justify-between gap-3 px-2">
                <div className="flex items-center gap-4 flex-1">
                    <h3 className="text-xl md:text-2xl font-display font-bold text-white shrink-0">
                        Tips
                    </h3>

                    <Select value={tipType} onValueChange={handleTypeChange}>
                        <SelectTrigger className="w-full max-w-45 bg-white/5 border-white/10 rounded-xl h-11 text-xs font-bold uppercase tracking-wider">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10">
                            <SelectItem
                                value="TRY"
                                className="text-emerald-400 font-bold focus:bg-emerald-400/10 focus:text-emerald-400 cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={14} />
                                    <span>
                                        To Try (
                                        {Number(
                                            (spot.tipStats as Record<string, number>)?.tryCount ??
                                                0,
                                        )}
                                        )
                                    </span>
                                </div>
                            </SelectItem>
                            <SelectItem
                                value="AVOID"
                                className="text-red-400 font-bold focus:bg-red-400/10 focus:text-red-400 cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <AlertTriangle size={14} />
                                    <span>
                                        To Avoid (
                                        {Number(
                                            (spot.tipStats as Record<string, number>)?.avoidCount ??
                                                0,
                                        )}
                                        )
                                    </span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <button
                    onClick={() => {
                        if (!authUser) {
                            router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
                            return;
                        }
                        setShowTipModal(true);
                    }}
                    className="bg-amber-500 text-black hover:text-white px-5 md:px-6 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 shrink-0"
                >
                    <Zap size={14} fill="currentColor" />
                    <span className="hidden sm:inline">Share New Tip</span>
                    <span className="sm:hidden">New Tip</span>
                </button>
            </header>

            <div className="space-y-4">
                <div className="flex justify-end px-2">
                    <div className="flex bg-white/5 p-1 rounded-xl w-fit border border-border">
                        <button
                            onClick={() => handleSortChange('popular')}
                            className={cn(
                                'px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer',
                                tipSort === 'popular'
                                    ? 'bg-white/10 text-amber-400 shadow-sm'
                                    : 'text-white/40 hover:text-white/70',
                            )}
                        >
                            Popular
                        </button>
                        <button
                            onClick={() => handleSortChange('newest')}
                            className={cn(
                                'px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer',
                                tipSort === 'newest'
                                    ? 'bg-white/10 text-amber-400 shadow-sm'
                                    : 'text-white/40 hover:text-white/70',
                            )}
                        >
                            Newest
                        </button>
                    </div>
                </div>

                {tipsLoading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 size={24} className="text-amber-400 animate-spin" />
                    </div>
                ) : tips.length === 0 ? (
                    <div className="py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/20 text-xs font-medium text-white/40">
                        Be the first to share a {tipType.toLowerCase()} tip
                    </div>
                ) : (
                    <div className="space-y-2.5 pb-8">
                        {tips.map((tip) => (
                            <TipCard
                                key={tip.id}
                                tip={tip}
                                authUser={authUser}
                                onCommentClick={() => setSelectedTip(tip)}
                                onVoteClick={async () => {
                                    if (!authUser) {
                                        toast.error('Join us to like tips!', {
                                            description: 'Login to help the community.',
                                        });
                                        return;
                                    }
                                    return toggleTipVote({
                                        id: tip.id,
                                        hasVoted: tip.hasVoted,
                                        voteId: tip.voteId,
                                    });
                                }}
                                onEditClick={() => handleEditTip(tip)}
                                onDeleteClick={() => handleDeleteTip(tip.id)}
                            />
                        ))}

                        <div ref={observerTarget} className="py-6 flex justify-center">
                            {isFetchingNextTips ? (
                                <Loader2 size={20} className="text-amber-400 animate-spin" />
                            ) : hasNextTips ? null : (
                                <EndOfList message="End of tips" />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
