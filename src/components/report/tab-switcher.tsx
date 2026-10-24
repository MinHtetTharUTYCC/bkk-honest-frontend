'use client';

import { AlertCircle, DollarSign, Zap, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils/core';

interface TabSwitcherProps {
    activeTab: 'price' | 'scam' | 'vibe' | 'spot';
    onTabChange: (tab: 'price' | 'scam' | 'vibe' | 'spot') => void;
}

export default function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
    return (
        <div className="bg-white/8 p-1.5 rounded-3xl flex flex-wrap md:flex-nowrap gap-1">
            {(['price', 'scam', 'vibe', 'spot'] as const).map((tab) => (
                <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    className={cn(
                        'flex-1 min-w-25 py-3.5 rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all',
                        activeTab === tab
                            ? 'bg-amber-400 text-black shadow-sm'
                            : 'text-white/40 hover:text-white/70',
                    )}
                >
                    <div className="flex items-center justify-center gap-2">
                        {tab === 'price' && <DollarSign size={14} />}
                        {tab === 'scam' && <AlertCircle size={14} />}
                        {tab === 'vibe' && <Zap size={14} />}
                        {tab === 'spot' && <MapPin size={14} />}
                        <span className="hidden md:inline">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                    </div>
                </button>
            ))}
        </div>
    );
}
