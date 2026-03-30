"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { InputHTMLAttributes } from "react";

interface SearchInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange"
> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative group", className)}>
      <Search
        size={14}
        className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-amber-400 transition-colors"
      />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 pl-12 pr-6 py-3 rounded-2xl text-sm font-bold tracking-tight text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all shadow-lg shadow-black/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        {...props}
      />
    </div>
  );
}
