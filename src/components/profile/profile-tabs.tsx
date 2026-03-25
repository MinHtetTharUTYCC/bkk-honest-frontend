'use client';

import {
    useInfiniteUserPriceReports,
    useInfiniteUserScamAlerts,
    useInfiniteUserCommunityTips,
    useInfiniteUserSpots,
} from '@/hooks/use-api';
import {
    MapPin,
    ArrowRight,
    Loader2,
    AlertTriangle,
    Target,
    Zap,
    Calendar,
    ImageIcon,
    Lightbulb,
    Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { getSpotUrl, getScamAlertUrl } from '@/lib/slug';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface ProfileTabsProps {
    userId: string;
    activeTab: 'scams' | 'reports' | 'tips' | 'spots';
    onTabChange: (tab: 'scams' | 'reports' | 'tips' | 'spots') => void;
    isPublic?: boolean;
}

export function ProfileTabs({ userId, activeTab, onTabChange, isPublic = false }: ProfileTabsProps) {
    const { ref, inView } = useInView({ threshold: 0.1 });
    const lastFetchTabRef = useRef<string | null>(null);
    const queryClient = useQueryClient();

    const prefetchTab = (tab: string) => {
        const queryKeyMap: Record<string, string> = {
            scams: 'user-scam-alerts-infinite',
            tips: 'user-community-tips-infinite',
            reports: 'user-price-reports-infinite',
            spots: 'user-spots-infinite',
        };

        const key = queryKeyMap[tab];
        if (key) {
            queryClient.prefetchInfiniteQuery({
                queryKey: [key, userId],
                initialPageParam: 0,
            } as unknown);
        }
    };

    const {
        data: reportsData,
        fetchNextPage: fetchNextReports,
        hasNextPage: hasNextReports,
        isFetchingNextPage: isFetchingReports,
    } = useInfiniteUserPriceReports(userId);

    const {
        data: scamsData,
        fetchNextPage: fetchNextScams,
        hasNextPage: hasNextScams,
        isFetchingNextPage: isFetchingScams,
    } = useInfiniteUserScamAlerts(userId);

    const {
        data: tipsData,
        fetchNextPage: fetchNextTips,
        hasNextPage: hasNextTips,
        isFetchingNextPage: isFetchingTips,
    } = useInfiniteUserCommunityTips(userId);

    const {
        data: spotsData,
        fetchNextPage: fetchNextSpots,
        hasNextPage: hasNextSpots,
        isFetchingNextPage: isFetchingSpots,
    } = useInfiniteUserSpots(userId);

    useEffect(() => {
        if (!inView || lastFetchTabRef.current === activeTab) return;
        
        if (activeTab === 'scams' && hasNextScams && !isFetchingScams) {
            lastFetchTabRef.current = activeTab;
            fetchNextScams();
        } else if (activeTab === 'tips' && hasNextTips && !isFetchingTips) {
            lastFetchTabRef.current = activeTab;
            fetchNextTips();
        } else if (activeTab === 'reports' && hasNextReports && !isFetchingReports) {
            lastFetchTabRef.current = activeTab;
            fetchNextReports();
        } else if (activeTab === 'spots' && hasNextSpots && !isFetchingSpots) {
            lastFetchTabRef.current = activeTab;
            fetchNextSpots();
        }
    }, [inView, activeTab, hasNextScams, hasNextTips, hasNextReports, hasNextSpots, isFetchingScams, isFetchingTips, isFetchingReports, isFetchingSpots, fetchNextScams, fetchNextTips, fetchNextReports, fetchNextSpots]);

    // Reset fetch tracker when switching tabs or when loader goes out of view
    useEffect(() => {
        if (!inView) {
            lastFetchTabRef.current = null;
        }
    }, [inView]);

    useEffect(() => {
        lastFetchTabRef.current = null;
    }, [activeTab]);

    const reportsList = useMemo(() => reportsData?.pages.flatMap((page) => page.data || []) || [], [reportsData]);
    const scamsList = useMemo(() => scamsData?.pages.flatMap((page) => page.data || []) || [], [scamsData]);
    const tipsList = useMemo(() => tipsData?.pages.flatMap((page) => page.data || []) || [], [tipsData]);
    const spotsList = useMemo(() => spotsData?.pages.flatMap((page) => page.data || []) || [], [spotsData]);

    const reportsTotal = reportsData?.pages[0]?.pagination?.total || reportsList.length;
    const scamsTotal = scamsData?.pages[0]?.pagination?.total || scamsList.length;
    const tipsTotal = tipsData?.pages[0]?.pagination?.total || tipsList.length;
    const spotsTotal = spotsData?.pages[0]?.pagination?.total || spotsList.length;

    const tabs = [
        { id: 'scams', label: 'Scams', count: scamsTotal, color: 'text-red-400 bg-red-500/10 border-red-500/20 active:bg-red-500/20' },
        { id: 'tips', label: 'Tips', count: tipsTotal, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 active:bg-emerald-500/20' },
        { id: 'reports', label: 'Prices', count: reportsTotal, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 active:bg-amber-500/20', private: true },
        { id: 'spots', label: 'Spots', count: spotsTotal, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20 active:bg-orange-500/20' },
    ] as const;

    const visibleTabs = tabs.filter(tab => !isPublic || !('private' in tab && tab.private));

    const isLoading = 
        (activeTab === 'scams' && !scamsData) ||
        (activeTab === 'tips' && !tipsData) ||
        (activeTab === 'reports' && !reportsData) ||
        (activeTab === 'spots' && !spotsData);

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <h2 className="font-display text-3xl font-bold text-foreground tracking-tight">
                    {!isPublic ? 'My Pulse' : 'Contribution Pulse'}
                </h2>

                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex bg-white/8 p-1 rounded-2xl md:p-1.5 no-scrollbar">
                        {visibleTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id as unknown)}
                                onMouseEnter={() => prefetchTab(tab.id)}
                                className={cn(
                                    'px-4 md:px-6 py-2 rounded-xl text-[12px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer',
                                    activeTab === tab.id
                                        ? tab.color.split(' active:')[0] + ' shadow-sm'
                                        : 'text-white/40 hover:text-white/70',
                                )}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" className="hidden" />
                </ScrollArea>
            </header>

            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex flex-col gap-6">
                        {[1, 2].map((i) => (
                            <div
                                key={i}
                                className="bg-card rounded-2xl p-6 md:p-8 border border-white/8 h-40 animate-pulse"
                            />
                        ))}
                    </div>
                ) : null}

                {!isLoading && activeTab === 'scams' && (
                    <div className="flex flex-col gap-6">
                        {scamsList.length > 0 ? (
                            scamsList.map((scam: unknown) => (
                                <div key={scam.id} className="bg-card rounded-2xl border border-white/8 shadow-xl shadow-black/20 border-l-4 border-l-red-500 overflow-hidden flex flex-col sm:flex-row items-stretch">
                                    <div className="w-full sm:w-32 md:w-40 aspect-square bg-white/5 border-b sm:border-b-0 sm:border-r border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                                        {scam.imageUrl ? (
                                            <Image src={scam.imageUrl} alt={scam.scamName} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-1">
                                                <ImageIcon size={24} strokeWidth={1.5} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-center px-1">No Photo</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center min-w-0 p-5 sm:p-6 md:p-8">
                                        <h4 className="font-display text-xl font-bold text-foreground mb-2 tracking-tight sm:mt-0 mt-2">
                                            {scam.scamName}
                                        </h4>
                                        <p className="text-xs font-medium text-white/50 line-clamp-2 mb-4 leading-relaxed">
                                            {scam.description}
                                        </p>
                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                            <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                                                {new Date(scam.createdAt).toLocaleDateString()}
                                            </span>
                                            <Link
                                                href={getScamAlertUrl(scam?.city?.slug || 'bangkok', scam?.slug || '')}
                                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors"
                                            >
                                                View Details <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 flex flex-col items-center gap-4">
                                <AlertTriangle size={32} className="text-white/50" />
                                <p className="text-[12px] font-medium text-white/50 uppercase tracking-widest">
                                    No scam alerts reported yet
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {!isLoading && activeTab === 'tips' && (
                    <div className="flex flex-col gap-6">
                        {tipsList.length > 0 ? (
                            tipsList.map((tip: unknown) => {
                                const displayImg = tip.imageUrl || tip.spot?.imageUrl;
                                return (
                                    <div key={tip.id} className="bg-card rounded-2xl border border-white/8 shadow-xl shadow-black/20 border-l-4 border-l-emerald-400 overflow-hidden flex flex-col sm:flex-row items-stretch">
                                        <div className="w-full sm:w-32 md:w-40 aspect-square bg-white/5 border-b sm:border-b-0 sm:border-r border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                                            {displayImg ? (
                                                <Image src={displayImg} alt={tip.title} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-1">
                                                    <ImageIcon size={24} strokeWidth={1.5} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-center px-1">No Photo</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center min-w-0 p-5 sm:p-6 md:p-8">
                                            <h4 className="font-display text-xl font-bold text-foreground mb-2 tracking-tight sm:mt-0 mt-2">
                                                {tip.title}
                                            </h4>
                                            <p className="text-xs font-medium text-white/50 line-clamp-2 mb-4 leading-relaxed">
                                                {tip.description}
                                            </p>
                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                                <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                                                    {new Date(tip.createdAt).toLocaleDateString()}
                                                </span>
                                                <Link
                                                    href={getSpotUrl(tip.spot?.city?.slug || 'bangkok', tip.spot?.slug || '')}
                                                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors"
                                                >
                                                    View Spot <ArrowRight size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 flex flex-col items-center gap-4">
                                <Lightbulb size={32} className="text-white/50" />
                                <p className="text-[10px] font-medium text-white/50 uppercase tracking-widest">
                                    No community tips shared yet
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {!isLoading && activeTab === 'reports' && (
                    <div className="flex flex-col gap-6">
                        {reportsList.length > 0 ? (
                            reportsList.map((report: unknown) => {
                                const displayImg = report.imageUrl || report.spot?.imageUrl;
                                return (
                                    <div key={report.id} className="bg-card rounded-2xl border border-white/8 shadow-xl shadow-black/20 border-l-4 border-l-amber-400 overflow-hidden flex flex-col sm:flex-row items-stretch">
                                        <div className="w-full sm:w-32 md:w-40 aspect-square bg-white/5 border-b sm:border-b-0 sm:border-r border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                                            {displayImg ? (
                                                <Image src={displayImg} alt={report.itemName} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-1">
                                                    <ImageIcon size={24} strokeWidth={1.5} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-center px-1">No Photo</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center min-w-0 p-5 sm:p-6 md:p-8">
                                            <h4 className="font-display text-xl font-bold text-foreground mb-2 tracking-tight sm:mt-0 mt-2">
                                                {report.itemName}
                                            </h4>
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="font-display text-2xl font-bold text-amber-400 tracking-tight">
                                                    {report.priceThb} THB
                                                </span>
                                                <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest line-clamp-1">
                                                    @ {report.spot?.name || 'Local Spot'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                                <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                                                    {new Date(report.timestamp).toLocaleDateString()}
                                                </span>
                                                <Link
                                                    href={getSpotUrl(report.spot?.city?.slug || 'bangkok', report.spot?.slug || '')}
                                                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors"
                                                >
                                                    View Spot <ArrowRight size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 flex flex-col items-center gap-4">
                                <Zap size={32} className="text-white/50" />
                                <p className="text-[10px] font-medium text-white/50 uppercase tracking-widest">
                                    No price reports shared yet
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {!isLoading && activeTab === 'spots' && (
                    <div className="flex flex-col gap-6">
                        {spotsList.length > 0 ? (
                            spotsList.map((spot: unknown) => (
                                <div key={spot.id} className="bg-card rounded-2xl border border-white/8 shadow-xl shadow-black/20 border-l-4 border-l-orange-400 overflow-hidden flex flex-col sm:flex-row items-stretch">
                                    <div className="w-full sm:w-32 md:w-40 aspect-square bg-white/5 border-b sm:border-b-0 sm:border-r border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                                        {spot.imageUrl ? (
                                            <Image src={spot.imageUrl} alt={spot.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-1">
                                                <ImageIcon size={24} strokeWidth={1.5} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-center px-1">No Photo</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center min-w-0 p-5 sm:p-6 md:p-8">
                                        <h4 className="font-display text-xl font-bold text-foreground mb-2 tracking-tight sm:mt-0 mt-2">
                                            {spot.name}
                                        </h4>
                                        <p className="text-xs font-medium text-white/50 line-clamp-2 mb-4 leading-relaxed flex items-start gap-1">
                                            <MapPin size={12} className="text-orange-400 shrink-0 mt-0.5" /> {spot.address}
                                        </p>
                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                            <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                                                {new Date(spot.createdAt).toLocaleDateString()}
                                            </span>
                                            <Link
                                                href={getSpotUrl(spot?.city?.slug || 'bangkok', spot?.slug || '')}
                                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors"
                                            >
                                                View Spot Details <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 flex flex-col items-center gap-4">
                                <MapPin size={32} className="text-white/50" />
                                <p className="text-[10px] font-medium text-white/50 uppercase tracking-widest">
                                    No spots added yet
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Infinite Scroll Trigger */}
                {(() => {
                    const shouldShowTrigger = 
                        (activeTab === 'scams' && (hasNextScams || isFetchingScams)) ||
                        (activeTab === 'tips' && (hasNextTips || isFetchingTips)) ||
                        (activeTab === 'reports' && (hasNextReports || isFetchingReports)) ||
                        (activeTab === 'spots' && (hasNextSpots || isFetchingSpots));
                    
                    return shouldShowTrigger && (
                        <div ref={ref} className="py-10 flex justify-center">
                            {(isFetchingScams || isFetchingTips || isFetchingReports || isFetchingSpots) && (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                                    <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">
                                        Syncing more pulse...
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}
