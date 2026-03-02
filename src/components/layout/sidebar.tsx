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
      {/* 1. Mini Map (Contextual) */}
      <div className="relative group">
        <div className="absolute -top-3 -right-2 z-10">
          <div className="bg-gray-900 text-white p-2 rounded-xl shadow-xl shadow-gray-900/20 transform rotate-6 group-hover:rotate-0 transition-transform">
            <Navigation size={14} fill="currentColor" className="text-cyan-400" />
          </div>
        </div>
        
        <div className="w-full h-48 bg-gray-100 rounded-[32px] border border-gray-200 overflow-hidden relative shadow-inner">
          {/* Mock Map Background */}
          <div className="absolute inset-0 opacity-40 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/100.55,13.75,12,0/400x300?access_token=pk.eyJ1IjoibWlubWlubSIsImEiOiJjbHg0cWV4ZncwMHh4Mnh4YWFhYmJjY2RkIn0')] bg-cover bg-center" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 flex flex-col items-start gap-1">
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
              <MapPin size={10} className="text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{selectedCity?.name || 'Bangkok'}</span>
            </div>
          </div>
          
          <Link href="/map" className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/10 backdrop-blur-[2px]">
            <div className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
              Open Map
              <ArrowUpRight size={14} />
            </div>
          </Link>
        </div>
      </div>

      <div className="w-full h-px bg-gray-100" />

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
      
      <div className="mt-auto bg-gray-50/50 p-6 rounded-3xl border border-dashed border-gray-200">
        <h5 className="font-bold text-sm mb-2">{selectedCity?.name || 'Bangkok'} is changing fast.</h5>
        <p className="text-[11px] font-medium text-gray-500 leading-relaxed">Your reports help others navigate the city with confidence and honesty. Keep at it!</p>
      </div>
    </aside>
  );
}
