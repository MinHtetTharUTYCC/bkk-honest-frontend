"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsInjectedProps = {
  _tabsValue?: string;
  _onValueChange?: (value: string) => void;
};

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
  }
>(
  (
    { className, value, onValueChange, defaultValue, children, ...props },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(
      defaultValue || value || "",
    );

    const currentValue = value !== undefined ? value : internalValue;

    const handleValueChange = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    return (
      <div
        ref={ref}
        className={cn("w-full", className)}
        {...props}
        data-value={currentValue}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement<TabsInjectedProps>(child)) {
            // If the child is TabsList, we pass the props.
            // Otherwise (like for TabsContent), we also pass the props.
            // BUT, we only want these props on our custom components, not on native DOM elements.
            // In our case, Tabs only has TabsList and TabsContent as children, so it should be fine.
            return React.cloneElement(child, {
              _tabsValue: currentValue,
              _onValueChange: handleValueChange,
            });
          }
          return child;
        })}
      </div>
    );
  },
);
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    _tabsValue?: string;
    _onValueChange?: (value: string) => void;
  }
>(({ className, _tabsValue, _onValueChange, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-lg bg-white/5 p-1 text-white/60",
      className,
    )}
    role="tablist"
    {...props}
  >
    {React.Children.map(children, (child) => {
      if (React.isValidElement<TabsInjectedProps>(child)) {
        return React.cloneElement(child, {
          _tabsValue,
          _onValueChange,
        });
      }
      return child;
    })}
  </div>
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value?: string;
    _tabsValue?: string;
    _onValueChange?: (value: string) => void;
  }
>(
  (
    { className, value, onClick, _tabsValue, _onValueChange, ...props },
    ref,
  ) => {
    const isActive = _tabsValue === value;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (_onValueChange && value) {
        _onValueChange(value);
      }
    };

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium",
          "ring-offset-gray-950 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50",
          "disabled:pointer-events-none disabled:opacity-50",
          "hover:text-white hover:bg-white/10",
          isActive ? "bg-white/10 text-foreground shadow-sm" : "text-white/60",
          className,
        )}
        data-value={value}
        {...props}
      />
    );
  },
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  _tabsValue?: string;
  _onValueChange?: (value: string) => void;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, value, _tabsValue, _onValueChange, ...props }, ref) => {
    const isActive = _tabsValue === value;

    return isActive ? (
      <div
        ref={ref}
        role="tabpanel"
        aria-labelledby={`tab-${value}`}
        className={cn(
          "mt-2 ring-offset-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50",
          "animate-in fade-in-0 zoom-in-95",
          className,
        )}
        data-value={value}
        {...props}
      />
    ) : null;
  },
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
