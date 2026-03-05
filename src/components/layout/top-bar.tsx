'use client';

import { Search, Bell, Zap } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useProfile } from '@/hooks/use-api';
import Link from 'next/link';
import CitySwitcher from './city-switcher';

export default function TopBar() {
    const { user } = useAuth();
    const displayUserId = user?.id || '08ec1994-a7e5-42d3-b533-e52982fc2e2d';
    const { data: profile } = useProfile(displayUserId);

    return (
        <header className="sticky top-0 z-40 w-full h-16 md:h-20 bg-background/90 backdrop-blur-xl border-b border-white/8 px-4 md:px-8 flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-400 rounded-xl flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-400/20">
                        H
                    </div>
                    <span className="hidden lg:block font-display font-bold text-xl tracking-tight text-foreground">
                        BKK Honest
                    </span>
                </Link>
                <div className="hidden md:block">
                    <CitySwitcher />
                </div>
            </div>

            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4 transition-colors group-focus-within:text-amber-400" />
                    <input
                        type="text"
                        placeholder="Search price, spot, or scam..."
                        className="w-full bg-white/5 h-10 md:h-12 pl-10 pr-4 rounded-2xl text-sm font-medium text-foreground placeholder:text-white/30 outline-none border border-white/10 focus:border-amber-400/50 transition-all focus:bg-white/8 focus:shadow-sm"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                <div className="flex items-center gap-1.5 bg-amber-400/10 text-amber-400 px-3 py-1.5 rounded-full border border-amber-400/20 shadow-sm transition-transform hover:scale-105 cursor-default">
                    <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-black tracking-widest">
                        {profile?.reputation || 0}
                    </span>
                </div>
            </div>
        </header>
    );
}
