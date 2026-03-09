'use client';

import {
    Zap,
    ArrowRight,
    MapPin,
    Navigation,
    Hash,
    Trophy,
} from 'lucide-react';
import { useSpots, useScamAlerts, useLiveVibes, useNearbySpots, useCategories } from '@/hooks/use-api';
import { useVoteToggle } from '@/hooks/use-vote-toggle';
import { useGeolocation } from '@/hooks/use-geolocation';
import SpotCard from '@/components/spots/spot-card';
import { LeaderboardList } from '@/components/leaderboard-list';
import ScamDetailsModal from '@/components/scams/scam-details-modal';
import ScamAlertCard from '@/components/scams/scam-alert-card';
import { cn } from '@/lib/utils';
import { useCity } from '@/components/providers/city-provider';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { useState } from 'react';

export default function HomeFeed() {
    const { selectedCityId, selectedCity } = useCity();
    const { latitude, longitude, error: geoError } = useGeolocation();
    const [selectedAlert, setSelectedAlert] = useState<any>(null);

    const { data: nearbySpots, isLoading: nearbyLoading } = useNearbySpots({
        latitude: latitude || 0,
        longitude: longitude || 0,
        distance: 5,
    }, !!(latitude && longitude));

    const { data: categories } = useCategories();

    const { data: spots, isLoading: spotsLoading } = useSpots({
        cityId: selectedCityId,
        sort: 'popular',
    });

    const { data: scamAlerts, isLoading: scamAlertsLoading } = useScamAlerts({
        cityId: selectedCityId,
    });

    const { data: vibes, isLoading: vibesLoading } = useLiveVibes();

    return (
        <div className="space-y-16">
            {/* 0. Nearby Pulse */}
            {latitude && longitude ? (
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

                    <ScrollArea className="w-full whitespace-nowrap -mx-8">
                        <div className="flex gap-6 pb-8 px-8">
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
            ) : (
                <section className="space-y-4">
                    <header className="px-2">
                        <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">Nearby Pulse</h2>
                    </header>
                    <div className="flex items-center gap-4 bg-white/5 border border-dashed border-white/10 rounded-2xl p-6">
                        <div className="w-10 h-10 rounded-2xl bg-amber-400/10 flex items-center justify-center shrink-0">
                            <Navigation size={18} className="text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground">Enable Location for Nearby Pulse</p>
                            <p className="text-[11px] text-white/40 font-medium mt-0.5">Allow location access in your browser to see spots near you</p>
                        </div>
                    </div>
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
                    <Link href="/spots" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors group">
                        All Spots
                        <ArrowRight
                            size={14}
                            className="group-hover:translate-x-1 transition-transform"
                        />
                    </Link>
                </header>

                <ScrollArea className="w-full whitespace-nowrap -mx-8">
                    <div className="flex gap-6 pb-8 px-8">
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
                    <header className="flex items-end justify-between px-2">
                        <div className="flex flex-col gap-1">
                            <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
                                The Pulse
                            </h2>
                            <p className="text-white/40 font-medium uppercase tracking-widest text-[10px]">
                                What is happening in {selectedCity?.name || 'this city'} right now
                            </p>
                        </div>
                        <Link href="/scam-alerts" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors group">
                            View All
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </header>

                    <div className="space-y-4">
                        {scamAlertsLoading ? (
                            Array.from({ length: 2 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-44 bg-white/5 rounded-2xl animate-pulse"
                                />
                            ))
                        ) : Array.isArray(scamAlerts) && scamAlerts.length > 0 ? (
                            scamAlerts.map((alert: any) => (
                                <ScamAlertCard
                                    key={alert.id}
                                    alert={alert}
                                    onClick={() => setSelectedAlert(alert)}
                                />
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
                                <Link
                                    key={vibe.id}
                                    href={`/spots/${vibe.spotId || vibe.spot?.id}`}
                                    className="block bg-card rounded-2xl p-7 border border-white/8 shadow-xl shadow-black/30 group hover:scale-[1.01] transition-transform"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
                                            <Zap size={16} fill="currentColor" />
                                            Live Vibe
                                        </div>
                                        <span
                                            className="text-white/40 font-bold text-[10px] uppercase tracking-tighter"
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
                                        <div className="bg-white/10 text-white/60 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/5">
                                            {vibe.waitTimeMinutes}m Wait
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : !vibesLoading ? (
                            <div className="py-12 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                    No vibes checked in recently
                                </p>
                            </div>
                        ) : null}
                    </div>
                </section>

                {/* 3. Mobile Trending & Contributors (Only on small screens) */}
                <div className="lg:hidden space-y-12 pb-12">
                    {/* Categories Carousel */}
                    <section className="space-y-6">
                        <header className="px-2">
                            <h4 className="font-display text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                                <Hash size={20} className="text-amber-400" />
                                Browse by Category
                            </h4>
                        </header>
                        <ScrollArea className="w-full whitespace-nowrap -mx-8">
                            <div className="flex gap-4 pb-4 px-8">
                                {Array.isArray(categories) && categories.map((cat: any) => (
                                    <Link
                                        key={cat.id}
                                        href={`/spots?categoryId=${cat.id}`}
                                        className="flex-shrink-0 bg-card px-6 py-4 rounded-2xl border border-white/8 shadow-xl shadow-black/30 flex flex-col gap-1 active:scale-95 transition-transform"
                                    >
                                        <span className="text-sm font-bold text-foreground">
                                            {cat.name}
                                        </span>
                                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                                            Explore
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
                        <LeaderboardList />
                    </section>
                </div>
            </div>

            {selectedAlert && (
                <ScamDetailsModal
                    alert={selectedAlert}
                    onClose={() => setSelectedAlert(null)}
                />
            )}
        </div>
    );
}
