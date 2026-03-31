'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useInfiniteUserSpots } from '@/hooks/use-api';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { getSpotUrl } from '@/lib/slug';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import type { PaginatedSpotsWithStatsResponseDto } from '@/api/generated/model';
import type { ImageVariantsDto } from '@/api/generated/model';

interface UserSpotsInfiniteTabProps {
    userId: string;
}

export default function UserSpotsInfiniteTab({ userId }: UserSpotsInfiniteTabProps) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        useInfiniteUserSpots(userId);

    const spots = useMemo(
        () =>
            data?.pages.flatMap(
                (page) => (page.data as PaginatedSpotsWithStatsResponseDto).data ?? [],
            ) ?? [],
        [data],
    );

    const { ref: observerTarget, inView } = useInView({
        threshold: 0.1,
        rootMargin: '200px',
    });
    const hasFetchedSpotsRef = useRef(false);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage && !hasFetchedSpotsRef.current) {
            hasFetchedSpotsRef.current = true;
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        if (!inView) hasFetchedSpotsRef.current = false;
    }, [inView]);

    return (
        <div className="space-y-4 w-full max-w-2xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Visited Spots</h2>
            </div>

            {isLoading ? (
                <div className="py-20 flex justify-center">
                    <Loader2 size={24} className="text-cyan-400 animate-spin" />
                </div>
            ) : spots.length === 0 ? (
                <div className="py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/20 text-xs font-medium text-white/40">
                    No spots visited yet
                </div>
            ) : (
                <div className="space-y-2.5 pb-8">
                    {spots.map((spot) => (
                        <Link
                            key={spot.id}
                            href={getSpotUrl(
                                typeof spot.city === 'object' &&
                                    spot.city !== null &&
                                    'slug' in spot.city
                                    ? String(spot.city.slug)
                                    : 'bangkok',
                                spot.slug || spot.id,
                            )}
                            className="block bg-white/5 hover:bg-white/10 border border-border rounded-xl p-4 transition-all hover:scale-[1.02]"
                        >
                            <div className="flex gap-4">
                                {spot.imageVariants && (
                                    <div className="shrink-0">
                                        <OptimizedImage
                                            variants={spot.imageVariants as ImageVariantsDto}
                                            alt={spot.name}
                                            width={64}
                                            height={64}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm text-cyan-400 line-clamp-2">
                                        {spot.name}
                                    </h3>
                                    <p className="text-xs text-white/60 line-clamp-2 mt-1">
                                        {spot.address}
                                    </p>
                                    <div className="flex gap-2 mt-2 text-[10px] text-white/40">
                                        {typeof spot.city === 'object' &&
                                            spot.city !== null &&
                                            'name' in spot.city && (
                                                <span>{String(spot.city.name)}</span>
                                            )}
                                        {typeof spot.category === 'object' &&
                                            spot.category !== null &&
                                            'name' in spot.category && (
                                                <span className="text-cyan-400/60">
                                                    {String(spot.category.name)}
                                                </span>
                                            )}
                                        <span>{new Date(spot.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    <div ref={observerTarget} className="py-6 flex justify-center">
                        {isFetchingNextPage ? (
                            <Loader2 size={20} className="text-cyan-400 animate-spin" />
                        ) : hasNextPage ? (
                            <div className="h-4 w-4" />
                        ) : (
                            <p className="text-[10px] font-semibold text-white/40 tracking-wide">
                                End of spots
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
