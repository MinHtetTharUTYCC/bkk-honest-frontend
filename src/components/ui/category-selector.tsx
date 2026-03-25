'use client';

import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';


interface CategorySelectorProps {
    categories: unknown[];
    selectedId?: string;
    onSelect: (id: string | undefined) => void;
    onHover?: (id: string | undefined) => void;
    allLabel?: string;
    countKey?: string;
    isLoadingId?: string;
    isAllLoading?: boolean;
    className?: string;
    containerClassName?: string;
    variant?: 'pill' | 'badge';
}

interface CategoryItem {
    id: string;
    name?: string;
    _count?: Record<string, number | undefined>;
}

function isCategoryItem(value: unknown): value is CategoryItem {
    return !!value && typeof value === 'object' && 'id' in value && typeof (value as { id?: unknown }).id === 'string';
}

export function CategorySelector({
    categories,
    selectedId,
    onSelect,
    onHover,
    allLabel = 'All Pulse',
    countKey,
    isLoadingId,
    isAllLoading,
    className,
    containerClassName,
    variant = 'pill' }: CategorySelectorProps) {
    const isPill = variant === 'pill';

    return (
        <ScrollArea className={cn('w-full whitespace-nowrap', className)}>
            <div className={cn('flex gap-2 pb-2', containerClassName)}>
                <button
                    onClick={() => onSelect(undefined)}
                    onMouseEnter={() => onHover?.(undefined)}
                    className={cn(
                        'shrink-0 transition-all cursor-pointer flex items-center gap-2',
                        isPill 
                            ? 'px-5 py-2 rounded-2xl text-[11px] font-bold tracking-wide'
                            : 'px-5 py-2.5 rounded-full text-xs font-bold shadow-xl snap-center',
                        !selectedId
                            ? (isPill ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' : 'bg-white text-black scale-105')
                            : (isPill ? 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/8' : 'bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/10')
                    )}
                >
                    {allLabel}
                    {isAllLoading && <Loader2 size={12} className="animate-spin" />}
                </button>

                {categories?.filter(isCategoryItem).map((cat) => {
                    const isSelected = selectedId === cat.id;
                    const showLoader = isLoadingId === cat.id;
                    const rawCount = countKey && cat._count ? cat._count[countKey] : undefined;
                    const count = typeof rawCount === 'number' ? rawCount : 0;

                    return (
                        <button
                            key={cat.id}
                            onClick={() => onSelect(cat.id)}
                            onMouseEnter={() => onHover?.(cat.id)}
                            className={cn(
                                'shrink-0 transition-all flex items-center gap-2 cursor-pointer',
                                isPill 
                                    ? 'px-5 py-2 rounded-2xl text-[11px] font-bold tracking-wide'
                                    : 'px-5 py-2.5 rounded-full text-xs font-bold shadow-xl snap-center',
                                isSelected
                                    ? (isPill ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' : 'bg-white text-black scale-105')
                                    : (isPill ? 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/8' : 'bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/10')
                            )}
                        >
                            {cat.name || ''}
                            {count > 0 && (
                                <span
                                    className={cn(
                                        'px-1.5 py-0.5 rounded-md text-[12px]',
                                        isSelected
                                            ? 'bg-white/20 text-black'
                                            : 'bg-white/8 text-white/40',
                                    )}
                                >
                                    {count}
                                </span>
                            )}
                            {showLoader && <Loader2 size={12} className="animate-spin" />}
                        </button>
                    );
                })}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
    );
}
