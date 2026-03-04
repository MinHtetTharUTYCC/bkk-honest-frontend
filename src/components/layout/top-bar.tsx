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
    <header className="sticky top-0 z-40 w-full h-16 md:h-20 bg-white/70 backdrop-blur-xl border-b border-gray-300 px-4 md:px-8 flex items-center justify-between gap-6">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-cyan-400 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-400/20">
            H
          </div>
          <span className="hidden lg:block font-black text-xl tracking-tight text-gray-900 italic uppercase">HONEST.BKK</span>
        </Link>
        <div className="hidden md:block">
          <CitySwitcher />
        </div>
      </div>

      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors group-focus-within:text-cyan-400" />
          <input
            type="text"
            placeholder="Search price, spot, or scam..."
            className="w-full bg-gray-100/50 h-10 md:h-12 pl-10 pr-4 rounded-2xl text-sm font-bold text-gray-900 placeholder:text-gray-500 outline-none border-2 border-gray-300 focus:border-cyan-400/50 transition-all focus:bg-white focus:shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm transition-transform hover:scale-105 cursor-default">
          <Zap className="w-4 h-4 fill-emerald-500 text-emerald-500" />
          <span className="text-xs font-black tracking-widest">{profile?.reputation || 0} ⚡</span>
        </div>
      </div>
    </header>
  );
}
