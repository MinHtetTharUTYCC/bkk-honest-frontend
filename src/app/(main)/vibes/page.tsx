'use client';
import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { Zap, MapPin, Loader2, ArrowLeft, Filter, Search } from 'lucide-react';
import Link from 'next/link';
import { useInfiniteLiveVibes, useCategories } from '@/hooks/use-api';
import { useCity } from '@/components/providers/city-provider';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getSpotUrl } from '@/lib/slug';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { CategorySelector } from '@/components/ui/category-selector';

function VibesPageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { selectedCityId, selectedCity } = useCity();
    const { data: categoriesResponse } = useCategories();
    const categories = categoriesResponse?.data || categoriesResponse || [];
    
    // Initialize from URL
    const [selectedCategory, setSelectedCategory] = useState<string>(
        searchParams.get('categoryId') || searchParams.get('category') || ''
    );

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
        [searchParams]
    );

    const handleCategoryChange = (catId: string) => {
        setSelectedCategory(catId);
        router.push(pathname + '?' + createQueryString({ 
            categoryId: catId || null,
            category: null // Cleanup old param
        }), { scroll: false });
    };

    const {
        data: vibesData,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteLiveVibes({ 
        cityId: selectedCityId, 
        categoryId: selectedCategory as any
    });

    const vibes = vibesData?.pages.flatMap(page => page.data || []) || [];

    // Intersection Observer for Infinite Scroll
    const { ref: observerTarget, inView } = useInView({ threshold: 0.1 });
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

    return (
        <div className="space-y-8 pb-24">
            <header className="space-y-6">
                <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-white/50 hover:text-amber-400 transition-colors">
                    <ArrowLeft size={14} strokeWidth={3} />
                    Back to Feed
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight drop-shadow-sm">
                            Live Vibes
                        </h1>
                        <p className="text-white/40 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                            <Zap size={14} strokeWidth={3} className="text-amber-400" />
                            What is the vibe in {selectedCity?.name || 'the city'} right now
                        </p>
                    </div>
                </div>
            </header>

            {/* Filters */}
            <CategorySelector 
                categories={categories}
                selectedId={selectedCategory}
                onSelect={(id) => handleCategoryChange(id || '')}
                allLabel="All Vibes"
            />

            {/* Vibes List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse" />
                    ))
                ) : vibes.length > 0 ? (
                    vibes.map((vibe: any) => (
                        <Link
                            key={vibe.id}
                            href={getSpotUrl(vibe.spot?.city?.slug || 'bangkok', vibe.spot?.slug || '')}
                            className="group relative bg-card rounded-3xl p-8 border border-white/8 shadow-2xl shadow-black/40 hover:scale-[1.02] transition-all duration-500 overflow-hidden"
                        >
                            {/* Accent Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 blur-3xl -mr-16 -mt-16 group-hover:bg-amber-400/10 transition-colors" />

                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
                                    <Zap size={18} fill="currentColor" />
                                    Live Pulse
                                </div>
                                <span className="text-white/40 font-bold text-[10px] uppercase tracking-tighter bg-white/5 px-3 py-1.5 rounded-xl border border-white/5" suppressHydrationWarning>
                                    {new Date(vibe.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-display text-2xl font-bold text-foreground leading-tight group-hover:text-amber-400 transition-colors">
                                    {vibe.spot?.name}
                                </h3>

                                <div className="flex flex-wrap gap-2">
                                    <div className={cn(
                                        'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors',
                                        vibe.crowdLevel >= 4
                                            ? 'bg-orange-400/10 border-orange-400/20 text-orange-400'
                                            : 'bg-amber-400/10 border-amber-400/20 text-amber-400',
                                    )}>
                                        {vibe.crowdLevel >= 4
                                            ? 'Packed'
                                            : vibe.crowdLevel >= 3
                                              ? 'Busy'
                                              : 'Quiet'}
                                    </div>
                                    <div className="bg-white/5 border border-white/10 text-white/60 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                        {vibe.waitTimeMinutes}m wait
                                    </div>
                                </div>

                                <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 pt-4 border-t border-white/5">
                                    <MapPin size={12} className="text-amber-400" />
                                    {vibe.spot?.address?.split(',')[0]}
                                </p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <Zap size={48} className="text-white/10 mx-auto mb-6" />
                        <h3 className="text-xl font-display font-bold text-white/40 uppercase tracking-widest">
                            No vibes found
                        </h3>
                        <p className="text-xs text-white/50 mt-2 font-medium">Try selecting a different category</p>
                    </div>
                )}
            </div>

            {/* Loading Spinner for Infinite Scroll */}
            <div ref={observerTarget} className="flex justify-center py-12">
                {isFetchingNextPage && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 size={32} className="animate-spin text-amber-400" />
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                            Syncing Pulse...
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}


export default function VibesPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-screen bg-white/5 rounded-2xl m-4" />}>
      <VibesPageContent  />
    </Suspense>
  );
}
