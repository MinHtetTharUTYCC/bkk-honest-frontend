'use client';

import { useParams } from 'next/navigation';
import { useSpot, useSpotPriceReports, useInfiniteSpotTips, useSpotGallery, useUploadSpotImage } from '@/hooks/use-api';
import { useVoteToggle } from '@/hooks/use-vote-toggle';
import { MapPin, Zap, Info, ArrowLeft, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, Camera, Maximize2, Upload, Loader2, Heart, User } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import GalleryModal from '@/components/spots/gallery-modal';

export default function SpotDetailPage() {
  const { id } = useParams() as { id: string };
  const { data: spot, isLoading: spotLoading } = useSpot(id);
  const { data: reports } = useSpotPriceReports(id);
  const { data: galleryResponse } = useSpotGallery(id, 6);
  const gallery = galleryResponse?.data || [];
  
  const [isClient, setIsClient] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [tipType, setTipType] = useState<'TRY' | 'AVOID'>('TRY');
  const [tipSort, setTipSort] = useState<'popular' | 'newest'>('popular');

  const { 
    data: tipsData, 
    fetchNextPage: fetchNextTips, 
    hasNextPage: hasNextTips, 
    isFetchingNextPage: isFetchingNextTips, 
    isLoading: tipsLoading 
  } = useInfiniteSpotTips(id, tipType, tipSort);

  const tips = tipsData?.pages.flatMap(page => page.data) || [];

  // Infinite scroll trigger
  const observerTarget = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextTips && !isFetchingNextTips) {
          fetchNextTips();
        }
      },
      { threshold: 0.5 }
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, [hasNextTips, isFetchingNextTips, fetchNextTips]);
  
  const uploadMutation = useUploadSpotImage();
  const { toggleVote: toggleTipVote, isPending: tipVotePending } = useVoteToggle('tip', id);
  const { toggleVote: toggleImageVote, isPending: imageVotePending } = useVoteToggle('image', id);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadMutation.mutateAsync({ spotId: id, file });
  };

  if (!isClient || spotLoading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="h-64 bg-gray-100 rounded-[40px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 h-96 bg-gray-100 rounded-[40px]" />
          <div className="h-96 bg-gray-100 rounded-[40px]" />
        </div>
      </div>
    );
  }

  if (!spot) return <div>Spot not found</div>;

  const galleryList = Array.isArray(gallery) ? gallery : [];

  return (
    <div className="space-y-12 pb-24">
      {showGalleryModal && (
        <GalleryModal 
          spotId={id} 
          spotName={spot.name} 
          onClose={() => setShowGalleryModal(false)} 
        />
      )}
      {/* 1. Header & Hero Image */}
      <header className="space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-cyan-400 transition-colors">
          <ArrowLeft size={14} strokeWidth={3} />
          Back to Pulse
        </Link>
        
        {/* Hero Image Section */}
        <div className="relative h-[400px] md:h-[500px] rounded-[40px] overflow-hidden group shadow-2xl shadow-gray-200/50">
          <img 
            src={spot.imageUrl || 'https://images.unsplash.com/photo-1563245394-5b95b8022a4d?auto=format&fit=crop&q=80&w=1200'} 
            alt={spot.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
          
          <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-cyan-400 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg shadow-cyan-400/20">
                  {(spot.category as any)?.name}
                </span>
                <div className="flex items-center gap-1 text-white font-black text-xs">
                  <Zap size={12} fill="currentColor" className="text-cyan-400" />
                  {spot.vibeStats ? `${((spot.vibeStats as any).avgCrowdLevel / 5 * 100).toFixed(0)}% Trust` : 'New Spot'}
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic drop-shadow-sm">{spot.name}</h1>
              <p className="text-gray-300 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                <MapPin size={14} strokeWidth={3} className="text-cyan-400" />
                {spot.address}
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/report" className="bg-white text-gray-900 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-cyan-400 hover:text-white transition-all shadow-xl active:scale-95">
                Submit Report
              </Link>
            </div>
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

      {/* 3. Image Gallery */}
      <section className="space-y-8">
        <header className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <Camera size={20} className="text-cyan-400" />
            <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Vibe Gallery</h3>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="hidden md:flex items-center gap-2 text-[10px] font-black text-gray-900 uppercase tracking-widest hover:text-cyan-400 transition-colors disabled:opacity-50"
            >
              {uploadMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {uploadMutation.isPending ? 'Uploading...' : 'Upload Vibe'}
            </button>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleFileUpload} 
            />
            <button 
              onClick={() => setShowGalleryModal(true)}
              className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-cyan-400 transition-colors flex items-center gap-2"
            >
              View All {galleryResponse?.pagination?.total || galleryList.length} Photos
              <Maximize2 size={12} />
            </button>
          </div>
        </header>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {galleryList.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
               <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">No vibe photos yet</p>
            </div>
          ) : (
            <>
              {galleryList.slice(0, 5).map((img: any) => (
                <div key={img.id} className="aspect-square rounded-3xl overflow-hidden shadow-lg shadow-gray-200/40 group relative">
                  <img 
                    src={`${img.url}?w=300&h=300&fit=crop`} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 cursor-pointer" 
                    alt="Spot Vibe" 
                    onClick={() => setShowGalleryModal(true)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = img.url;
                    }}
                  />
                  <div className="absolute top-3 right-3 flex bg-black/40 backdrop-blur-md p-0.5 rounded-full border border-white/10">
                    <button 
                      onClick={() => toggleImageVote(img)}
                      disabled={imageVotePending}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-black transition-all",
                        img.hasVoted
                          ? "bg-red-500 text-white" 
                          : "text-white/60 hover:text-white"
                      )}
                    >
                      <Heart size={8} fill={img.hasVoted ? "currentColor" : "none"} />
                      {img._count?.votes || 0}
                    </button>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">By {img.user?.name || 'Local'}</span>
                    {img.user?.level && (
                      <span className="bg-cyan-400 text-white px-1.5 py-0.5 rounded-md text-[6px] font-black uppercase tracking-tighter mt-1">
                        Lvl {img.user.level === 'LOCAL_GURU' ? '3' : img.user.level === 'EXPLORER' ? '2' : '1'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {galleryResponse?.pagination?.total && galleryResponse.pagination.total > 5 ? (
                <button 
                  onClick={() => setShowGalleryModal(true)}
                  className="aspect-square rounded-3xl bg-gray-900 text-white flex flex-col items-center justify-center gap-2 shadow-xl shadow-gray-900/20 active:scale-95 transition-transform"
                >
                  <span className="text-xl font-black italic">+{galleryResponse.pagination.total - 5}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest">More Vibes</span>
                </button>
              ) : galleryList.length > 5 ? (
                <button 
                  onClick={() => setShowGalleryModal(true)}
                  className="aspect-square rounded-3xl bg-gray-900 text-white flex flex-col items-center justify-center gap-2 shadow-xl shadow-gray-900/20 active:scale-95 transition-transform"
                >
                  <span className="text-xl font-black italic">+{galleryList.length - 5}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest">More Vibes</span>
                </button>
              ) : null}
            </>
          )}
        </div>
      </section>

      {/* 4. Detailed Data Sections */}
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
          <header className="flex flex-col gap-4 px-2">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Community Tips</h3>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button 
                  onClick={() => setTipSort('popular')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    tipSort === 'popular' ? "bg-white text-cyan-400 shadow-sm" : "text-gray-400"
                  )}
                >
                  Popular
                </button>
                <button 
                  onClick={() => setTipSort('newest')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    tipSort === 'newest' ? "bg-white text-cyan-400 shadow-sm" : "text-gray-400"
                  )}
                >
                  Newest
                </button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setTipType('TRY')}
                className={cn(
                  "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                  tipType === 'TRY' ? "bg-emerald-50 text-emerald-500 border-emerald-100 shadow-sm" : "bg-white text-gray-400 border-gray-100 hover:bg-gray-50"
                )}
              >
                Tips to Try
              </button>
              <button
                onClick={() => setTipType('AVOID')}
                className={cn(
                  "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                  tipType === 'AVOID' ? "bg-red-50 text-red-500 border-red-100 shadow-sm" : "bg-white text-gray-400 border-gray-100 hover:bg-gray-50"
                )}
              >
                What to Avoid
              </button>
            </div>
          </header>

          <div className="space-y-6">
            {tipsLoading ? (
               <div className="py-20 flex justify-center">
                 <Loader2 size={24} className="text-cyan-400 animate-spin" />
               </div>
            ) : tips?.length === 0 ? (
              <div className="py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200 text-xs font-bold text-gray-300 uppercase italic">Be the first to share a {tipType.toLowerCase()} tip</div>
            ) : (
              <>
                {tips?.map((tip: any) => (
                  <div key={tip.id} className={cn(
                    "p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/20",
                    tip.type === 'AVOID' ? "bg-red-50/20" : "bg-emerald-50/20"
                  )}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 overflow-hidden shadow-sm">
                            {tip.user?.avatarUrl ? (
                              <img src={tip.user.avatarUrl} className="w-full h-full object-cover" />
                            ) : (
                              <User size={14} />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] font-black text-gray-900 uppercase">
                                {tip.user?.name || 'Local'}
                              </p>
                              {tip.user?.level && (
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-tighter",
                                  tip.type === 'AVOID' ? "bg-red-100 text-red-500" : "bg-emerald-100 text-emerald-500"
                                )}>
                                  Lvl {tip.user.level === 'LOCAL_GURU' ? '3' : tip.user.level === 'EXPLORER' ? '2' : '1'}
                                </span>
                              )}
                            </div>
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                               {new Date(tip.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                          <button 
                            onClick={() => toggleTipVote(tip)}
                            disabled={tipVotePending}
                            className={cn(
                              "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black transition-all",
                              tip.hasVoted
                                ? "bg-red-50 text-red-500" 
                                : "text-gray-400 hover:text-red-500 hover:bg-red-50/50"
                            )}
                          >
                            <Heart size={12} fill={tip.hasVoted ? "currentColor" : "none"} />
                            {tip._count?.votes || 0}
                          </button>
                        </div>
                      </div>

                      <div className="pl-11 space-y-2">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">{tip.title}</h4>
                        <p className="text-xs font-medium text-gray-600 leading-relaxed">{tip.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Infinite scroll target */}
                <div ref={observerTarget} className="py-10 flex justify-center">
                  {isFetchingNextTips ? (
                    <Loader2 size={24} className="text-cyan-400 animate-spin" />
                  ) : hasNextTips ? (
                    <div className="h-4 w-4" />
                  ) : (
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">End of tips</p>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
