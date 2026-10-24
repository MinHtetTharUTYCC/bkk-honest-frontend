"use client";

import React, { useRef, useState, useLayoutEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/core";

interface TruncatedTextWithDialogProps {
  text: string;
  title?: string;
  className?: string;
  textClassName?: string;
  icon?: React.ReactNode;
}

export function TruncatedTextWithDialog({
  text,
  title,
  className,
  textClassName,
  icon,
}: TruncatedTextWithDialogProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useLayoutEffect(() => {
    const checkTruncation = () => {
      const element = textRef.current;
      if (!element) return;

      // Compare scrollHeight (actual content height) to clientHeight (visible height)
      // We add a small 2px buffer to avoid false positives from sub-pixel rendering
      setIsTruncated(element.scrollHeight > element.clientHeight + 2);
    };

    checkTruncation();

    // Re-check on window resize in case line wrapping changes
    window.addEventListener("resize", checkTruncation);
    return () => window.removeEventListener("resize", checkTruncation);
  }, [text]);

  return (
    <>
      <div className={cn("flex flex-col items-start", className)}>
        <div className="flex items-start gap-2 w-full">
          {icon && <div className="shrink-0 mt-1">{icon}</div>}
          <div
            ref={textRef}
            className={cn("line-clamp-2 wrap-break-word w-full", textClassName)}
          >
            {text}
          </div>
        </div>
        {isTruncated && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            className="text-xs text-amber-400 font-bold mt-1 hover:text-amber-300 transition-colors cursor-pointer"
          >
            ... See more
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        >
          <div
            className="bg-card rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-white/10 relative max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white/50" />
            </button>
            {title && (
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">
                {title}
              </h3>
            )}
            <div className="flex items-start gap-3">
              {icon && <div className="shrink-0 mt-1">{icon}</div>}
              <p className="text-lg text-white font-medium leading-relaxed wrap-break-word">
                {text}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
