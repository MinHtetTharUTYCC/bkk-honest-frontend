"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useSpotGallery, useUploadSpotImage } from "@/hooks/use-api";
import { useVoteToggle } from "@/hooks/use-vote-toggle";
import { Camera, Upload, Maximize2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GalleryImage, SpotData } from "@/types/spot";
import GalleryModal from "@/components/spots/gallery-modal";
import { LikeButton } from "@/components/ui/like-button";
import { useRouter, usePathname } from "next/navigation";

interface GalleryTabProps {
  spot: SpotData;
}

export default function GalleryTab({ spot }: GalleryTabProps) {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const spotId = spot.id;

  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: galleryResponse } = useSpotGallery(spotId, 6);
  const uploadMutation = useUploadSpotImage();
  const { toggleVote: toggleImageVote, isPending: imageVotePending } = useVoteToggle("image", spotId);

  const galleryList = Array.isArray(galleryResponse?.data) ? galleryResponse.data : [];
  const galleryTotal = (galleryResponse as { pagination?: { total?: number } })?.pagination?.total;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadMutation.mutateAsync({ spotId, file });
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {showGalleryModal && <GalleryModal spotId={spotId} spotName={spot.name} onClose={() => setShowGalleryModal(false)} />}
      
      <header className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <Camera size={20} className="text-amber-400" />
          <h3 className="text-2xl font-display font-bold text-white">
            <span className="md:hidden">Vibe</span>
            <span className="hidden md:block">Vibe Gallery</span>
          </h3>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              if (!authUser) {
                router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
                return;
              }
              fileInputRef.current?.click();
            }}
            disabled={uploadMutation.isPending}
            className="group bg-amber-500 text-black hover:text-white px-6 py-3 rounded-xl text-[10px] font-semibold tracking-wide hover:bg-amber-400 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
          >
            {uploadMutation.isPending ? <Loader2 size={14} className="animate-spin text-black group-hover:text-white" /> : <Upload size={14} className="text-black group-hover:text-white transition-colors" />}
            <span className="hidden md:inline">{uploadMutation.isPending ? "Uploading..." : "Upload Photo"}</span>
            <span className="md:hidden">{uploadMutation.isPending ? "..." : "Upload"}</span>
          </button>
          <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} />
          {(galleryTotal || galleryList.length) > 0 && (
            <button onClick={() => setShowGalleryModal(true)} className="text-[10px] font-medium text-amber-500 uppercase tracking-widest hover:text-amber-400 transition-colors flex items-center gap-2">
              <span className="hidden md:inline">View All {galleryTotal || galleryList.length} Photos</span>
              <span className="md:hidden">All ({galleryTotal || galleryList.length})</span>
              <Maximize2 size={12} />
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {galleryList.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/20">
            <p className="text-sm font-semibold text-white/40 tracking-wide">No vibe photos yet</p>
          </div>
        ) : (
          <>
            {(galleryList as GalleryImage[]).slice(0, 5).map((img) => (
              <div key={img.id} className="aspect-square rounded-2xl overflow-hidden shadow-lg shadow-black/20 group relative border border-border">
                <img
                  src={`${img.url}?w=300&h=300&fit=crop`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110 cursor-pointer"
                  alt="Spot Vibe"
                  onClick={() => setShowGalleryModal(true)}
                  onError={(e) => { (e.target as HTMLImageElement).src = img.url; }}
                />
                <div className="absolute top-3 right-3 flex bg-white/10 p-0.5 rounded-lg border border-border shadow-sm">
                  <LikeButton
                    count={img._count?.votes || 0}
                    isVoted={img.hasVoted}
                    onVote={async () => {
                      await toggleImageVote({ id: img.id, hasVoted: img.hasVoted, voteId: img.voteId, _count: { votes: img._count?.votes ?? 0 } });
                    }}
                    isPending={imageVotePending}
                    disabled={imageVotePending}
                    variant="overlay"
                    size="sm"
                    className="text-xs font-semibold gap-1.5 px-4 py-2 rounded-md bg-white/0 hover:bg-white/0"
                  />
                </div>
              </div>
            ))}
            {(galleryTotal && galleryTotal > 5) || galleryList.length > 5 ? (
              <button onClick={() => setShowGalleryModal(true)} className="aspect-square rounded-xl bg-amber-500 text-white flex flex-col items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 transition-transform">
                <span className="text-xl font-display font-bold">+{Math.max(0, (galleryTotal || galleryList.length) - 5)}</span>
                <span className="text-[8px] font-semibold tracking-wide">More Vibes</span>
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}