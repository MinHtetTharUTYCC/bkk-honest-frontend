import React from 'react';
import { cn } from '@/lib/utils/core';

interface EndOfListProps {
    message?: string;
    className?: string;
}

/**
 * Reusable component to indicate the end of a paginated list
 */
export function EndOfList({ message = "You've reached the end", className }: EndOfListProps) {
    return (
        <p
            className={cn(
                'text-[12px] font-semibold text-white/30 uppercase tracking-[0.2em] py-8 text-center',
                className,
            )}
        >
            {message}
        </p>
    );
}
