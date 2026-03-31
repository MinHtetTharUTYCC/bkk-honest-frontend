"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuContextType {
  close: () => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | null>(
  null,
);

export function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext);
  if (!context)
    throw new Error("useDropdownMenu must be used within a DropdownMenu");
  return context;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function DropdownMenu({
  trigger,
  children,
  align = "right",
  className,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const close = () => setIsOpen(false);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <DropdownMenuContext.Provider value={{ close }}>
      <div
        className={cn("relative inline-block text-left", className)}
        ref={menuRef}
      >
        <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
          {trigger}
        </div>

        {isOpen && (
          <div
            className={cn(
              "absolute z-50 mt-2 min-w-40 bg-gray-950/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200",
              align === "right" ? "right-0" : "left-0",
            )}
          >
            <div className="py-1">{children}</div>
          </div>
        )}
      </div>
    </DropdownMenuContext.Provider>
  );
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  danger?: boolean;
  asChild?: boolean;
}

export function DropdownMenuItem({
  children,
  onClick,
  className,
  danger,
  asChild,
}: DropdownMenuItemProps) {
  const { close } = useDropdownMenu();

  const handleClick = (e: React.MouseEvent) => {
    onClick?.(e);
    close();
  };

  if (
    asChild &&
    React.isValidElement<{ onClick?: (e: React.MouseEvent) => void }>(children)
  ) {
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e);
        handleClick(e);
      },
    });
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "px-4 py-3 text-sm font-medium transition-all cursor-pointer flex items-center gap-2 hover:bg-white/5",
        danger
          ? "text-red-400 hover:text-red-300"
          : "text-white/70 hover:text-white",
        className,
      )}
    >
      {children}
    </div>
  );
}
