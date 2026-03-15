'use client';

import { useLeaderboard } from '@/hooks/use-api';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import Link from 'next/link';

const LEVEL_COLORS = ['bg-amber-400/15 text-amber-300', 'bg-emerald-400/15 text-emerald-400', 'bg-orange-400/15 text-orange-400', 'bg-sky-400/15 text-sky-400', 'bg-purple-400/15 text-purple-400'];

/** Horizontal scroll card list for mobile */
export function LeaderboardList({ take = 5 }: { take?: number }) {
    const { data, isLoading } = useLeaderboard(take);
    const list: any[] = Array.isArray(data) ? data : [];

    if (isLoading) {
        return (
            <ScrollArea className="w-full whitespace-nowrap -mx-8 px-8">
                <div className="flex gap-4 pb-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex-shrink-0 min-w-[200px] h-20 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>
        );
    }

    if (list.length === 0) return null;

    return (
        <ScrollArea className="w-full whitespace-nowrap -mx-8 px-8">
            <div className="flex gap-4 pb-4">
                {list.map((c: any, idx: number) => (
                    <Link
                        key={c.id}
                        href={`/profile/${c.id}`}
                        className="flex-shrink-0 bg-card p-5 rounded-2xl border border-white/8 shadow-xl shadow-black/30 flex items-center gap-4 min-w-[200px] hover:border-amber-400/50 transition-colors"
                    >
                        <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm', LEVEL_COLORS[idx % LEVEL_COLORS.length])}>
                            {c.avatarUrl
                                ? <img src={c.avatarUrl} className="w-full h-full object-cover rounded-2xl" />
                                : (c.name?.charAt(0) || '?').toUpperCase()
                            }
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground truncate max-w-[120px]">{c.name || 'Anonymous'}</span>
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{c.reputation} XP</span>
                        </div>
                    </Link>
                ))}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
    );
}

/** Vertical stacked list for sidebar */
export function LeaderboardSidebarList({ take = 5 }: { take?: number }) {
    const { data, isLoading } = useLeaderboard(take);
    const list: any[] = Array.isArray(data) ? data : [];

    if (isLoading) {
        return (
            <div className="space-y-5">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-white/5 rounded-2xl animate-pulse" />)}
            </div>
        );
    }

    if (list.length === 0) return null;

    return (
        <div className="space-y-5">
            {list.map((c: any, idx: number) => (
                <Link key={c.id} href={`/profile/${c.id}`} className="flex items-center gap-3 group">
                    <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm overflow-hidden group-hover:scale-105 transition-transform', LEVEL_COLORS[idx % LEVEL_COLORS.length])}>
                        {c.avatarUrl
                            ? <img src={c.avatarUrl} className="w-full h-full object-cover" />
                            : (c.name?.charAt(0) || '?').toUpperCase()
                        }
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground leading-tight truncate max-w-[160px] group-hover:text-amber-400 transition-colors">{c.name || 'Anonymous'}</span>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">{c.reputation} XP</span>
                    </div>
                </Link>
            ))}
        </div>
    );
}
