"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils/core";

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  const viewportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onWheel = (e: WheelEvent) => {
      // Determine if it's primarily a horizontal scroll area (like a category bar)
      const isHorizontalOnly =
        viewport.scrollHeight <= viewport.clientHeight + 1; // +1 for pixel rounding
      const hasHorizontalOverflow = viewport.scrollWidth > viewport.clientWidth;

      if (isHorizontalOnly && hasHorizontalOverflow) {
        // If scrolling primarily vertically, hijack to horizontal
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          // Check if we can scroll any more in the requested direction
          const canScrollLeft = viewport.scrollLeft > 0 && e.deltaY < 0;
          const canScrollRight =
            viewport.scrollLeft <
              viewport.scrollWidth - viewport.clientWidth - 1 && e.deltaY > 0;

          if (canScrollLeft || canScrollRight) {
            e.preventDefault();
            viewport.scrollLeft += e.deltaY;
          }
        }
      }
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
