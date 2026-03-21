'use client';

import { useState, useEffect, useRef } from 'react';
import { useInfiniteSpotGallery, useUploadSpotImage } from '@/hooks/use-api';
import { useVoteToggle } from '@/hooks/use-vote-toggle';
import { X, Camera, Loader2, TrendingUp, Calendar, User, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LikeButton } from '@/components/ui/like-button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';

interface GalleryModalProps {
    spotId: string;
    spotName: string;
    onClose: () => void;
}

export default function GalleryModal({ spotId, spotName, onClose }: GalleryModalProps) {
    const [sort, setSort] = useState<'popular' | 'newest'>('newest');
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        useInfiniteSpotGallery(spotId, sort);

    const uploadMutation = useUploadSpotImage();
    const { toggleVote, isPending: votePending } = useVoteToggle('image', spotId);
    const [votingImageId, setVotingImageId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const rawImages = data?.pages.flatMap((page) => page.data || page) || [];
    // Remove duplicates that can occur with offset pagination when new items are added
    const images = Array.from(new Map(rawImages.map((img: any) => [img.id, img])).values());
    const totalImages = data?.pages[0]?.pagination?.total || data?.pages[0]?.total;

    // Infinite scroll trigger
    const { ref: observerTarget, inView } = useInView({ threshold: 0.5 });
    const hasFetchedRef = useRef(false);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        if (!inView) {
            hasFetchedRef.current = false;
        }
    }, [inView]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadMutation.mutateAsync({ spotId, file });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-6xl h-full bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <header className="p-8 border-b border-white/8 flex items-center justify-between bg-card z-10">
                    <div className="space-y-1">
                        <h2 className="font-display text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
                            {spotName} Gallery
                            {totalImages !== undefined && (
                                <span className="text-sm font-bold text-white/40 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10 tracking-widest">
                                    {totalImages}
                                </span>
                            )}
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="flex bg-white/8 p-1 rounded-xl">
                                <button
                                    onClick={() => setSort('popular')}
                                    className={cn(
                                        'px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all',
                                        sort === 'popular'
                                            ? 'bg-amber-400 text-black shadow-sm'
                                            : 'text-white/40 hover:text-white/70',
                                    )}
                                >
                                    Popular
                                </button>
                                <button
                                    onClick={() => setSort('newest')}
                                    className={cn(
                                        'px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all',
                                        sort === 'newest'
                                            ? 'bg-amber-400 text-black shadow-sm'
                                            : 'text-white/40 hover:text-white/70',
                                    )}
                                >
                                    Newest
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(); }} onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                            className="p-3 bg-white/8 rounded-2xl text-white/40 hover:text-foreground transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </header>

                {/* Content */}
                <ScrollArea className="flex-1 min-h-0 bg-background">
                    <div className="p-8 h-full">
                        {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <Loader2 size={40} className="text-amber-400 animate-spin" />
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                Loading Vibes...
                            </p>
                        </div>
                    ) : images.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-6">
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center text-white/20">
                                <Camera size={40} />
                            </div>
                            <div className="text-center">
                                <h4 className="font-display text-xl font-bold text-foreground tracking-tight">
                                    No vibes yet
                                </h4>
                                <p className="text-xs text-white/40 font-medium uppercase tracking-widest">
                                    Be the first to share a photo of this spot
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {images.map((img: any) => (
                                    <div
                                        key={img.id}
                                        className="bg-card rounded-2xl overflow-hidden border border-white/8 shadow-xl shadow-black/30 group"
                                    >
                                        <div className="aspect-[4/5] relative overflow-hidden">
                                            <img
                                                src={img.url}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                alt="Spot vibe"
                                                loading="lazy"
                                            />
                                        </div>

                                        <div className="p-5 flex flex-col justify-between">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <Link 
                                                        href={`/profile/${img.userId}`}
                                                        className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center text-white/40 overflow-hidden hover:border-amber-400 transition-colors shrink-0"
                                                    >
                                                        {img.user?.avatarUrl ? (
                                                            <img
                                                                src={img.user.avatarUrl}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <User size={14} />
                                                        )}
                                                    </Link>
                                                    <div className="flex-1 min-w-0 flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <Link 
                                                                href={`/profile/${img.userId}`}
                                                                className="text-[10px] font-bold text-foreground uppercase truncate hover:text-amber-400 transition-colors"
                                                            >
                                                                {img.user?.name || 'Local'}
                                                            </Link>
                                                            {img.user?.level && (
                                                                <span className="bg-amber-400/10 text-amber-400 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tighter shrink-0">
                                                                    Lvl{' '}
                                                                    {img.user.level === 'LOCAL_GURU'
                                                                        ? '3'
                                                                        : img.user.level === 'EXPLORER'
                                                                          ? '2'
                                                                          : '1'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[8px] font-medium text-white/50 uppercase flex items-center gap-1 mt-0.5">
                                                            <Calendar size={10} className="shrink-0" />
                                                            <span className="truncate">
                                                                {new Date(img.createdAt).toLocaleDateString(
                                                                    undefined,
                                                                    {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                    },
                                                                )}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex bg-white/10 rounded-lg border border-border shadow-sm shrink-0">
                                                    <LikeButton
                                                        count={img._count?.votes || 0}
                                                        isVoted={img.hasVoted}
                                                        onVote={async () => {
                                                            setVotingImageId(img.id);
                                                            try {
                                                                await toggleVote(img);
                                                            } finally {
                                                                setVotingImageId(null);
                                                            }
                                                        }}
                                                        isPending={votePending && votingImageId === img.id}
                                                        disabled={votePending && votingImageId === img.id}
                                                        variant="overlay"
                                                        size="sm"
                                                        className="text-[10px] font-semibold gap-1.5 px-3 py-1.5 rounded-md bg-white/0 hover:bg-white/10"
                                                        title={img.hasVoted ? 'Unlike this image' : 'Like this image'}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Infinite scroll target */}
                            <div ref={observerTarget} className="py-20 flex justify-center">
                                {isFetchingNextPage ? (
                                    <Loader2 size={24} className="text-amber-400 animate-spin" />
                                ) : hasNextPage ? (
                                    <div className="h-4 w-4" />
                                ) : (
                                    <p className="text-[10px] font-medium text-white/50 uppercase tracking-widest">
                                        End of gallery
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
