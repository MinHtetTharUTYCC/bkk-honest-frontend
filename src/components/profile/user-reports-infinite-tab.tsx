'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useInfiniteUserPriceReports } from '@/hooks/use-api';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';

import type { PriceReportDto } from '@/api/generated/model';
import type { PaginatedPriceReportsDto } from '@/api/generated/model';

interface UserReportsInfiniteTabProps {
    userId: string;
}

export default function UserReportsInfiniteTab({ userId }: UserReportsInfiniteTabProps) {
    const {
        data: reportsData,
        fetchNextPage: fetchNextReports,
        hasNextPage: hasNextReports,
        isFetchingNextPage: isFetchingNextReports,
        isLoading: reportsLoading,
    } = useInfiniteUserPriceReports(userId) as {
        data:
            | {
                  pages: { data: PaginatedPriceReportsDto; status: number }[];
              }
            | undefined;
        fetchNextPage: () => void;
        hasNextPage: boolean | undefined;
        isFetchingNextPage: boolean;
        isLoading: boolean;
    };

    const reports: PriceReportDto[] = useMemo(() => {
        return reportsData?.pages.flatMap((page) => page.data.data || []) || [];
    }, [reportsData]);

    const { ref: observerTarget, inView } = useInView({
        threshold: 0.1,
        rootMargin: '200px',
    });
    const hasFetchedReportsRef = useRef(false);

    useEffect(() => {
        if (inView && hasNextReports && !isFetchingNextReports && !hasFetchedReportsRef.current) {
            hasFetchedReportsRef.current = true;
            fetchNextReports();
        }
    }, [inView, hasNextReports, isFetchingNextReports, fetchNextReports]);

    useEffect(() => {
        if (!inView) hasFetchedReportsRef.current = false;
    }, [inView]);

    return (
        <div className="space-y-4 w-full max-w-2xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Price Reports</h2>
            </div>

            {reportsLoading ? (
                <div className="py-20 flex justify-center">
                    <Loader2 size={24} className="text-green-400 animate-spin" />
                </div>
            ) : reports.length === 0 ? (
                <div className="py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/20 text-xs font-medium text-white/40">
                    No price reports submitted yet
                </div>
            ) : (
                <div className="space-y-2.5 pb-8">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className="bg-white/5 hover:bg-white/10 border border-border rounded-xl p-4 transition-all"
                        >
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm text-green-400 line-clamp-1">
                                    {report.itemName}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-lg font-bold text-green-400">
                                        ฿ {report.priceThb.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex gap-2 mt-2 text-[10px] text-white/40">
                                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div ref={observerTarget} className="py-6 flex justify-center">
                        {isFetchingNextReports ? (
                            <Loader2 size={20} className="text-green-400 animate-spin" />
                        ) : hasNextReports ? (
                            <div className="h-4 w-4" />
                        ) : (
                            <p className="text-[10px] font-semibold text-white/40 tracking-wide">
                                End of price reports
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
