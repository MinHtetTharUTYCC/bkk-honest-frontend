'use client';

import { useState, useEffect } from 'react';
import { useInfiniteScamAlerts, useCategories } from '@/hooks/use-api';
import { SearchInput } from '@/components/ui/search-input';
import ScamAlertCard from '@/components/scams/scam-alert-card';
import { AlertTriangle, MapPin, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCity } from '@/components/providers/city-provider';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useInView } from 'react-intersection-observer';

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function ScamAlertsPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [sort, setSort] = useState<'newest' | 'popular'>('newest');
    const { selectedCityId, selectedCity } = useCity();

    const [isClient, setIsClient] = useState(false);
    const { ref, inView } = useInView();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const { data: categoriesResponse } = useCategories();
    const categories = categoriesResponse?.data || categoriesResponse || [];

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteScamAlerts({
        cityId: selectedCityId,
        categoryId: selectedCategory,
        sort,
        search: debouncedSearch,
    });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (!isClient) return null;

    const alerts = data?.pages.flatMap((page) => page.data) || [];

    return (
        <div className="space-y-6 pb-24">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-0.5">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">
                        Scam Alerts
                    </h1>
                    <div className="flex items-center gap-2">
                        <MapPin size={10} className="text-cyan-400" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">
                            Real-time Warnings in {selectedCity?.name || 'Thailand'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Sort Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-2xl w-full sm:w-auto">
                        <button
                            onClick={() => setSort('newest')}
                            className={cn(
                                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                sort === 'newest' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <Clock size={12} />
                            Newest
                        </button>
                        <button
                            onClick={() => setSort('popular')}
                            className={cn(
                                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                sort === 'popular' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <TrendingUp size={12} />
                            Popular
                        </button>
                    </div>

                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Search scams..."
                        className="md:w-[240px]"
                    />
                </div>
            </header>

            {/* Category Pills */}
            <ScrollArea className="w-full whitespace-nowrap -mx-2 px-2">
                <div className="flex gap-2 pb-2">
                    <button
                        onClick={() => setSelectedCategory(undefined)}
                        className={cn(
                            'flex-shrink-0 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all',
                            !selectedCategory
                                ? 'bg-cyan-400 text-white shadow-lg shadow-cyan-400/20'
                                : 'bg-white border border-gray-300 text-gray-400 hover:bg-gray-50',
                        )}
                    >
                        All Scams
                    </button>
                    {categories?.map((cat: any) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                'flex-shrink-0 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2',
                                selectedCategory === cat.id
                                    ? 'bg-cyan-400 text-white shadow-lg shadow-cyan-400/20'
                                    : 'bg-white border border-gray-300 text-gray-400 hover:bg-gray-50',
                            )}
                        >
                            {cat.name}
                            {cat._count?.scamAlerts > 0 && (
                                <span
                                    className={cn(
                                        'px-1.5 py-0.5 rounded-md text-[9px]',
                                        selectedCategory === cat.id
                                            ? 'bg-white/20 text-white'
                                            : 'bg-gray-100 text-gray-400',
                                    )}
                                >
                                    {cat._count.scamAlerts}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>

            {/* List of Alerts */}
            <div className="flex flex-col gap-4 pt-2">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-28 bg-white rounded-[28px] border border-gray-200 shadow-sm animate-pulse flex overflow-hidden"
                        >
                            <div className="w-36 shrink-0 bg-gray-100" />
                            <div className="flex-1 p-5 space-y-3">
                                <div className="h-3 w-24 bg-gray-100 rounded-full" />
                                <div className="h-4 w-3/4 bg-gray-100 rounded-full" />
                                <div className="h-3 w-full bg-gray-100 rounded-full" />
                            </div>
                        </div>
                    ))
                ) : alerts && alerts.length > 0 ? (
                    <>
                        {alerts.map((alert: any) => (
                            <ScamAlertCard key={alert.id} alert={alert} />
                        ))}
                        
                        {/* Load More Trigger */}
                        <div ref={ref} className="py-8 flex justify-center">
                            {isFetchingNextPage ? (
                                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                            ) : hasNextPage ? (
                                <div className="h-1" />
                            ) : (
                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">
                                    — You've reached the end —
                                </p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="py-32 text-center space-y-4 bg-white rounded-[28px] border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto text-gray-200">
                            <AlertTriangle size={32} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xl font-black text-gray-900 uppercase italic tracking-tight">
                                Zero alerts reported
                            </h4>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                It's quiet for now. Stay vigilant regardless!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
