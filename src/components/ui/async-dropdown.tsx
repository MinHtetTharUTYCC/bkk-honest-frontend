'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropdownOption {
    id: string;
    name: string;
}

interface AsyncDropdownProps {
    options: DropdownOption[];
    isLoading: boolean;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    name?: string;
    className?: string;
    disabled?: boolean;
    loadingPlaceholder?: string;
}

export function AsyncDropdown({
    options,
    isLoading,
    value,
    onChange,
    placeholder = 'Select an option',
    label,
    name,
    className,
    disabled = false,
    loadingPlaceholder = 'Loading...',
}: AsyncDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.id === value);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setTimeout(() => setIsOpen(false), 0);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    // Close dropdown when no longer loading
    useEffect(() => {
        if (!isLoading && isOpen && options.length === 0) {
            setTimeout(() => setIsOpen(false), 0);
        }
    }, [isLoading, isOpen, options.length]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (disabled || isLoading) return;

        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                setIsOpen(!isOpen);
                break;
            case 'Escape':
                e.preventDefault();
                setTimeout(() => setIsOpen(false), 0);
                break;
            case 'ArrowDown':
                e.preventDefault();
                setIsOpen(true);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setIsOpen(true);
                break;
        }
    };

    const handleOptionKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, optionId: string) => {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                onChange(optionId);
                setTimeout(() => setIsOpen(false), 0);
                break;
            case 'Escape':
                e.preventDefault();
                setTimeout(() => setIsOpen(false), 0);
                break;
            case 'ArrowDown':
                e.preventDefault();
                const currentIndex = options.findIndex((opt) => opt.id === optionId);
                if (currentIndex < options.length - 1) {
                    const nextButton = dropdownRef.current?.querySelector(
                        `[data-option-id="${options[currentIndex + 1].id}"]`,
                    ) as HTMLButtonElement;
                    nextButton?.focus();
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                const currentIdx = options.findIndex((opt) => opt.id === optionId);
                if (currentIdx > 0) {
                    const prevButton = dropdownRef.current?.querySelector(
                        `[data-option-id="${options[currentIdx - 1].id}"]`,
                    ) as HTMLButtonElement;
                    prevButton?.focus();
                }
                break;
        }
    };

    const isDisabledState = disabled || isLoading;

    return (
        <div className={cn('w-full', className)}>
            {label && (
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-2">
                    {label}
                </label>
            )}

            <div className="relative" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => !isDisabledState && setIsOpen(!isOpen)}
                    onKeyDown={handleKeyDown}
                    disabled={isDisabledState}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-label={name ? `${name} dropdown` : 'Select option'}
                    className={cn(
                        'w-full px-4 py-2.5 rounded-2xl text-sm font-medium text-foreground',
                        'border border-white/10 transition-all duration-200 outline-none',
                        'flex items-center justify-between gap-3',
                        'hover:bg-white/8',
                        isOpen && !isDisabledState && 'bg-white/8 border-amber-400/50',
                        !isOpen && 'bg-white/5',
                        isDisabledState && 'opacity-50 cursor-not-allowed',
                    )}
                >
                    <span className={cn(selectedOption ? 'text-white' : 'text-white/50')}>
                        {isLoading ? loadingPlaceholder : selectedOption?.name || placeholder}
                    </span>
                    {isLoading ? (
                        <Loader2 size={16} className="text-amber-400/70 animate-spin shrink-0" />
                    ) : (
                        <ChevronDown
                            size={16}
                            className={cn(
                                'text-white/30 transition-transform shrink-0',
                                isOpen && 'rotate-180 text-amber-400/70',
                            )}
                        />
                    )}
                </button>

                {isOpen && !isDisabledState && (
                    <div
                        role="listbox"
                        className="absolute top-full mt-2 left-0 right-0 bg-gray-950/95 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                        {isLoading ? (
                            <div className="px-4 py-8 flex flex-col items-center justify-center gap-3">
                                <Loader2 size={20} className="text-amber-400/70 animate-spin" />
                                <span className="text-sm text-white/50">{loadingPlaceholder}</span>
                            </div>
                        ) : (
                            <div className="max-h-64 overflow-y-auto">
                                {options.length > 0 ? (
                                    options.map((option) => (
                                        <button
                                            key={option.id}
                                            data-option-id={option.id}
                                            onClick={() => {
                                                onChange(option.id);
                                                setTimeout(() => setIsOpen(false), 0);
                                            }}
                                            onKeyDown={(e) => handleOptionKeyDown(e, option.id)}
                                            role="option"
                                            aria-selected={value === option.id}
                                            className={cn(
                                                'w-full text-left px-4 py-3 text-sm font-medium transition-all border-l-2',
                                                value === option.id
                                                    ? 'bg-amber-400/10 border-l-amber-400 text-amber-400'
                                                    : 'text-white/70 border-l-transparent hover:bg-white/5 hover:text-white',
                                            )}
                                        >
                                            {option.name}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-sm text-white/50 text-center">
                                        No options available
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
