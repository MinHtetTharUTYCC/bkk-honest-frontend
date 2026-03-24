'use client';

import Sidebar from '@/components/layout/sidebar';
import { usePathname } from 'next/navigation';

export function ConditionalSidebar() {
  const pathname = usePathname();
  
  // Do not show sidebar on the map page
  if (pathname === '/map') return null;

  return <Sidebar />;
}
