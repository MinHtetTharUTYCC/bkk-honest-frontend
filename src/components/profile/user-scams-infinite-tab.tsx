'use client';

import { useEffect, useMemo } from 'react';
import { useInfiniteUserScamAlerts } from '@/hooks/use-api';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { getScamAlertUrl } from '@/lib/slug';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface UserScamsInfiniteTabProps {
    userId: string;
}
import { PaginatedScamAlertsResponseDto } from '@/api/generated/model/paginatedScamAlertsResponseDto';

export default function UserScamsInfiniteTab({ userId }: UserScamsInfiniteTabProps) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: scamsLoading,
    } = useInfiniteUserScamAlerts(userId);

    const scams = useMemo(
        () =>
            data?.pages.flatMap(
                (page) => (page.data as PaginatedScamAlertsResponseDto).data ?? [],
            ) ?? [],
        [data],
    );
    const { ref: observerTarget, inView } = useInView({
        threshold: 0.1,
        rootMargin: '200px',
    });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <div className="space-y-4 w-full max-w-2xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Scam Alerts</h2>
            </div>

            {scamsLoading ? (
                <div className="py-20 flex justify-center">
                    <Loader2 size={24} className="text-red-400 animate-spin" />
                </div>
            ) : scams.length === 0 ? (
                <div className="py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/20 text-xs font-medium text-white/40">
                    No scam alerts reported yet
                </div>
            ) : (
                <div className="space-y-2.5 pb-8">
                    {scams.map((scam) => (
                        <Link
                            key={scam.id}
                            href={getScamAlertUrl(
                                scam.slug || scam.id,
                                typeof scam.city === 'object' &&
                                    scam.city !== null &&
                                    'slug' in scam.city
                                    ? String(scam.city.slug)
                                    : '',
                            )}
                            className="block bg-white/5 hover:bg-white/10 border border-border rounded-xl p-4 transition-all hover:scale-[1.02]"
                        >
                            <div className="flex gap-4">
                                {scam.imageVariants && (
                                    <div className="shrink-0">
                                        <OptimizedImage
                                            variants={scam.imageVariants}
                                            alt={scam.scamName}
                                            width={scam.imageWidth || 64}
                                            height={scam.imageHeight || 64}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm text-red-400 line-clamp-2">
                                        {scam.scamName}
                                    </h3>
                                    <p className="text-xs text-white/60 line-clamp-2 mt-1">
                                        {scam.description}
                                    </p>
                                    <div className="flex gap-2 mt-2 text-[10px] text-white/40">
                                        {typeof scam.city === 'object' &&
                                            scam.city !== null &&
                                            'name' in scam.city && (
                                                <span>{String(scam.city.name)}</span>
                                            )}
                                        <span>{new Date(scam.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    <div ref={observerTarget} className="py-6 flex justify-center">
                        {isFetchingNextPage ? (
                            <Loader2 size={20} className="text-red-400 animate-spin" />
                        ) : hasNextPage ? (
                            <div className="h-4 w-4" />
                        ) : (
                            <p className="text-[10px] font-semibold text-white/40 tracking-wide">
                                End of scam alerts
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
