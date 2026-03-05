'use client';

import {
    Zap,
    AlertCircle,
    MessageCircle,
    ArrowRight,
    MapPin,
    TrendingUp,
    Navigation,
    Heart,
    Hash,
    Trophy,
} from 'lucide-react';
import { useSpots, useScamAlerts, useLiveVibes, useNearbySpots } from '@/hooks/use-api';
import { useVoteToggle } from '@/hooks/use-vote-toggle';
import { useGeolocation } from '@/hooks/use-geolocation';
import SpotCard from '@/components/spots/spot-card';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useCity } from '@/components/providers/city-provider';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import Link from 'next/link';

export default function HomeFeed() {
    const { selectedCityId, selectedCity } = useCity();
    const { toggleVote, isPending: votePending } = useVoteToggle('alert');
    const { latitude, longitude, error: geoError } = useGeolocation();

    const hashtags = [
        { tag: 'SongkranPrep', count: '1.2k' },
        { tag: 'TukTukRates', count: '850' },
        { tag: 'MichelinStreetFood', count: '2.4k' },
        { tag: 'SukhumvitTraffic', count: '5.1k' },
    ];

    const topContributors = [
        { name: '@LocalGuru_Aum', rep: '5,430', color: 'bg-amber-400/15 text-amber-300' },
        { name: '@BkkNomad', rep: '3,210', color: 'bg-emerald-400/15 text-emerald-400' },
        { name: '@NanaGuide', rep: '2,950', color: 'bg-orange-400/15 text-orange-400' },
    ];

    const { data: nearbySpots, isLoading: nearbyLoading } = useNearbySpots({
        latitude: latitude || 0,
        longitude: longitude || 0,
        distance: 5,
    });

    const { data: spots, isLoading: spotsLoading } = useSpots({
        cityId: selectedCityId,
        sort: 'popular',
    });

    const { data: scamAlerts, isLoading: scamAlertsLoading } = useScamAlerts({
        cityId: selectedCityId,
    });

    const { data: vibes, isLoading: vibesLoading } = useLiveVibes();

    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return <div className="animate-pulse h-screen bg-white/5 rounded-2xl" />;

    return (
        <div className="space-y-16">
            {/* 0. Nearby Pulse */}
            {!geoError && latitude && longitude && (
                <section className="space-y-8">
                    <header className="flex items-end justify-between px-2">
                        <div className="flex flex-col gap-1">
                            <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
                                Nearby Pulse
                            </h2>
                            <div className="flex items-center gap-1.5">
                                <Navigation size={10} className="text-amber-400" />
                                <p className="text-white/40 font-medium uppercase tracking-widest text-[10px]">
                                    What is around you right now
                                </p>
                            </div>
                        </div>
                    </header>

                    <ScrollArea className="w-full whitespace-nowrap -mx-8 px-8">
                        <div className="flex gap-6 pb-8">
                            {nearbyLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="shrink-0 w-72 h-85 bg-white/5 rounded-2xl animate-pulse"
                                    />
                                ))
                            ) : Array.isArray(nearbySpots) && nearbySpots.length > 0 ? (
                                nearbySpots.map((spot: any) => (
                                    <div key={spot.id} className="w-72 shrink-0">
                                        <SpotCard spot={spot} />
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center w-full bg-white/5 rounded-2xl border border-dashed border-white/10">
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                        No spots found within 5km
                                    </p>
                                </div>
                            )}
                        </div>
                        <ScrollBar orientation="horizontal" className="hidden" />
                    </ScrollArea>
                </section>
            )}

            {/* 1. Honest Highlights (Popular Spots) */}
            <section className="space-y-8">
                <header className="flex items-end justify-between px-2">
                    <div className="flex flex-col gap-1">
                        <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
                            Honest Highlights
                        </h2>
                        <div className="flex items-center gap-1.5">
                            <MapPin size={10} className="text-amber-400" />
                            <p className="text-white/40 font-medium uppercase tracking-widest text-[10px]">
                                Verified fair prices in {selectedCity?.name || 'Thailand'}
                            </p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors group">
                        All Spots
                        <ArrowRight
                            size={14}
                            className="group-hover:translate-x-1 transition-transform"
                        />
                    </button>
                </header>

                <ScrollArea className="w-full whitespace-nowrap -mx-8 px-8">
                    <div className="flex gap-6 pb-8">
                        {spotsLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex-shrink-0 w-72 h-[340px] bg-white/5 rounded-2xl animate-pulse"
                                />
                            ))
                        ) : Array.isArray(spots) && spots.length > 0 ? (
                            spots.map((spot: any) => (
                                <div key={spot.id} className="w-72 flex-shrink-0">
                                    <SpotCard spot={spot} />
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center w-full bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                    No spots shared in {selectedCity?.name || 'this city'} yet
                                </p>
                            </div>
                        )}
                    </div>
                    <ScrollBar orientation="horizontal" className="hidden" />
                </ScrollArea>
            </section>

            {/* 2. The Pulse (Scam Alerts & Vibes) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <section className="lg:col-span-2 space-y-8">
                    <header className="flex flex-col gap-1 px-2">
                        <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
                            The Pulse
                        </h2>
                        <p className="text-white/40 font-medium uppercase tracking-widest text-[10px]">
                            What is happening in {selectedCity?.name || 'this city'} right now
                        </p>
                    </header>

                    <div className="space-y-6">
                        {scamAlertsLoading ? (
                            Array.from({ length: 2 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-64 bg-white/5 rounded-2xl animate-pulse"
                                />
                            ))
                        ) : Array.isArray(scamAlerts) && scamAlerts.length > 0 ? (
                            scamAlerts.map((alert: any) => (
                                <div
                                    key={alert.id}
                                    className="bg-card rounded-2xl p-7 border border-white/8 shadow-xl shadow-black/30 group hover:scale-[1.01] transition-transform"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-widest">
                                            <AlertCircle size={16} strokeWidth={3} />
                                            Scam Alert
                                        </div>
                                        <span
                                            className="text-white/20 font-bold text-[10px] uppercase tracking-tighter"
                                            suppressHydrationWarning
                                        >
                                            {new Date(alert.createdAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}{' '}
                                            • {alert.city?.name}
                                        </span>
                                    </div>
                                    <h3 className="font-display text-xl font-bold text-foreground mb-2 leading-tight">
                                        {alert.scamName}
                                    </h3>
                                    <p className="text-white/60 font-medium leading-relaxed mb-6 line-clamp-3">
                                        {alert.description}
                                    </p>
                                    <div className="flex items-center gap-4 border-t border-white/8 pt-6">
                                        <div className="flex bg-white/8 p-1 rounded-xl border border-white/8">
                                            <button
                                                onClick={() => toggleVote(alert)}
                                                disabled={votePending}
                                                className={cn(
                                                    'flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all',
                                                    alert.hasVoted
                                                        ? 'bg-red-400/10 text-red-400 shadow-sm'
                                                        : 'text-white/30 hover:text-red-400',
                                                )}
                                            >
                                                <Heart
                                                    size={12}
                                                    fill={alert.hasVoted ? 'currentColor' : 'none'}
                                                />
                                                {alert._count?.votes || 0}
                                            </button>
                                        </div>
                                        <button className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/30 hover:text-amber-400 transition-colors">
                                            <MessageCircle size={14} />
                                            {alert._count?.comments || 0} Comments
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                    All clear in {selectedCity?.name || 'the city'}. No active scams
                                    reported.
                                </p>
                            </div>
                        )}

                        {vibesLoading ? (
                            <div className="h-40 bg-white/5 rounded-2xl animate-pulse" />
                        ) : Array.isArray(vibes) && vibes.length > 0 ? (
                            vibes.slice(0, 3).map((vibe: any) => (
                                <div
                                    key={vibe.id}
                                    className="bg-card rounded-2xl p-7 border border-white/8 shadow-xl shadow-black/30 group hover:scale-[1.01] transition-transform"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
                                            <Zap size={16} fill="currentColor" />
                                            Live Vibe
                                        </div>
                                        <span
                                            className="text-white/20 font-bold text-[10px] uppercase tracking-tighter"
                                            suppressHydrationWarning
                                        >
                                            {new Date(vibe.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}{' '}
                                            • {vibe.spot?.name}
                                        </span>
                                    </div>
                                    <h3 className="font-display text-xl font-bold text-foreground mb-2 leading-tight">
                                        {vibe.crowdLevel >= 4
                                            ? 'Very Crowded'
                                            : vibe.crowdLevel >= 3
                                              ? 'Medium Crowd'
                                              : 'Quiet & Chill'}
                                    </h3>
                                    <p className="text-white/60 font-medium leading-relaxed mb-6">
                                        Crowd level: {vibe.crowdLevel}/5. Wait time:{' '}
                                        {vibe.waitTimeMinutes} mins.
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                'px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase',
                                                vibe.crowdLevel >= 4
                                                    ? 'bg-orange-400/10 text-orange-400'
                                                    : 'bg-amber-400/10 text-amber-400',
                                            )}
                                        >
                                            {vibe.crowdLevel >= 4 ? 'Busy' : 'Available'}
                                        </div>
                                        <div className="bg-white/5 text-white/40 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase">
                                            {vibe.waitTimeMinutes}m Wait
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : null}
                    </div>
                </section>

                {/* 3. Mobile Trending & Contributors (Only on small screens) */}
                <div className="lg:hidden space-y-12 pb-12">
                    {/* Trending Carousel */}
                    <section className="space-y-6">
                        <header className="px-2">
                            <h4 className="font-display text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                                <Hash size={20} className="text-amber-400" />
                                Trending Pulse
                            </h4>
                        </header>
                        <ScrollArea className="w-full whitespace-nowrap -mx-8 px-8">
                            <div className="flex gap-4 pb-4">
                                {hashtags.map(({ tag, count }) => (
                                    <Link
                                        key={tag}
                                        href={`/search?q=${tag}`}
                                        className="flex-shrink-0 bg-card px-6 py-4 rounded-2xl border border-white/8 shadow-xl shadow-black/30 flex flex-col gap-1 active:scale-95 transition-transform"
                                    >
                                        <span className="text-sm font-bold text-foreground">
                                            #{tag}
                                        </span>
                                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                                            {count} reports
                                        </span>
                                    </Link>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" className="hidden" />
                        </ScrollArea>
                    </section>

                    {/* Top Contributors Carousel */}
                    <section className="space-y-6">
                        <header className="px-2">
                            <h4 className="font-display text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                                <Trophy size={20} className="text-amber-400" />
                                Local Gurus
                            </h4>
                        </header>
                        <ScrollArea className="w-full whitespace-nowrap -mx-8 px-8">
                            <div className="flex gap-4 pb-4">
                                {topContributors.map((c) => (
                                    <div
                                        key={c.name}
                                        className="flex-shrink-0 bg-card p-5 rounded-2xl border border-white/8 shadow-xl shadow-black/30 flex items-center gap-4 min-w-[200px]"
                                    >
                                        <div
                                            className={cn(
                                                'w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm',
                                                c.color,
                                            )}
                                        >
                                            {c.name.charAt(1).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-foreground">
                                                {c.name}
                                            </span>
                                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                                                {c.rep} XP
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" className="hidden" />
                        </ScrollArea>
                    </section>
                </div>
            </div>
        </div>
    );
}
