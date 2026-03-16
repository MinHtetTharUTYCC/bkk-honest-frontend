'use client';

import { useState } from 'react';
import { Menu, X, Target, User, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import * as Dialog from '@radix-ui/react-dialog';

import { useAuth } from '@/components/providers/auth-provider';
import { LogIn } from 'lucide-react';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

export default function NavigationMenuSheet() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    { icon: <Zap size={20} />, label: 'Vibes', href: '/vibes' },
    { icon: <Target size={20} />, label: 'Missions', href: '/missions' },
    { icon: <User size={20} />, label: 'Profile', href: '/profile' },
  ];

  const isActive = (href: string) => {
    if (!pathname) return false;
    const cleanPathname = pathname.split('?')[0];
    if (href === '/profile') {
      return cleanPathname === '/profile' || cleanPathname === '/profile/';
    }
    return cleanPathname === href || cleanPathname.startsWith(`${href}/`);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center justify-center p-2 text-white/40 hover:text-amber-400 transition-colors md:hidden">
          <Menu size={24} strokeWidth={2} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        {/* Backdrop - only show when dialog is open */}
        {isOpen && <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" />}

        {/* Drawer content */}
        <Dialog.Content 
          aria-describedby={undefined}
          className="fixed bottom-20 left-0 right-0 z-50 bg-background border-t border-white/8 p-4 rounded-t-3xl shadow-xl md:hidden max-h-[70vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6 px-2">
            <Dialog.Title className="text-sm font-bold uppercase tracking-widest text-foreground">
              {user ? 'More Options' : 'Welcome'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 hover:bg-white/8 rounded-lg transition-colors text-white/40 hover:text-white/70">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-2">
            {!user && (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-4 mb-4 rounded-xl bg-amber-400 text-black shadow-lg shadow-amber-400/10 transition-all active:scale-95"
              >
                <div className="flex items-center justify-center">
                  <LogIn size={18} />
                </div>
                <span className="text-sm font-black uppercase tracking-wide">
                  Join Us
                </span>
              </Link>
            )}

            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                    active
                      ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                      : 'text-white/50 hover:text-white/70 hover:bg-white/5',
                  )}
                >
                  <div className={cn(
                    'flex items-center justify-center',
                    active ? 'text-amber-400' : 'text-white/40'
                  )}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wide">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
