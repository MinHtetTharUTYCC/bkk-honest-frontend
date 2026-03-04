'use client';

import Link from 'next/link';
import { MapPin, Navigation, ArrowUpRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCity } from '@/components/providers/city-provider';

export default function Sidebar() {
  const pathname = usePathname();
  const { selectedCity } = useCity();
  const isDiscovery = pathname?.includes('/discovery');

  const hashtags = [
    { tag: 'SongkranPrep', count: '1.2k' },
    { tag: 'TukTukRates', count: '850' },
    { tag: 'MichelinStreetFood', count: '2.4k' },
    { tag: 'SukhumvitTraffic', count: '5.1k' },
  ];

  const topContributors = [
    { name: '@LocalGuru_Aum', rep: '5,430', color: 'bg-cyan-100 text-cyan-600' },
    { name: '@BkkNomad', rep: '3,210', color: 'bg-emerald-100 text-emerald-600' },
    { name: '@NanaGuide', rep: '2,950', color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <aside className="hidden lg:flex flex-col gap-8 w-80 min-h-screen px-6 py-10 sticky top-20">
      {/* 2. Trending Section */}
      <div>
        <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          Trending in {selectedCity?.name || 'BKK'}
        </h4>
        <div className="space-y-4">
          {hashtags.map(({ tag, count }) => (
            <Link key={tag} href={`/search?q=${tag}`} className="flex items-center justify-between group">
              <span className="text-sm font-bold text-gray-700 group-hover:text-cyan-400 transition-colors">#{tag}</span>
              <span className="text-[10px] font-black tracking-tighter text-gray-300 group-hover:text-cyan-300 transition-colors">{count}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-gray-100" />

      {/* 3. Top Contributors */}
      <div>
        <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Top Contributors
        </h4>
        <div className="space-y-5">
          {topContributors.map((c) => (
            <div key={c.name} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${c.color} shadow-sm`}>
                {c.name.charAt(1).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800 leading-tight">{c.name}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{c.rep} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-auto bg-gray-50/50 p-6 rounded-3xl border border-dashed border-gray-300">
        <h5 className="font-bold text-sm mb-2">{selectedCity?.name || 'Bangkok'} is changing fast.</h5>
        <p className="text-[11px] font-medium text-gray-500 leading-relaxed">Your reports help others navigate the city with confidence and honesty. Keep at it!</p>
      </div>
    </aside>
  );
}
