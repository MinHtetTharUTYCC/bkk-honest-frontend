"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useInfiniteSpotGallery, useUploadSpotImage, useDeleteGalleryImage, useFlagGalleryImage } from "@/hooks/use-api";
import { useVoteToggle } from "@/hooks/use-vote-toggle";
import { Camera, Upload, Loader2, User, Calendar, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { GalleryImage, SpotData } from "@/types/spot";
import { LikeButton } from "@/components/ui/like-button";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";
import Link from "next/link";
import { ImageViewer } from "@/components/ui/image-viewer";
import { buildRenderableImage, extractGalleryImageData } from "@/lib/image-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GalleryTabProps {
  spot: SpotData;
}

export default function GalleryTab({ spot }: GalleryTabProps) {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const spotId = spot.id;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);

  // Sync state with URL params
  const sort = (searchParams.get("sort") as "popular" | "newest") || "newest";

  const {
    data: galleryData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteSpotGallery(spotId, sort);

  const { toggleVote, isPending: votePending } = useVoteToggle("image", spotId);
  const [votingImageId, setVotingImageId] = useState<string | null>(null);

  const uploadMutation = useUploadSpotImage();
  const deleteMutation = useDeleteGalleryImage();
  const flagMutation = useFlagGalleryImage();

  const images = useMemo(() => {
    const rawImages = galleryData?.pages.flatMap((page) => (page as { data?: GalleryImage[] })?.data || []) || [];
    // Deduplicate items just in case
    return Array.from(new Map(rawImages.map((img) => [img.id, img])).values());
  }, [galleryData]);

  const totalCount = (galleryData?.pages?.[0] as { pagination?: { total: number } } | undefined)?.pagination?.total || images.length;

  const { ref: observerTarget, inView } = useInView({ threshold: 0.1, rootMargin: "200px" });
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!inView) hasFetchedRef.current = false;
  }, [inView]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side size validation (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large", { description: "Maximum size is 10MB" });
      return;
    }

    try {
      const response = await uploadMutation.mutateAsync({ spotId, file });
      const newImage = response?.data || response;

      // Manually update the infinite query cache to show the new image at index 0 immediately
      // This ensures the new upload stays at the top regardless of sort (Popular vs Newest)
      const sortTypes = ['popular', 'newest'];
      sortTypes.forEach((sortType) => {
        queryClient.setQueryData(
          ['gallery-infinite', spotId, sortType],
          (oldData: { pages: Array<{ data: GalleryImage[] }>; pageParams: any } | undefined) => {
            if (!oldData || !oldData.pages) return oldData;
            
            const newPages = [...oldData.pages];
            if (newPages.length === 0) {
              newPages[0] = { data: [newImage] };
            } else {
              const firstPage = { ...newPages[0] };
              firstPage.data = [newImage, ...(firstPage.data || [])];
              newPages[0] = firstPage;
            }
            
            return {
              ...oldData,
              pages: newPages,
            };
          }
        );
      });

      toast.success("Photo uploaded successfully!");
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const error = err as { response?: { data?: { message?: string | string[] } }; message?: string };
      const errorMessage = error.response?.data?.message || error.message || "Failed to upload photo";
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  const handleSortChange = (newSort: "popular" | "newest") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleFlagImage = async (id: string) => {
    if (!authUser) {
      toast.error("Join us first to report!", { description: "Please login to help keep the community safe." });
      return;
    }
    try {
      await flagMutation.mutateAsync(id);
      toast.success("Photo reported successfully", { description: "Our moderators will review it soon." });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } } };
      const errorMessage = error.response?.data?.message || "Failed to report photo";
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }
  };

  const handleDeleteImage = async () => {
    if (!deleteImageId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteImageId, spotId });
      toast.success("Photo deleted successfully");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } } };
      const errorMessage = error.response?.data?.message || "Failed to delete photo";
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    } finally {
      setDeleteImageId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <ImageViewer
        isOpen={!!selectedImage}
        imageVariants={selectedImage?.imageVariants || { thumbnail: '', display: '' }}
        onClose={() => setSelectedImage(null)}
      />

      <AlertDialog open={!!deleteImageId} onOpenChange={(open) => !open && setDeleteImageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove this photo from the gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteImage();
              }}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Photo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <header className="flex flex-col gap-6 px-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Camera size={20} className="text-amber-400" />
            <h3 className="text-2xl font-display font-bold text-white flex items-center gap-3">
              Vibe Gallery
              {totalCount > 0 && (
                <span className="text-sm font-bold text-white/40 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10 tracking-widest">
                  {totalCount}
                </span>
              )}
            </h3>
          </div>
          
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
            {uploadMutation.isPending ? (
              <Loader2 size={14} className="animate-spin text-black group-hover:text-white" />
            ) : (
              <Upload size={14} className="text-black group-hover:text-white transition-colors" />
            )}
            <span className="hidden sm:inline">{uploadMutation.isPending ? "Uploading..." : "Upload Photo"}</span>
            <span className="sm:hidden">{uploadMutation.isPending ? "..." : "Upload"}</span>
          </button>
          <input type="file" className="hidden" ref={fileInputRef} accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileUpload} />
        </div>

        <div className="flex justify-end">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => handleSortChange("popular")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer",
                sort === "popular" ? "bg-white/10 text-amber-400 shadow-sm" : "text-white/40 hover:text-white/70"
              )}
            >
              Popular
            </button>
            <button
              onClick={() => handleSortChange("newest")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer",
                sort === "newest" ? "bg-white/10 text-amber-400 shadow-sm" : "text-white/40 hover:text-white/70"
              )}
            >
              Newest
            </button>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/5] bg-white/5 rounded-2xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 mx-2">
          <Camera size={32} className="text-white/10 mx-auto mb-3" />
          <p className="text-sm font-bold text-white/40 uppercase tracking-widest">No vibes yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-2">
          {images.map((img) => {
            const isOwner = authUser?.id === img.userId;
            return (
              <div
                key={img.id}
                className="bg-card rounded-2xl overflow-hidden border border-white/8 shadow-xl shadow-black/30 group relative flex flex-col"
              >
                {/* Action Buttons Overlay (Delete for owner, Report for others) */}
                <div className="absolute top-3 left-3 z-30 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
                  {isOwner ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteImageId(img.id);
                      }}
                      className="p-2 rounded-lg bg-black/40 hover:bg-red-500/80 text-white/70 hover:text-white backdrop-blur-md border border-white/10 transition-colors"
                      title="Delete photo"
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFlagImage(img.id);
                      }}
                      className="p-2 rounded-lg bg-black/40 hover:bg-orange-500/80 text-white/70 hover:text-white backdrop-blur-md border border-white/10 transition-colors"
                      title="Report inappropriate content"
                    >
                      <AlertCircle size={14} />
                    </button>
                  )}
                </div>

                <div 
                  className="aspect-[4/5] relative overflow-hidden cursor-zoom-in"
                  onClick={() => setSelectedImage(img)}
                >
                  {img.imageVariants && (
                    <OptimizedImage
                      variants={img.imageVariants}
                      alt="Gallery image"
                      size="display"
                      fill
                      width={img.imageWidth}
                      height={img.imageHeight}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      blurDataURL={img.blurPlaceholder}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                      <Camera size={20} className="text-white" />
                    </div>
                  </div>
                </div>

                <div className="p-2.5 md:p-4 bg-white/[0.02]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Link 
                        href={`/profile/${img.userId}`}
                        className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 overflow-hidden hover:border-amber-400 border border-transparent transition-colors shrink-0"
                      >
                        {(img.user as any)?.avatarUrl ? (
                          <img alt="" src={(img.user as any).avatarUrl} className="w-full h-full object-cover" />
                        ) : (
                          <User size={12} />
                        )}
                      </Link>
                      <div className="flex flex-col min-w-0">
                        <Link 
                          href={`/profile/${img.userId}`}
                          className="text-[9px] font-black text-foreground uppercase truncate hover:text-amber-400 transition-colors tracking-tight"
                        >
                          {img.user?.name || 'Local'}
                        </Link>
                        <span className="text-[8px] font-medium text-white/30 uppercase flex items-center gap-1">
                          <Calendar size={8} />
                          {img.createdAt ? new Date(img.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>

                    <LikeButton
                      count={img._count?.votes || 0}
                      isVoted={img.hasVoted}
                      onVote={async () => {
                        if (!authUser) {
                          toast.error("Join us to like photos!", { description: "Login to save your favorites." });
                          return;
                        }
                        setVotingImageId(img.id);
                        try {
                          await toggleVote({ id: img.id, hasVoted: img.hasVoted, voteId: img.voteId, _count: { votes: img._count?.votes ?? 0 } });
                        } finally {
                          setVotingImageId(null);
                        }
                      }}
                      isPending={votePending && votingImageId === img.id}
                      disabled={votePending && votingImageId === img.id}
                      variant="overlay"
                      size="sm"
                      className="text-[10px] font-semibold gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div ref={observerTarget} className="py-20 flex justify-center">
        {isFetchingNextPage ? (
          <Loader2 size={24} className="text-amber-400 animate-spin" />
        ) : hasNextPage ? (
          <div className="h-4 w-4" />
        ) : (
          <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.2em]">End of gallery</p>
        )}
      </div>
    </div>
  );
}
