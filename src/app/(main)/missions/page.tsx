'use client';

import { useMissions, useMissionStats, useUpdateMission, useDeleteMission } from '@/hooks/use-api';
import { Target, CheckCircle2, Circle, MapPin, Trash2, Loader2, ArrowRight, Zap, Trophy, Filter, SortAsc, SortDesc } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useCity } from '@/components/providers/city-provider';
import { getSpotUrl } from '@/lib/slug';
import { useAuth } from '@/components/providers/auth-provider';
import { useRouter, usePathname } from 'next/navigation';

export default function MissionsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
        }
    }, [user, authLoading, router, pathname]);
    const { selectedCity } = useCity();
    const { 
        data: missionsData, 
        isLoading: missionsLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useMissions();
    const { data: stats } = useMissionStats();
    
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('pending');

    const updateMission = useUpdateMission();
    const deleteMission = useDeleteMission();

    const observerTarget = useRef(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Helper to manually remove item from local list on delete success
    const handleRemoveLocally = (id: string) => {
        if (confirm('Remove mission?')) {
            deleteMission.mutate(id);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );
        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const missions = useMemo(() => {
        let list = missionsData?.pages.flatMap(page => page.data || []) || [];
        
        // Filter by status
        if (statusFilter === 'pending') {
            list = list.filter(m => !m.completed);
        } else if (statusFilter === 'completed') {
            list = list.filter(m => m.completed);
        }

        // Sort by date
        list.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return list;
    }, [missionsData, sortOrder, statusFilter]);
    const completedCount = stats?.completed || 0;
    const totalCount = stats?.total || 0;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    if (authLoading || !user) {
        return (
            <div className="space-y-12 animate-pulse">
                <div className="h-64 bg-white/5 rounded-2xl" />
                <div className="h-96 bg-white/5 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-24">
            {/* 1. Progress Header */}
            <header className="relative bg-gray-900 rounded-[40px] p-8 md:p-12 overflow-hidden shadow-2xl shadow-gray-900/20">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Trophy size={160} className="text-amber-400 rotate-12" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="bg-amber-400 text-black px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                                Active Missions
                            </span>
                        </div>
                        <h1 className="font-display text-4xl md:text-6xl font-bold text-white tracking-tight">
                            {selectedCity?.name || 'Bangkok'} <span className="text-amber-400">Scout</span>
                        </h1>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                            Complete missions and enjoy your stay
                        </p>
                    </div>

                    <div className="w-full md:w-64 space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Progress</span>
                            <span className="text-2xl font-black text-white italic">{completedCount}/{totalCount}</span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/10">
                            <div 
                                className="h-full bg-amber-400 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(251,191,36,0.4)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. Missions List */}
            <div className="space-y-6">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <div className="flex items-center gap-3">
                        <Target size={20} className="text-amber-400" />
                        <h3 className="font-display text-2xl font-bold text-foreground tracking-tight">Current Missions</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* Status Tabs */}
                        <div className="flex bg-white/8 p-1 rounded-xl border border-white/10">
                            <button 
                                onClick={() => setStatusFilter('pending')}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                    statusFilter === 'pending' ? "bg-amber-400 text-black shadow-sm" : "text-white/40"
                                )}
                            >
                                Active
                            </button>
                            <button 
                                onClick={() => setStatusFilter('completed')}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                    statusFilter === 'completed' ? "bg-emerald-400 text-black shadow-sm" : "text-white/40"
                                )}
                            >
                                Completed
                            </button>
                            <button 
                                onClick={() => setStatusFilter('all')}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                    statusFilter === 'all' ? "bg-white/15 text-foreground shadow-sm" : "text-white/40"
                                )}
                            >
                                All
                            </button>
                        </div>

                        {/* Sort Toggle */}
                        <button 
                            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/8 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:bg-white/12 transition-all"
                        >
                            {sortOrder === 'newest' ? <SortDesc size={14} /> : <SortAsc size={14} />}
                            {sortOrder}
                        </button>
                    </div>
                </header>

                {missions.length === 0 ? (
                    <div className="py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/8 flex items-center justify-center text-white/20">
                                <Zap size={24} />
                            </div>
                            <div className="space-y-1">
                                <p className="font-display text-sm font-bold text-foreground">No missions accepted</p>
                                <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">Find a spot on the map and add it to your missions</p>
                            </div>
                            <Link 
                                href="/spots" 
                                className="mt-4 bg-amber-400 text-black px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-300 transition-all active:scale-95 flex items-center gap-2"
                            >
                                Explore {selectedCity?.name || 'City'} <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {missions.map((mission: any) => (
                            <div 
                                key={mission.id}
                                className={cn(
                                    "group relative bg-card p-6 md:p-8 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden",
                                    mission.completed 
                                        ? "border-emerald-500/20 bg-emerald-400/5" 
                                        : "border-white/8 shadow-xl shadow-black/20 hover:border-amber-400/30"
                                )}
                            >
                                <div className="flex items-center gap-6">
                                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                                        <img 
                                            src={mission.spot?.imageUrl || 'https://images.unsplash.com/photo-1563245394-5b95b8022a4d?auto=format&fit=crop&q=80&w=200'} 
                                            alt={mission.spot?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className={cn(
                                            "font-display text-xl md:text-2xl font-bold tracking-tight leading-none",
                                            mission.completed ? "text-emerald-400/50 line-through" : "text-foreground"
                                        )}>
                                            {mission.spot?.name}
                                        </h4>
                                        <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest flex items-center gap-1">
                                            <MapPin size={10} /> {mission.spot?.name} Area
                                        </p>
                                        <div className="pt-2 flex gap-2">
                                            <Link 
                                                href={getSpotUrl(mission.spot?.city?.name || 'Bangkok', mission.spot?.name || '')}
                                                className="text-[9px] font-bold text-amber-400 uppercase tracking-widest hover:underline flex items-center gap-1"
                                            >
                                                View Spot <ArrowRight size={10} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => updateMission.mutate({ id: mission.id, completed: !mission.completed })}
                                        disabled={updateMission.isPending}
                                        className={cn(
                                            "flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg",
                                            mission.completed
                                                ? "bg-emerald-400 text-black shadow-emerald-400/20"
                                                : "bg-white/8 text-white/40 hover:bg-white/15 hover:text-white border border-white/8"
                                        )}
                                    >
                                        {updateMission.isPending ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : mission.completed ? (
                                            <>
                                                <CheckCircle2 size={16} strokeWidth={3} />
                                                Completed
                                            </>
                                        ) : (
                                            <>
                                                <Circle size={16} strokeWidth={3} />
                                                Mark Done
                                            </>
                                        )}
                                    </button>
                                    
                                    <button 
                                        onClick={() => handleRemoveLocally(mission.id)}
                                        disabled={deleteMission.isPending}
                                        className="p-4 rounded-2xl bg-red-400/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-400/20"
                                    >
                                        {deleteMission.isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {/* Infinite Scroll Target */}
                        <div ref={observerTarget} className="py-12 flex justify-center">
                            {isFetchingNextPage ? (
                                <Loader2 size={24} className="text-amber-400 animate-spin" />
                            ) : hasNextPage ? (
                                <div className="h-4 w-4" />
                            ) : missions.length > 0 ? (
                                <p className="text-[10px] font-medium text-white/20 uppercase tracking-widest">End of missions</p>
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
