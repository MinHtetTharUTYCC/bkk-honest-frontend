'use client';

import { useRef, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useInfiniteSpotPriceReports } from '@/hooks/use-api';
import { Zap, TrendingDown, TrendingUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import CreatePriceModal from '@/components/prices/create-price-modal';
import { useInView } from 'react-intersection-observer';
import { useRouter, usePathname } from 'next/navigation';
import { PriceReportDto, SpotWithStatsResponseDto } from '@/api/generated/model';

interface PricesTabProps {
    spot: SpotWithStatsResponseDto;
}

export default function PricesTab({ spot }: PricesTabProps) {
    const { user: authUser } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const spotId = spot.id;

    const [showPriceModal, setShowPriceModal] = useState(false);

    const {
        data: reportsData,
        fetchNextPage: fetchNextReports,
        hasNextPage: hasNextReports,
        isFetchingNextPage: isFetchingNextReports,
    } = useInfiniteSpotPriceReports(spotId);

    // Each page is PaginatedPriceReportsDto (mutator unwraps the response envelope)
    const reports: PriceReportDto[] = useMemo(() => {
        return (
            reportsData?.pages.flatMap(
                (page) => (page as unknown as { data: PriceReportDto[] })?.data || [],
            ) || []
        );
    }, [reportsData]);

    const { ref: pricesObserverTarget, inView: inViewPrices } = useInView({
        threshold: 0.1,
        rootMargin: '200px',
    });
    const hasFetchedPricesRef = useRef(false);

    useEffect(() => {
        if (
            inViewPrices &&
            hasNextReports &&
            !isFetchingNextReports &&
            !hasFetchedPricesRef.current
        ) {
            hasFetchedPricesRef.current = true;
            fetchNextReports();
        }
    }, [inViewPrices, hasNextReports, isFetchingNextReports, fetchNextReports]);

    useEffect(() => {
        if (!inViewPrices) hasFetchedPricesRef.current = false;
    }, [inViewPrices]);

    const spotPriceStats = spot.priceStats;
    const avgSpotPrice = typeof spotPriceStats?.avg === 'number' ? spotPriceStats.avg : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {showPriceModal && (
                <CreatePriceModal spotId={spotId} onClose={() => setShowPriceModal(false)} />
            )}

            <header className="flex flex-col gap-6 px-2">
                <div className="flex items-center justify-between gap-4">
                    <h3 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                        Recent Price Reports
                    </h3>
                    <button
                        onClick={() => {
                            if (!authUser) {
                                router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
                                return;
                            }
                            setShowPriceModal(true);
                        }}
                        className="group bg-amber-500 text-black hover:text-white px-6 py-3 rounded-xl text-[10px] font-semibold tracking-wide hover:bg-amber-400 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        <Zap
                            size={14}
                            fill="currentColor"
                            className="text-black group-hover:text-white transition-colors"
                        />
                        <span className="hidden sm:inline">Report Price</span>
                        <span className="sm:hidden">Report Price</span>
                    </button>
                </div>
            </header>

            <div className="bg-card rounded-2xl border border-border shadow-xl shadow-black/20 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="px-8 py-6 text-xs font-semibold tracking-wide text-white/50">
                                Item Name
                            </th>
                            <th className="px-8 py-6 text-xs font-semibold tracking-wide text-white/50">
                                Price
                            </th>
                            <th className="px-8 py-6 text-xs font-semibold tracking-wide text-white/50">
                                Status
                            </th>
                            <th className="px-8 py-6 text-xs font-semibold tracking-wide text-white/50">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {!Array.isArray(reports) || reports.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-8 py-20 text-center text-sm font-medium text-white/40"
                                >
                                    No reports yet
                                </td>
                            </tr>
                        ) : (
                            reports.map((r) => (
                                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-8 py-6 text-sm font-semibold text-white">
                                        {r.itemName}
                                    </td>
                                    <td className="px-8 py-6 text-sm font-semibold text-amber-400 italic">
                                        {r.priceThb} THB
                                    </td>
                                    <td className="px-8 py-6">
                                        <div
                                            className={cn(
                                                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold tracking-tighter',
                                                Number(r.priceThb) <= avgSpotPrice
                                                    ? 'bg-emerald-50 text-emerald-500'
                                                    : 'bg-red-50 text-red-500',
                                            )}
                                        >
                                            {Number(r.priceThb) <= avgSpotPrice ? (
                                                <TrendingDown size={10} />
                                            ) : (
                                                <TrendingUp size={10} />
                                            )}
                                            {Number(r.priceThb) <= avgSpotPrice
                                                ? 'Fair Price'
                                                : 'Expensive'}
                                        </div>
                                    </td>
                                    <td
                                        className="px-8 py-6 text-[10px] font-medium text-white/50 uppercase tracking-widest"
                                        suppressHydrationWarning
                                    >
                                        {/* eslint-disable-next-line react-hooks/purity */}
                                        {new Date(r.timestamp || Date.now()).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div ref={pricesObserverTarget} className="py-6 flex justify-center">
                {isFetchingNextReports ? (
                    <Loader2 size={20} className="text-amber-400 animate-spin" />
                ) : hasNextReports ? (
                    <div className="h-4 w-4" />
                ) : (
                    <p className="text-[10px] font-semibold text-white/40 tracking-wide">
                        End of reports
                    </p>
                )}
            </div>
        </div>
    );
}
