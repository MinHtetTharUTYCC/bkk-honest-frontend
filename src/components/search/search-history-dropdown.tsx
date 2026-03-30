'use client';

import { X } from 'lucide-react';
import { SearchHistoryItem } from '@/hooks/use-search-history';
import { cn } from '@/lib/utils';

interface SearchHistoryDropdownProps {
    history: SearchHistoryItem[];
    onSelect: (item: SearchHistoryItem) => void;
    onRemove: (index: number) => void;
    onClearAll: () => void;
    isOpen: boolean;
    className?: string;
}

export function SearchHistoryDropdown({
    history,
    onSelect,
    onRemove,
    onClearAll,
    isOpen,
    className,
}: SearchHistoryDropdownProps) {
    if (!isOpen || history.length === 0) {
        return null;
    }

    return (
        <div
            className={cn(
                'absolute top-full left-0 right-0 mt-2 bg-black/80 border border-white/10 rounded-2xl backdrop-blur-xl z-50',
                className,
            )}
        >
            <div className="max-h-75 overflow-y-auto">
                {history.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => onSelect(item)}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-b-0 flex items-center justify-between group transition-colors"
                    >
                        <div className="flex-1">
                            <div className="text-sm font-medium text-foreground truncate">
                                {item.q}
                            </div>
                            <div className="text-xs text-white/40 flex items-center gap-2 mt-1">
                                {item.categoryId && <span>Category applied</span>}
                                {item.sort && <span>Sort: {item.sort}</span>}
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(index);
                            }}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <X size={14} className="text-red-400" />
                        </button>
                    </button>
                ))}
            </div>
            <div className="px-4 py-2 border-t border-white/5">
                <button
                    onClick={onClearAll}
                    className="text-xs text-white/40 hover:text-white/60 transition-colors font-medium"
                >
                    Clear History
                </button>
            </div>
        </div>
    );
}
