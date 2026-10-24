'use client';

import { MapPin, Zap, ImageIcon } from 'lucide-react';
import { useVoteToggle } from '@/hooks/use-vote-toggle';
import { getSpotUrl } from '@/lib/utils/slug';
import { LikeButton } from '@/components/ui/like-button';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Link from 'next/link';
import { useMemo } from 'react';

import type { SpotWithStatsResponseDto } from '@/types/api-models';

export type SpotCardData = SpotWithStatsResponseDto;

export default function SpotCard({ spot }: { spot: SpotCardData }) {
    const {
        slug,
        city,
        name,
        category,
        address,
        priceStats,
        vibeStats,
        activityStats,
        _count,
        imageVariants,
    } = spot;
    const spotSlug = typeof slug === 'string' ? slug : '';
    const citySlug = typeof city?.slug === 'string' ? city.slug : 'bangkok';
    const safeAddress = typeof address === 'string' ? address : '';
    const categoryName = typeof category?.name === 'string' ? category.name : 'Category';
    const avgCrowdLevel =
        typeof vibeStats?.avgCrowdLevel === 'number' ? vibeStats.avgCrowdLevel : undefined;
    const avgPrice = typeof priceStats?.avg === 'number' ? priceStats.avg : undefined;
    const voteCount = typeof spot._count?.votes === 'number' ? spot._count.votes : 0;
    const totalPulse =
        (typeof _count?.priceReports === 'number' ? _count.priceReports : 0) +
        (typeof _count?.vibeChecks === 'number' ? _count.vibeChecks : 0) +
        (typeof _count?.communityTips === 'number' ? _count.communityTips : 0);

    // Helper for "Pulse" freshness - memoized to avoid recalculating on every render
    const pulseLabel = useMemo(() => {
        const timestamp = activityStats?.lastActivity;
        if (typeof timestamp !== 'string' && typeof timestamp !== 'number') return null;
        const date = new Date(timestamp);
        // eslint-disable-next-line react-hooks/purity
        const now = Date.now();
        const seconds = Math.floor((now - date.getTime()) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }, [activityStats?.lastActivity]);

    const { toggleVote, isPending: votePending } = useVoteToggle('spot');

    const handleVote = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (votePending) return;
        await toggleVote({
            id: spot.id,
            hasVoted: spot.hasVoted,
            voteId: typeof spot.voteId === 'string' ? spot.voteId : null,
        });
    };

    return (
        <Link
            href={getSpotUrl(citySlug, spotSlug)}
            className="shrink-0 w-full bg-card rounded-2xl border border-white/8 shadow-xl shadow-black/40 group hover:shadow-2xl hover:shadow-black/60 hover:scale-[1.01] transition-all duration-500 cursor-pointer overflow-hidden"
        >
            {/* Image Section */}
            <div className="relative w-full aspect-square overflow-hidden bg-white/5 border-b border-white/8">
                {imageVariants ? (
                    <OptimizedImage
                        variants={imageVariants}
                        alt={name || 'Spot'}
                        size="thumbnail"
                        fill
                        width={spot.imageWidth}
                        height={spot.imageHeight}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        blurDataURL={
                            typeof spot.blurPlaceholder === 'string'
                                ? spot.blurPlaceholder
                                : undefined
                        }
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-2">
                        <ImageIcon size={32} strokeWidth={1.5} />
                        <span className="text-[12px] font-black uppercase tracking-widest">
                            No Photo
                        </span>
                    </div>
                )}

                {/* Badge Container - top row */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="bg-white/10 backdrop-blur-md text-white/90 px-3 py-1.5 rounded-xl text-[12px] font-bold tracking-widest shadow-sm border border-white/10 text-wrap">
                        {categoryName}
                    </span>
                    <div className="bg-white/10 backdrop-blur-md text-white/90 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold text-[12px] tracking-widest shadow-sm border border-white/10 text-wrap">
                        <Zap size={10} fill="#fbbf24" className="text-amber-400" />
                        {typeof avgCrowdLevel === 'number'
                            ? `Busy: ${avgCrowdLevel.toFixed(1)}/5`
                            : 'New'}
                    </div>
                </div>

                {/* Action buttons — bottom-right of image */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2 pointer-events-auto">
                    <LikeButton
                        count={voteCount}
                        isVoted={spot.hasVoted}
                        onVote={handleVote}
                        isPending={votePending}
                        disabled={votePending}
                        variant="overlay"
                        size="sm"
                        showCount={true}
                        className="text-[12px] font-black uppercase tracking-widest gap-1.5 px-2.5 py-1.5 rounded-xl backdrop-blur-md border shadow-lg bg-black/40 border-white/10 text-white/70 hover:bg-amber-400/20 hover:border-amber-400/30 hover:text-amber-400"
                        title={spot.hasVoted ? 'Remove like' : 'Like this spot'}
                    />
                </div>
            </div>

            <div className="p-5">
                <div className="space-y-1 mb-5">
                    <h3 className="font-display text-xl font-bold text-foreground leading-tight line-clamp-1 tracking-tight group-hover:text-amber-400 transition-colors">
                        {name || 'Unnamed Spot'}
                    </h3>
                    <p className="text-white/60 font-medium text-[12px] uppercase tracking-widest flex items-center gap-1.5 line-clamp-1">
                        <MapPin size={11} className="text-amber-400 shrink-0" />
                        {safeAddress.split(',')[0]}
                    </p>
                </div>

                <div className="flex items-center gap-6 pt-1">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-0.5">
                            Avg Price
                        </span>
                        <span className="text-sm font-mono font-bold text-foreground tracking-tight">
                            {typeof avgPrice === 'number' ? `${avgPrice} THB` : '--'}
                        </span>
                    </div>

                    <div className="w-px h-8 bg-white/10" />

                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-0.5">
                            Pulse
                        </span>
                        <span className="text-sm font-mono font-bold text-foreground tracking-tight">
                            {pulseLabel ? pulseLabel : `${totalPulse} Updates`}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
