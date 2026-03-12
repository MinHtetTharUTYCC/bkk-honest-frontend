'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './footer';

const ConditionalFooter: React.FC = () => {
  const pathname = usePathname();
  
  // Exclude footer from map and navigate pages to maintain full-screen experience
  const shouldShowFooter = !pathname.startsWith('/map') && !pathname.startsWith('/navigate');
  
  return shouldShowFooter ? <Footer /> : null;
};

export { ConditionalFooter };