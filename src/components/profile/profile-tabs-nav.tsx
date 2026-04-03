"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/core";
import { Lightbulb, AlertTriangle, MapPin, TrendingDown } from "lucide-react";

interface ProfileTabsNavProps {
  userId: string;
}

const tabs = [
  { id: "tips", label: "Tips", icon: Lightbulb, color: "amber" },
  { id: "scams", label: "Scams", icon: AlertTriangle, color: "red" },
  { id: "spots", label: "Spots", icon: MapPin, color: "cyan" },
  { id: "reports", label: "Reports", icon: TrendingDown, color: "green" },
] as const;

export function ProfileTabsNav({ userId }: ProfileTabsNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        // Support both /profile/me/tips and /profile/[userId]/tips routes
        // Route groups (parentheses) don't appear in actual URLs
        const href =
          userId === "me"
            ? `/profile/${tab.id}`
            : `/profile/${userId}/${tab.id}`;
        const isActive = pathname === href;

        return (
          <Link
            key={tab.id}
            href={href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all",
              isActive
                ? `bg-${tab.color}-400/20 text-${tab.color}-400 border border-${tab.color}-400/50`
                : "text-white/60 hover:text-white/80 hover:bg-white/5",
            )}
          >
            <Icon size={16} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
