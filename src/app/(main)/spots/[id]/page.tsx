'use client';

import { useParams } from 'next/navigation';
import { useSpot, useSpotPriceReports, useSpotTips } from '@/hooks/use-api';
import { MapPin, Zap, Info, ArrowLeft, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export default function SpotDetailPage() {
  const { id } = useParams() as { id: string };
  const { data: spot, isLoading: spotLoading } = useSpot(id);
  const { data: reports } = useSpotPriceReports(id);
  const { data: tips } = useSpotTips(id);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || spotLoading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="h-40 bg-gray-100 rounded-[40px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 h-96 bg-gray-100 rounded-[40px]" />
          <div className="h-96 bg-gray-100 rounded-[40px]" />
        </div>
      </div>
    );
  }

  if (!spot) return <div>Spot not found</div>;

  return (
    <div className="space-y-12 pb-24">
      {/* 1. Header & Quick Actions */}
      <header className="space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-cyan-400 transition-colors">
          <ArrowLeft size={14} strokeWidth={3} />
          Back to Pulse
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-cyan-50 text-cyan-500 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                {(spot.category as any)?.name}
              </span>
              <div className="flex items-center gap-1 text-emerald-500 font-black text-xs">
                <Zap size={12} fill="currentColor" />
                {spot.vibeStats ? `${((spot.vibeStats as any).avgCrowdLevel / 5 * 100).toFixed(0)}% Trust` : 'New Spot'}
              </div>
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic">{spot.name}</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
              <MapPin size={14} strokeWidth={3} className="text-cyan-400" />
              {spot.address}
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/report" className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-xl shadow-gray-900/10">
              Add New Report
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Key Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/20">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Avg Price (THB)</span>
          <div className="text-4xl font-black text-gray-900 tracking-tighter italic">
            {(spot.priceStats as any)?.avg ? `${(spot.priceStats as any).avg.toFixed(0)}` : '--'}
          </div>
          <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Across {(spot.priceStats as any)?.count || 0} Reports</div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/20">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Fair Range</span>
          <div className="text-xl font-black text-gray-900 tracking-tighter uppercase flex items-center gap-2">
            <span className="text-emerald-500 italic">{(spot.priceStats as any)?.min || '--'}</span>
            <span className="text-gray-200">-</span>
            <span className="text-red-500 italic">{(spot.priceStats as any)?.max || '--'}</span>
          </div>
          <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">THB Range</div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/20">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Live Vibe</span>
          <div className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">
            {(spot.vibeStats as any)?.avgCrowdLevel ? `${((spot.vibeStats as any).avgCrowdLevel).toFixed(1)} / 5` : 'No Data'}
          </div>
          <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Crowd Rating</div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/20">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Verified by</span>
          <div className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">
            {reports?.length || 0} Locals
          </div>
          <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Community Score</div>
        </div>
      </div>

      {/* 3. Detailed Data Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Price History Table */}
        <section className="md:col-span-2 space-y-8">
          <header className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Recent Price Reports</h3>
            <Info size={16} className="text-gray-300" />
          </header>
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Item Name</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Price</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {!Array.isArray(reports) || reports.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-xs font-bold text-gray-300 uppercase italic">No reports yet</td>
                  </tr>
                ) : (
                  reports.map((r: any) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 text-sm font-black text-gray-900">{r.itemName}</td>
                      <td className="px-8 py-6 text-sm font-black text-cyan-400 italic">{r.priceThb} THB</td>
                      <td className="px-8 py-6">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                          Number(r.priceThb) <= (spot.priceStats as any).avg ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
                        )}>
                          {Number(r.priceThb) <= (spot.priceStats as any).avg ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                          {Number(r.priceThb) <= (spot.priceStats as any).avg ? 'Fair Price' : 'Expensive'}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest" suppressHydrationWarning>
                        {new Date(r.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Community Tips (Avoid/Try) */}
        <section className="space-y-8">
          <header className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Community Tips</h3>
            <span className="bg-gray-900 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black">{tips?.length || 0}</span>
          </header>
          <div className="space-y-6">
            {tips?.length === 0 ? (
              <div className="py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200 text-xs font-bold text-gray-300 uppercase italic">Be the first to tip</div>
            ) : (
              tips?.map((tip) => (
                <div key={tip.id} className={cn(
                  "p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/20 flex gap-4",
                  tip.type === 'AVOID' ? "bg-red-50/20" : "bg-emerald-50/20"
                )}>
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center",
                    tip.type === 'AVOID' ? "bg-red-100 text-red-500" : "bg-emerald-100 text-emerald-500"
                  )}>
                    {tip.type === 'AVOID' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">{tip.title}</h4>
                    <p className="text-xs font-medium text-gray-600 leading-relaxed">{tip.description}</p>
                    <div className="pt-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Reported by {tip.user?.name || 'Local'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
