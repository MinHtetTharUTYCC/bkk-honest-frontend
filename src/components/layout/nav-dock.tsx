'use client';

import { Home, Search, Map as MapIcon, Plus, User, AlertTriangle, Target } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function NavDock() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Spots', href: '/spots' },
    { icon: AlertTriangle, label: 'Scams', href: '/scam-alerts' },
    { icon: Target, label: 'Missions', href: '/missions' },
    { icon: MapIcon, label: 'Map', href: '/map' },
    { icon: Plus, label: 'Add', href: '/report', primary: true },
    { icon: User, label: 'Profile', href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:bottom-auto md:top-0 md:left-0 md:h-screen md:w-20 md:flex md:flex-col md:items-center md:justify-center md:border-r bg-background/90 backdrop-blur-xl border-t md:border-t-0 border-white/8 px-6 py-4 md:px-0 md:py-8">
      <div className="flex items-center justify-between w-full md:flex-col md:gap-12 max-w-md mx-auto md:mx-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-10 md:static flex items-center justify-center w-14 h-14 bg-amber-400 rounded-2xl shadow-xl shadow-amber-400/30 text-black transition-transform active:scale-95"
              >
                <Icon size={28} />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                isActive ? "text-amber-400" : "text-white/30 hover:text-white/70"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold md:hidden uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
