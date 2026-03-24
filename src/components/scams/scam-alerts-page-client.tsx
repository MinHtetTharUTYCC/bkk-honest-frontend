'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useInfiniteScamAlerts, useCategories } from '@/hooks/use-api';
import { SearchInput } from '@/components/ui/search-input';
import ScamAlertCard from '@/components/scams/scam-alert-card';
import { AlertTriangle, MapPin, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCity } from '@/components/providers/city-provider';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useInView } from 'react-intersection-observer';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CategorySelector } from '@/components/ui/category-selector';

export default function ScamAlertsPageClient() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Initialize from URL
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
        searchParams.get('categoryId') || searchParams.get('category') || undefined,
    );
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [sort, setSort] = useState<'newest' | 'popular'>(
        (searchParams.get('sort') as 'newest' | 'popular') || 'newest',
    );

    const { selectedCityId, selectedCity } = useCity();
    const [isClient, setIsClient] = useState(false);
    const { ref, inView } = useInView();

    // Function to update URL params
    const createQueryString = useCallback(
        (params: Record<string, string | null>) => {
            const newSearchParams = new URLSearchParams(searchParams.toString());

            Object.entries(params).forEach(([name, value]) => {
                if (value === null || value === undefined) {
                    newSearchParams.delete(name);
                } else {
                    newSearchParams.set(name, value);
                }
            });

            return newSearchParams.toString();
        },
        [searchParams],
    );

    // Sync URL when filters change (except search which is handled by debounce)
    const handleCategoryChange = (catId: string | undefined) => {
        setSelectedCategory(catId);
        router.push(pathname + '?' + createQueryString({ 
            categoryId: catId || null,
            category: null // Cleanup old param
        }), {
            scroll: false,
        });
    };

    const handleSortChange = (newSort: 'newest' | 'popular') => {
        setSort(newSort);
        router.push(pathname + '?' + createQueryString({ sort: newSort }), { scroll: false });
    };

    // Debounce search URL update
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (searchParams.get('q') || '')) {
                router.push(pathname + '?' + createQueryString({ q: search || null }), {
                    scroll: false,
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search, pathname, createQueryString, searchParams]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const { data: categoriesResponse } = useCategories();
    const categories = categoriesResponse?.data || categoriesResponse || [];

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfiniteScamAlerts({
            cityId: selectedCityId,
            categoryId: selectedCategory,
            sort,
            search,
        });

    const hasFetchedRef = useRef(false);

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

    if (!isClient) return null;

    const alerts = data?.pages.flatMap((page) => page.data) || [];

    return (
        <div className="space-y-6 pb-24">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-0.5">
                    <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
                        Scam Alerts
                    </h1>
                    <div className="flex items-center gap-2">
                        <MapPin size={10} className="text-amber-400" />
                        <p className="text-white/60 font-bold uppercase tracking-widest text-[11px]">
                            Real-time Warnings in {selectedCity?.name || 'Thailand'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Sort Toggle */}
                    <div className="flex bg-white/8 p-1 rounded-2xl w-full sm:w-auto">
                        <button
                            onClick={() => handleSortChange('newest')}
                            className={cn(
                                'flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer',
                                sort === 'newest'
                                    ? 'bg-white/10 text-foreground shadow-sm'
                                    : 'text-white/40 hover:text-white/70',
                            )}
                        >
                            <Clock size={12} />
                            Newest
                        </button>
                        <button
                            onClick={() => handleSortChange('popular')}
                            className={cn(
                                'flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer',
                                sort === 'popular'
                                    ? 'bg-white/10 text-foreground shadow-sm'
                                    : 'text-white/40 hover:text-white/70',
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
                        className="md:w-60"
                    />
                </div>
            </header>

            {/* Category Pills */}
            <CategorySelector 
                categories={categories}
                selectedId={selectedCategory}
                onSelect={handleCategoryChange}
                allLabel="All Scams"
                countKey="scamAlerts"
                className="-mx-2 px-2"
            />

            {/* List of Alerts */}
            <div className="flex flex-col gap-4 pt-2">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-28 bg-card rounded-2xl border border-white/8 shadow-sm animate-pulse flex overflow-hidden"
                        >
                            <div className="w-36 shrink-0 bg-white/5" />
                            <div className="flex-1 p-5 space-y-3">
                                <div className="h-3 w-24 bg-white/5 rounded-full" />
                                <div className="h-4 w-3/4 bg-white/5 rounded-full" />
                                <div className="h-3 w-full bg-white/5 rounded-full" />
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
                                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                            ) : hasNextPage ? (
                                <div className="h-1" />
                            ) : (
                                <p className="text-[12px] font-bold text-white/50 uppercase tracking-[0.2em]">
                                    — You've reached the end —
                                </p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="py-32 text-center space-y-4 bg-card rounded-2xl border border-dashed border-white/10">
                        <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-white/15">
                            <AlertTriangle size={32} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-display text-xl font-bold text-foreground tracking-tight">
                                Zero alerts reported
                            </h4>
                            <p className="text-xs text-white/50 font-medium">
                                It's quiet for now. Stay vigilant regardless!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
