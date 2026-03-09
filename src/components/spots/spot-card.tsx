'use client';

import { MapPin, Zap, ImageIcon, Heart } from 'lucide-react';
import { components } from '@/types/api';
import Link from 'next/link';
import { useState } from 'react';
import { useVoteToggle } from '@/hooks/use-vote-toggle';
import { useAuth } from '@/components/providers/auth-provider';
import { cn } from '@/lib/utils';

export default function SpotCard({ spot }: { spot: any }) {
    const { name, category, address, priceStats, vibeStats, imageUrl, images } = spot;
    const { user } = useAuth();

    const [localHasVoted, setLocalHasVoted] = useState(spot.hasVoted ?? false);
    const [localVoteCount, setLocalVoteCount] = useState(spot._count?.votes ?? 0);
    const [localVoteId, setLocalVoteId] = useState<string | null>(spot.voteId ?? null);
    const { toggleVote, isPending: votePending } = useVoteToggle('spot');

    // Format category name
    const categoryName = (category as any)?.name || 'Category';

    // Get the display image
    const displayImage = imageUrl || (images && images.length > 0 ? images[0].url : null);

    const handleVote = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user || votePending) return;
        const isRemoving = localHasVoted;
        setLocalHasVoted(!isRemoving);
        setLocalVoteCount((prev: number) => isRemoving ? prev - 1 : prev + 1);
        const result = await toggleVote({ id: spot.id, hasVoted: localHasVoted, voteId: localVoteId });
        setLocalVoteId(result.voteId);
    };

    return (
        <div className="flex-shrink-0 w-full bg-card rounded-2xl p-5 border border-white/8 shadow-xl shadow-black/40 group hover:shadow-2xl hover:shadow-black/60 hover:scale-[1.01] transition-all duration-500">
            {/* Image Section */}
            <div className="relative w-full aspect-square mb-5 rounded-xl overflow-hidden bg-white/5 border border-white/8">
                {displayImage ? (
                    <img
                        src={displayImage}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-2">
                        <ImageIcon size={32} strokeWidth={1.5} />
                        <span className="text-[9px] font-black uppercase tracking-widest">
                            No Photos
                        </span>
                    </div>
                )}

                {/* Badge Container - top row */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="bg-white/10 backdrop-blur-md text-white/90 px-3 py-1.5 rounded-xl text-[9px] font-bold tracking-widest uppercase shadow-sm border border-white/10">
                        {categoryName}
                    </span>
                    <div className="bg-amber-400/90 backdrop-blur-md text-black px-3 py-1.5 rounded-xl flex items-center gap-1 font-bold text-[9px] tracking-widest uppercase shadow-lg shadow-amber-400/20 border border-amber-300/20">
                        <Zap size={10} fill="currentColor" />
                        {(vibeStats as any)?.avgCrowdLevel
                            ? `Busy: ${((vibeStats as any).avgCrowdLevel).toFixed(1)}/5`
                            : 'New'}
                    </div>
                </div>

                {/* Heart vote button — bottom-right of image, only for logged-in users */}
                {user && (
                    <button
                        onClick={handleVote}
                        disabled={votePending}
                        className={cn(
                            'absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl backdrop-blur-md border text-[9px] font-black uppercase tracking-widest transition-all shadow-lg',
                            localHasVoted
                                ? 'bg-amber-400/90 border-amber-300/30 text-black'
                                : 'bg-black/40 border-white/10 text-white/70 hover:bg-amber-400/20 hover:border-amber-400/30 hover:text-amber-400',
                        )}
                        title={localHasVoted ? 'Remove like' : 'Like this spot'}
                    >
                        <Heart size={10} fill={localHasVoted ? 'currentColor' : 'none'} />
                        {localVoteCount > 0 && <span>{localVoteCount}</span>}
                    </button>
                )}
            </div>

            <Link href={`/spots/${spot.id}`} className="block">
                <div className="space-y-1 mb-5">
                    <h3 className="font-display text-xl font-bold text-foreground leading-tight line-clamp-1 tracking-tight group-hover:text-amber-400 transition-colors">
                        {name}
                    </h3>
                    <p className="text-white/60 font-medium text-[9px] uppercase tracking-widest flex items-center gap-1.5 line-clamp-1">
                        <MapPin size={11} className="text-amber-400" />
                        {address?.split(',')[0]}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/6 group-hover:bg-white/8 group-hover:border-white/10 transition-all">
                        <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                            Avg Price
                        </span>
                        <span className="text-sm font-bold text-foreground tracking-tight">
                            {(priceStats as any)?.avg ? `${(priceStats as any).avg} THB` : '--'}
                        </span>
                    </div>
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/6 group-hover:bg-white/8 group-hover:border-white/10 transition-all">
                        <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                            Pulse
                        </span>
                        <span className="text-sm font-bold text-foreground tracking-tight">
                            {(priceStats as any)?.count || 0} Reports
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );
}

