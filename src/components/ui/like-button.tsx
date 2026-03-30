"use client";

import { Heart } from "lucide-react";
import { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const likeButtonVariants = cva(
  "flex items-center justify-center rounded transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10",
        compact: "gap-1.5 px-2 py-1 rounded-md text-sm",
        overlay: "gap-1.5 px-4 py-2 rounded-md",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
      showCount: {
        true: "gap-2",
        false: "gap-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      showCount: true,
    },
  },
);

const iconSizeMap = {
  sm: 14,
  md: 16,
  lg: 18,
};

export interface LikeButtonProps extends VariantProps<
  typeof likeButtonVariants
> {
  count?: number;
  isVoted?: boolean;
  onVote?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
  isPending?: boolean;
  disabled?: boolean;
  title?: string;
  variant?: "default" | "compact" | "overlay";
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
  children?: ReactNode;
}

export function LikeButton({
  count = 0,
  isVoted = false,
  onVote,
  isPending = false,
  disabled = false,
  title,
  variant = "default",
  size = "md",
  showCount = true,
  className = "",
}: LikeButtonProps) {
  const iconSize = iconSizeMap[size as keyof typeof iconSizeMap] || 16;

  const defaultTitle = isVoted ? "Unlike this" : "Like this";

  return (
    <button
      onClick={(e) => {
        if (onVote) {
          onVote(e);
        }
      }}
      disabled={disabled || isPending}
      title={title || defaultTitle}
      className={likeButtonVariants({
        variant,
        size,
        showCount,
        className,
      })}
    >
      <Heart
        size={iconSize}
        className={`transition-all duration-200 ${
          isVoted
            ? "fill-amber-400 text-amber-400"
            : "text-white/70 group-hover:text-amber-400"
        }`}
      />
      {showCount && (
        <span
          className={`font-medium transition-colors duration-200 ${
            isVoted
              ? "text-amber-400"
              : "text-white/70 group-hover:text-amber-400"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
