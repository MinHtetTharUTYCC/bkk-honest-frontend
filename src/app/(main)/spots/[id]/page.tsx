'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSpot, useSpotPriceReports, useInfiniteSpotTips, useSpotGallery, useUploadSpotImage } from '@/hooks/use-api';
import { useVoteToggle } from '@/hooks/use-vote-toggle';
import { MapPin, Zap, Info, ArrowLeft, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, Camera, Maximize2, Upload, Loader2, Heart, User, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import GalleryModal from '@/components/spots/gallery-modal';
import CreateTipModal from '@/components/tips/create-tip-modal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function SpotDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: spot, isLoading: spotLoading } = useSpot(id);
  const { data: reports } = useSpotPriceReports(id);
  const { data: galleryResponse } = useSpotGallery(id, 6);
  const gallery = galleryResponse?.data || [];
  
  const [isClient, setIsClient] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'gallery' | 'prices' | 'tips'>('tips');
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
          console.log('Fetching next tips...');
          fetchNextTips();
        }
      },
      { 
        rootMargin: '200px',
        threshold: 0.1 
      }
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, [hasNextTips, isFetchingNextTips, fetchNextTips]);
  
  const uploadMutation = useUploadSpotImage();
  const { toggleVote: toggleTipVote, isPending: tipVotePending } = useVoteToggle('tip', id);
  const { toggleVote: toggleImageVote, isPending: imageVotePending } = useVoteToggle('image', id);
  
  const queryClient = useQueryClient();
  const deleteSpotMutation = useMutation({
    mutationFn: async () => {
      if (!confirm('Are you sure you want to delete this spot? This action cannot be undone.')) return;
      await api.delete(`/spots/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spots'] });
      router.push('/');
    },
  });

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
      {showTipModal && (
        <CreateTipModal 
          spotId={id} 
          onClose={() => setShowTipModal(false)} 
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
          
          <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
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
              <button 
                onClick={() => deleteSpotMutation.mutate()}
                disabled={deleteSpotMutation.isPending}
                className="bg-white/10 backdrop-blur-md text-white p-4 rounded-2xl hover:bg-red-500 transition-all active:scale-95 border border-white/20 shadow-xl"
                title="Delete Spot"
              >
                {deleteSpotMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Key Data Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border-2 border-gray-900/10 shadow-xl shadow-gray-200/20">
          <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 md:mb-4">Avg Price (THB)</span>
          <div className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter italic">
            {(spot.priceStats as any)?.avg ? `${(spot.priceStats as any).avg.toFixed(0)}` : '--'}
          </div>
          <div className="mt-1 md:mt-2 text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Across {(spot.priceStats as any)?.count || 0} Reports</div>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border-2 border-gray-900/10 shadow-xl shadow-gray-200/20">
          <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 md:mb-4">Fair Range</span>
          <div className="text-lg md:text-xl font-black text-gray-900 tracking-tighter uppercase flex items-center gap-1 md:gap-2">
            <span className="text-emerald-500 italic">{(spot.priceStats as any)?.min || '--'}</span>
            <span className="text-gray-200">-</span>
            <span className="text-red-500 italic">{(spot.priceStats as any)?.max || '--'}</span>
          </div>
          <div className="mt-1 md:mt-2 text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">THB Range</div>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border-2 border-gray-900/10 shadow-xl shadow-gray-200/20">
          <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 md:mb-4">Live Vibe</span>
          <div className="text-lg md:text-xl font-black text-gray-900 tracking-tighter uppercase italic">
            {(spot.vibeStats as any)?.avgCrowdLevel ? `${((spot.vibeStats as any).avgCrowdLevel).toFixed(1)} / 5` : 'No Data'}
          </div>
          <div className="mt-1 md:mt-2 text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Crowd Rating</div>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border-2 border-gray-900/10 shadow-xl shadow-gray-200/20">
          <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 md:mb-4">Verified by</span>
          <div className="text-lg md:text-xl font-black text-gray-900 tracking-tighter uppercase italic">
            {reports?.length || 0} Locals
          </div>
          <div className="mt-1 md:mt-2 text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Community Score</div>
        </div>
      </div>

      {/* Mobile Tabs Switcher */}
      <div className="md:hidden sticky top-0 bg-white/80 backdrop-blur-md z-30 -mx-4 px-4 py-3 border-b border-gray-300">
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('gallery')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'gallery' ? "bg-white text-cyan-400 shadow-sm" : "text-gray-400"
            )}
          >
            Vibes
          </button>
          <button 
            onClick={() => setActiveTab('prices')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'prices' ? "bg-white text-cyan-400 shadow-sm" : "text-gray-400"
            )}
          >
            Prices
          </button>
          <button 
            onClick={() => setActiveTab('tips')}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'tips' ? "bg-white text-cyan-400 shadow-sm" : "text-gray-400"
            )}
          >
            Tips
          </button>
        </div>
      </div>

      {/* 3. Image Gallery */}
      <section className={cn("space-y-8 md:block", activeTab === 'gallery' ? "block" : "hidden")}>
        <header className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <Camera size={20} className="text-cyan-400" />
            <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">
              <span className="md:hidden">Vibe</span>
              <span className="hidden md:block">Vibe Gallery</span>
            </h3>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="group bg-gray-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
            >
              {uploadMutation.isPending ? (
                <Loader2 size={14} className="animate-spin text-cyan-400 group-hover:text-white" />
              ) : (
                <Upload size={14} className="text-cyan-400 group-hover:text-white transition-colors" />
              )}
              <span className="hidden md:inline">{uploadMutation.isPending ? 'Uploading...' : 'Upload Vibe'}</span>
              <span className="md:hidden">{uploadMutation.isPending ? '...' : 'Upload'}</span>
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
              <span className="hidden md:inline">View All {galleryResponse?.pagination?.total || galleryList.length} Photos</span>
              <span className="md:hidden">All ({galleryResponse?.pagination?.total || galleryList.length})</span>
              <Maximize2 size={12} />
            </button>
          </div>
        </header>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {galleryList.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-300">
               <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">No vibe photos yet</p>
            </div>
          ) : (
            <>
              {galleryList.slice(0, 5).map((img: any) => (
                <div key={img.id} className="aspect-square rounded-3xl overflow-hidden shadow-lg shadow-gray-200/40 group relative border-2 border-gray-900/10">
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
                    <span className="text-[8px] font-black text-white tracking-widest">by {img.user?.name || 'local'}</span>
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
        <section className={cn("md:col-span-2 space-y-8 md:block", activeTab === 'prices' ? "block" : "hidden")}>
          <header className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Recent Price Reports</h3>
            <Info size={16} className="text-gray-300" />
          </header>
          <div className="bg-white rounded-[40px] border-2 border-gray-900/10 shadow-xl shadow-gray-200/20 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-900/5">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Item Name</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Price</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-900/5">
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
        <section className={cn("space-y-8 md:block", activeTab === 'tips' ? "block" : "hidden")}>
          <header className="flex flex-col gap-6 px-2">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Tips</h3>
              <button 
                onClick={() => setShowTipModal(true)}
                className="group bg-gray-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Zap size={14} fill="currentColor" className="text-cyan-400 group-hover:text-white transition-colors" />
                <span className="hidden sm:inline">Share a New Tip</span>
                <span className="sm:hidden">New Tip</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setTipType('TRY')}
                  className={cn(
                    "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                    tipType === 'TRY' ? "bg-emerald-50 text-emerald-500 border-emerald-500/20 shadow-sm" : "bg-white text-gray-400 border-gray-900/10 hover:bg-gray-50"
                  )}
                >
                  To Try
                </button>
                <button
                  onClick={() => setTipType('AVOID')}
                  className={cn(
                    "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                    tipType === 'AVOID' ? "bg-red-50 text-red-500 border-red-500/20 shadow-sm" : "bg-white text-gray-400 border-gray-900/10 hover:bg-gray-50"
                  )}
                >
                  To Avoid
                </button>
              </div>
            </div>
          </header>

          <div className="space-y-4">
            <div className="flex justify-end">
              <div className="flex bg-gray-100 p-1 rounded-xl w-fit border-2 border-gray-900/10">
                <button 
                  onClick={() => setTipSort('popular')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    tipSort === 'popular' ? "bg-white text-cyan-400 shadow-sm border border-gray-900/10" : "text-gray-400"
                  )}
                >
                  Popular
                </button>
                <button 
                  onClick={() => setTipSort('newest')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    tipSort === 'newest' ? "bg-white text-cyan-400 shadow-sm border border-gray-900/10" : "text-gray-400"
                  )}
                >
                  Newest
                </button>
              </div>
            </div>
            {tipsLoading ? (
               <div className="py-20 flex justify-center">
                 <Loader2 size={24} className="text-cyan-400 animate-spin" />
               </div>
            ) : tips?.length === 0 ? (
              <div className="py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-300 text-xs font-bold text-gray-300 uppercase italic">Be the first to share a {tipType.toLowerCase()} tip</div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-2.5 pb-8">
                  {tips?.map((tip: any) => (
                    <div key={tip.id} className={cn(
                      "p-4 rounded-3xl border-2 border-gray-900/10 shadow-lg shadow-gray-200/10",
                      tip.type === 'AVOID' ? "bg-red-50/20" : "bg-emerald-50/20"
                    )}>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-white border-2 border-gray-900/10 flex items-center justify-center text-gray-400 overflow-hidden shadow-sm">
                              {tip.user?.avatarUrl ? (
                                <img src={tip.user.avatarUrl} className="w-full h-full object-cover" />
                              ) : (
                                <User size={10} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-[10px] font-black text-gray-900 leading-none">
                                  {tip.user?.name || 'local'}
                                </p>
                                {tip.user?.level && (
                                  <span className={cn(
                                    "px-1.5 py-0.5 rounded-md text-[6px] font-black uppercase tracking-tighter",
                                    tip.type === 'AVOID' ? "bg-red-100 text-red-500" : "bg-emerald-100 text-emerald-500"
                                  )}>
                                    Lvl {tip.user.level === 'LOCAL_GURU' ? '3' : tip.user.level === 'EXPLORER' ? '2' : '1'}
                                  </span>
                                )}
                              </div>
                              <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest block leading-tight">
                                {new Date(tip.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex bg-white p-0.5 rounded-lg border-2 border-gray-900/10 shadow-sm">
                            <button 
                              onClick={() => toggleTipVote(tip)}
                              disabled={tipVotePending}
                              className={cn(
                                "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-black transition-all",
                                tip.hasVoted
                                  ? "bg-red-50 text-red-500" 
                                  : "text-gray-400 hover:text-red-500 hover:bg-red-50/50"
                              )}
                            >
                              <Heart size={8} fill={tip.hasVoted ? "currentColor" : "none"} />
                              {tip._count?.votes || 0}
                            </button>
                          </div>
                        </div>

                        <div className="pl-8">
                          <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight leading-none mb-1">{tip.title}</h4>
                          <p className="text-[11px] font-medium text-gray-600 leading-snug">{tip.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Infinite scroll target */}
                  <div ref={observerTarget} className="py-6 flex justify-center">
                    {isFetchingNextTips ? (
                      <Loader2 size={20} className="text-cyan-400 animate-spin" />
                    ) : hasNextTips ? (
                      <div className="h-4 w-4" />
                    ) : (
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">End of tips</p>
                    )}
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
