'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className }: SearchInputProps) {
    return (
        <div className={cn("relative group", className)}>
            <Search
                size={14}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-400 transition-colors"
            />
            <input
                type="text"
                placeholder={placeholder}
                className="w-full bg-white border border-gray-300 pl-12 pr-6 py-3 rounded-2xl text-sm font-bold tracking-tight text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/10 focus:border-cyan-400 transition-all shadow-lg shadow-gray-200/20"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
