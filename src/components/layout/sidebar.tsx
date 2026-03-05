'use client';

import Link from 'next/link';
import { MapPin, Navigation, ArrowUpRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCity } from '@/components/providers/city-provider';

export default function Sidebar() {
    const pathname = usePathname();
    const { selectedCity } = useCity();
    const isDiscovery = pathname?.includes('/discovery');

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

    return (
        <aside className="hidden lg:flex flex-col gap-8 w-80 min-h-screen px-6 py-10 sticky top-20">
            {/* 2. Trending Section */}
            <div>
                <h4 className="font-bold text-xs uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Trending in {selectedCity?.name || 'BKK'}
                </h4>
                <div className="space-y-4">
                    {hashtags.map(({ tag, count }) => (
                        <Link
                            key={tag}
                            href={`/search?q=${tag}`}
                            className="flex items-center justify-between group"
                        >
                            <span className="text-sm font-medium text-white/60 group-hover:text-amber-400 transition-colors">
                                #{tag}
                            </span>
                            <span className="text-[10px] font-bold tracking-tighter text-white/20 group-hover:text-amber-400/60 transition-colors">
                                {count}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="w-full h-px bg-white/8" />

            {/* 3. Top Contributors */}
            <div>
                <h4 className="font-bold text-xs uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Top Contributors
                </h4>
                <div className="space-y-5">
                    {topContributors.map((c) => (
                        <div key={c.name} className="flex items-center gap-3">
                            <div
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${c.color} shadow-sm`}
                            >
                                {c.name.charAt(1).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-foreground leading-tight">
                                    {c.name}
                                </span>
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">
                                    {c.rep} XP
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-auto bg-white/5 p-6 rounded-3xl border border-dashed border-white/10">
                <h5 className="font-semibold text-sm mb-2 text-foreground">
                    {selectedCity?.name || 'Bangkok'} is changing fast.
                </h5>
                <p className="text-[11px] font-medium text-white/40 leading-relaxed">
                    Your reports help others navigate the city with confidence and honesty. Keep at
                    it!
                </p>
            </div>
        </aside>
    );
}
