'use client';

import { Search, Bell, Zap, LogIn } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useProfile } from '@/hooks/use-api';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import CitySwitcher from './city-switcher';

export default function TopBar() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [searchInput, setSearchInput] = useState('');
    const { data: profile } = useProfile(user ? 'me' : '');
    const isSearchPage = pathname?.endsWith('/search') || pathname?.endsWith('/search/');

    const handleSearchFocus = () => {
        // Navigate to search page with current input if any
        if (searchInput.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchInput)}`);
        } else {
            router.push('/search');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchInput.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchInput)}`);
        }
    };

    return (
        <header className="sticky top-0 z-40 w-full h-16 md:h-20 bg-background/90 backdrop-blur-xl border-b border-white/8 px-3 md:px-8 flex items-center justify-between gap-3 md:gap-6">
            <div className="flex items-center gap-2 md:gap-6">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-400 rounded-xl flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-400/20 shrink-0">
                        H
                    </div>
                    <span className="hidden lg:block font-display font-bold text-xl tracking-tight text-foreground">
                        BKK Honest
                    </span>
                </Link>
                <div className="block">
                    <CitySwitcher />
                </div>
            </div>

            {!isSearchPage && (
                <div className="flex-1 max-w-xl flex justify-end md:block">
                    <button
                        onClick={handleSearchFocus}
                        aria-label="Open search"
                        className="md:hidden w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-amber-400 hover:border-amber-400/30 transition-colors flex items-center justify-center"
                    >
                        <Search className="w-4 h-4" />
                    </button>

                    <div className="relative group hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-3.5 h-3.5 transition-colors group-focus-within:text-amber-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onFocus={handleSearchFocus}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-white/5 h-9 md:h-12 pl-9 pr-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-medium text-foreground placeholder:text-white/30 outline-none border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all focus:bg-white/8 focus:shadow-sm cursor-text"
                        />
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3 md:gap-6">
                {user ? (
                    <div className="hidden md:flex items-center gap-1.5 bg-amber-400/10 text-amber-400 px-3 py-1.5 rounded-full border border-amber-400/20 shadow-sm transition-transform hover:scale-105 cursor-default">
                        <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-black tracking-widest">
                            {profile?.reputation || 0}
                        </span>
                    </div>
                ) : (
                    !loading && (
                        <Link
                            href="/login"
                            className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/10"
                        >
                            <LogIn size={14} />
                            Join Us
                        </Link>
                    )
                )}
            </div>
        </header>
    );
}
