'use client';

import { Home, Search, Map as MapIcon, Plus, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import NavigationMenuSheet from './navigation-menu-sheet';

export default function NavDock() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Spots', href: '/spots' },
    { icon: AlertTriangle, label: 'Scams', href: '/scam-alerts' },
    { icon: MapIcon, label: 'Map', href: '/map' },
  ];

  const isActiveRoute = (href: string) => {
    if (!pathname) return false;
    const cleanPathname = pathname.split('?')[0];
    
    if (href === '/') {
      return cleanPathname === '/';
    }
    
    return cleanPathname === href || cleanPathname.startsWith(`${href}/`);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:bottom-auto md:top-0 md:left-0 md:h-screen md:w-20 md:flex md:flex-col md:items-center md:justify-center md:border-r bg-background/90 backdrop-blur-xl border-t md:border-t-0 border-white/8 px-3 py-4 md:px-0 md:py-8">
      <div className="flex items-center justify-between w-full md:flex-col md:gap-12 max-w-md mx-auto md:mx-0">
        {/* Hamburger menu (mobile only) */}
        <div className="md:hidden">
          <NavigationMenuSheet />
        </div>

        {/* Core navigation items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 transition-all',
                isActive
                  ? 'text-amber-400'
                  : 'text-white/30 hover:text-white/70',
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold md:hidden uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}

        {/* Add (FAB) - centered */}
        <Link
          href="/report"
          className="relative -top-10 md:static flex items-center justify-center w-14 h-14 bg-amber-400 rounded-2xl shadow-xl shadow-amber-400/30 text-black transition-transform active:scale-95 hover:shadow-2xl hover:shadow-amber-400/40"
        >
          <Plus size={28} />
        </Link>
      </div>
    </nav>
  );
}
