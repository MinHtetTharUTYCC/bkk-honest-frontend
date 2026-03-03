'use client';

import { useState, useEffect, useRef } from 'react';
import { useInfiniteSpotGallery, useUploadSpotImage } from '@/hooks/use-api';
import { useVoteToggle } from '@/hooks/use-vote-toggle';
import { X, Camera, Loader2, TrendingUp, Calendar, User, Upload, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GalleryModalProps {
  spotId: string;
  spotName: string;
  onClose: () => void;
}

export default function GalleryModal({ spotId, spotName, onClose }: GalleryModalProps) {
  const [sort, setSort] = useState<'popular' | 'newest'>('popular');
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useInfiniteSpotGallery(spotId, sort);

  const uploadMutation = useUploadSpotImage();
  const { toggleVote, isPending: votePending } = useVoteToggle('image', spotId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = data?.pages.flatMap(page => page.data) || [];

  // Infinite scroll trigger
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadMutation.mutateAsync({ spotId, file });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-gray-900/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-6xl h-full bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <header className="p-8 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">{spotName} Gallery</h2>
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button 
                  onClick={() => setSort('popular')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    sort === 'popular' ? "bg-white text-cyan-400 shadow-sm" : "text-gray-400"
                  )}
                >
                  Popular
                </button>
                <button 
                  onClick={() => setSort('newest')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    sort === 'newest' ? "bg-white text-cyan-400 shadow-sm" : "text-gray-400"
                  )}
                >
                  Newest
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="hidden md:flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all active:scale-95 disabled:opacity-50"
            >
              <Upload size={14} />
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
              onClick={onClose}
              className="p-3 bg-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-gray-50/50">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Loader2 size={40} className="text-cyan-400 animate-spin" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Vibes...</p>
            </div>
          ) : images.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 bg-gray-100 rounded-[32px] flex items-center justify-center text-gray-300">
                  <Camera size={40} />
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-black text-gray-900 uppercase italic tracking-tight">No vibes yet</h4>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Be the first to share a photo of this spot</p>
                </div>
             </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.map((img: any) => (
                  <div key={img.id} className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/20 group">
                    <div className="aspect-[4/5] relative overflow-hidden">
                      <img 
                        src={img.url} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        alt="Spot vibe"
                        loading="lazy"
                      />
                      <div className="absolute top-4 right-4 flex bg-gray-900/80 backdrop-blur-md p-1 rounded-full border border-white/10">
                        <button 
                          onClick={() => toggleVote(img)}
                          disabled={votePending}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black transition-all",
                            img.hasVoted 
                              ? "bg-red-500 text-white" 
                              : "text-white/60 hover:text-white"
                          )}
                        >
                          <Heart size={10} fill={img.hasVoted ? "currentColor" : "none"} className={cn(img.hasVoted ? "text-white" : "text-red-400")} />
                          {img._count?.votes || 0}
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                          {img.user?.avatarUrl ? (
                            <img src={img.user.avatarUrl} className="w-full h-full object-cover" />
                          ) : (
                            <User size={14} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-black text-gray-900 uppercase truncate">
                              {img.user?.name || 'Local'}
                            </p>
                            {img.user?.level && (
                              <span className="bg-cyan-50 text-cyan-500 px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-tighter">
                                Lvl {img.user.level === 'LOCAL_GURU' ? '3' : img.user.level === 'EXPLORER' ? '2' : '1'}
                              </span>
                            )}
                          </div>
                          <p className="text-[8px] font-bold text-gray-400 uppercase flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(img.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Infinite scroll target */}
              <div ref={observerTarget} className="py-20 flex justify-center">
                {isFetchingNextPage ? (
                  <Loader2 size={24} className="text-cyan-400 animate-spin" />
                ) : hasNextPage ? (
                  <div className="h-4 w-4" />
                ) : (
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">End of the pulse</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile FAB */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="md:hidden fixed bottom-12 right-12 w-16 h-16 bg-gray-900 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 disabled:opacity-50 z-20"
        >
          {uploadMutation.isPending ? <Loader2 className="animate-spin" /> : <Camera />}
        </button>
      </div>
    </div>
  );
}
