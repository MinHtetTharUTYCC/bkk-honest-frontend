'use client';

import Link from 'next/link';
import { MapPin, ArrowUpRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCity } from '@/components/providers/city-provider';
import { useCategories } from '@/hooks/use-api';
import { LeaderboardSidebarList } from '@/components/leaderboard-list';

export default function Sidebar() {
    const pathname = usePathname();
    const { selectedCity } = useCity();
    const { data: categories } = useCategories();
    const isDiscovery = pathname?.includes('/spots');
    const isSpotDetail = pathname?.startsWith('/spots/');
    const isMap = pathname === '/map';

    if (isSpotDetail || isMap) return null;

    return (
        <aside className="hidden lg:flex flex-col gap-8 w-80 min-h-screen px-6 py-10 sticky top-20">
            {/* Categories */}
            <div>
                <h4 className="font-bold text-xs uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Browse Categories
                </h4>
                <div className="space-y-4">
                    {Array.isArray(categories) && categories.slice(0, 6).map((cat: any) => (
                        <Link
                            key={cat.id}
                            href={`/spots?categoryId=${cat.id}`}
                            className="flex items-center justify-between group"
                        >
                            <span className="text-sm font-medium text-white/60 group-hover:text-amber-400 transition-colors">
                                {cat.name}
                            </span>
                            <ArrowUpRight size={12} className="text-white/20 group-hover:text-amber-400/60 transition-colors" />
                        </Link>
                    ))}
                </div>
            </div>

            <div className="w-full h-px bg-white/8" />

            {/* Top Contributors */}
            <div>
                <h4 className="font-bold text-xs uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Top Contributors
                </h4>
                <LeaderboardSidebarList take={5} />
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
