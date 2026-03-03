'use client';

import { Zap, AlertCircle, MessageCircle, ArrowRight, MapPin, TrendingUp, Navigation, Heart } from 'lucide-react';
import { useSpots, useScamAlerts, useLiveVibes, useNearbySpots } from '@/hooks/use-api';
import { useVoteToggle } from '@/hooks/use-vote-toggle';
import { useGeolocation } from '@/hooks/use-geolocation';
import SpotCard from '@/components/spots/spot-card';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useCity } from '@/components/providers/city-provider';

export default function HomeFeed() {
  const { selectedCityId, selectedCity } = useCity();
  const { toggleVote, isPending: votePending } = useVoteToggle('alert');
  const { latitude, longitude, error: geoError } = useGeolocation();
  
  const { data: nearbySpots, isLoading: nearbyLoading } = useNearbySpots({
    latitude: latitude || 0,
    longitude: longitude || 0,
    distance: 5
  });

  const { data: spots, isLoading: spotsLoading } = useSpots({
    cityId: selectedCityId,
    sort: 'popular',
  });
  
  const { data: scamAlerts, isLoading: scamAlertsLoading } = useScamAlerts({
    cityId: selectedCityId,
  });
  
  const { data: vibes, isLoading: vibesLoading } = useLiveVibes();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <div className="animate-pulse h-screen bg-gray-50/50 rounded-[40px]" />;

  return (
    <div className="space-y-16">
      <div className="bg-red-500 text-white p-6 rounded-[24px] font-black italic uppercase tracking-widest text-xl text-center shadow-xl shadow-red-500/30 animate-pulse">
        Feed is rendering in {selectedCity?.name || 'unknown city'}
      </div>

      {/* 0. Nearby Pulse */}
      {!geoError && (latitude && longitude) && (
        <section className="space-y-8">
          <header className="flex items-end justify-between px-2">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Nearby Pulse</h2>
              <div className="flex items-center gap-1.5">
                <Navigation size={10} className="text-cyan-400" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">What is around you right now</p>
              </div>
            </div>
          </header>

          <div className="flex gap-6 overflow-x-auto pb-8 -mx-8 px-8 no-scrollbar scroll-smooth snap-x">
            {nearbyLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-72 h-[340px] bg-gray-100/50 rounded-3xl animate-pulse" />
              ))
            ) : Array.isArray(nearbySpots) && nearbySpots.length > 0 ? (
              nearbySpots.map((spot: any) => (
                <SpotCard key={spot.id} spot={spot} />
              ))
            ) : (
              <div className="py-20 text-center w-full bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">No spots found within 5km</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 1. Honest Highlights (Popular Spots) */}
      <section className="space-y-8">
        <header className="flex items-end justify-between px-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Honest Highlights</h2>
            <div className="flex items-center gap-1.5">
              <MapPin size={10} className="text-cyan-400" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Verified fair prices in {selectedCity?.name || 'Thailand'}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-500 transition-colors group">
            All Spots
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </header>

        <div className="flex gap-6 overflow-x-auto pb-8 -mx-8 px-8 no-scrollbar scroll-smooth snap-x">
          {spotsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-72 h-[340px] bg-gray-100/50 rounded-3xl animate-pulse" />
            ))
          ) : Array.isArray(spots) && spots.length > 0 ? (
            spots.map((spot: any) => (
              <SpotCard key={spot.id} spot={spot} />
            ))
          ) : (
            <div className="py-20 text-center w-full bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No spots shared in {selectedCity?.name || 'this city'} yet</p>
            </div>
          )}
        </div>
      </section>

      {/* 2. The Pulse (Scam Alerts & Vibes) */}
      <section className="space-y-8 max-w-2xl">
        <header className="flex flex-col gap-1 px-2">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">The Pulse</h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">What is happening in {selectedCity?.name || 'this city'} right now</p>
        </header>

        <div className="space-y-6">
          {scamAlertsLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-100/50 rounded-3xl animate-pulse" />
            ))
          ) : Array.isArray(scamAlerts) && scamAlerts.length > 0 ? (
            scamAlerts.map((alert: any) => (
              <div key={alert.id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/20 group hover:scale-[1.01] transition-transform">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-widest">
                    <AlertCircle size={16} strokeWidth={3} />
                    Scam Alert
                  </div>
                  <span className="text-gray-300 font-black text-[10px] uppercase tracking-tighter" suppressHydrationWarning>
                    {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {alert.city?.name}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight italic uppercase tracking-tighter">{alert.scamName}</h3>
                <p className="text-gray-600 font-medium leading-relaxed mb-6 line-clamp-3">{alert.description}</p>
                <div className="flex items-center gap-4 border-t border-gray-50 pt-6">
                  <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                    <button 
                      onClick={() => toggleVote(alert)}
                      disabled={votePending}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black transition-all",
                        alert.hasVoted 
                          ? "bg-white text-red-500 shadow-sm" 
                          : "text-gray-400 hover:text-red-500"
                      )}
                    >
                      <Heart size={12} fill={alert.hasVoted ? "currentColor" : "none"} />
                      {alert._count?.votes || 0}
                    </button>
                  </div>
                  <button className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-cyan-400 transition-colors">
                    <MessageCircle size={14} />
                    {alert._count?.comments || 0} Comments
                  </button>
                </div>
              </div>
            ))
          ) : (
             <div className="py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">All clear in {selectedCity?.name || 'the city'}. No active scams reported.</p>
            </div>
          )}

          {vibesLoading ? (
            <div className="h-40 bg-gray-100/50 rounded-3xl animate-pulse" />
          ) : Array.isArray(vibes) && vibes.length > 0 ? (
            vibes.slice(0, 3).map((vibe: any) => (
              <div key={vibe.id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/20 group hover:scale-[1.01] transition-transform">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 text-cyan-400 font-black text-xs uppercase tracking-widest">
                    <Zap size={16} fill="currentColor" />
                    Live Vibe
                  </div>
                  <span className="text-gray-300 font-black text-[10px] uppercase tracking-tighter" suppressHydrationWarning>
                    {new Date(vibe.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {vibe.spot?.name}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight italic uppercase tracking-tighter">
                  {vibe.crowdLevel >= 4 ? 'Very Crowded' : vibe.crowdLevel >= 3 ? 'Medium Crowd' : 'Quiet & Chill'}
                </h3>
                <p className="text-gray-600 font-medium leading-relaxed mb-6">
                  Crowd level: {vibe.crowdLevel}/5. Wait time: {vibe.waitTimeMinutes} mins.
                </p>
                <div className="flex items-center gap-3">
                   <div className={cn(
                     "px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase",
                     vibe.crowdLevel >= 4 ? "bg-orange-50 text-orange-500" : "bg-cyan-50 text-cyan-500"
                   )}>
                     {vibe.crowdLevel >= 4 ? 'Busy' : 'Available'}
                   </div>
                   <div className="bg-gray-50 text-gray-400 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                     {vibe.waitTimeMinutes}m Wait
                   </div>
                </div>
              </div>
            ))
          ) : null}
        </div>
      </section>
    </div>
  );
}
