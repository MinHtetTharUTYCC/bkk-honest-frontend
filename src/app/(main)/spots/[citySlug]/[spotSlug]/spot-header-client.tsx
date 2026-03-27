"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SpotWithStatsResponseDto } from "@/api/generated/model";
import SpotHeader from "@/components/spots/spot-header";
import SpotStatsGrid from "@/components/spots/spot-stats-grid";
import SpotEditModal from "@/components/spots/spot-edit-modal";
import { ImageViewer } from "@/components/ui/image-viewer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useSpotsControllerDelete, getSpotsControllerFindBySlugQueryKey } from "@/api/generated/spots/spots";
import { useSpotBySlug } from "@/hooks/use-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SpotWithStatsResponseDto } from "@/api/generated/model";

interface SpotHeaderClientProps {
  spot: SpotWithStatsResponseDto;
  citySlug: string;
  spotSlug: string;
  basePath: string;
  children: React.ReactNode;
}

export default function SpotHeaderClient({ 
  spot: initialSpot, 
  citySlug, 
  spotSlug, 
  basePath, 
  children 
}: SpotHeaderClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();

  // Sync initialSpot to TanStack cache if it's not there
  // This ensures other components (like TipsTab) can benefit from the SSR data
  useState(() => {
    queryClient.setQueryData(getSpotsControllerFindBySlugQueryKey(citySlug, spotSlug), { data: initialSpot });
  });

  // Use the authenticated spot from SSR as initial data
  const { data: spotData = initialSpot } = useSpotBySlug(citySlug, spotSlug);

  const spot = (spotData || initialSpot) as SpotWithStatsResponseDto;

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);

  const deleteSpotMutation = useSpotsControllerDelete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["spots"] });
        toast.success("Spot deleted");
        router.push("/");
      },
      onError: () => {
        toast.error("Failed to delete spot");
      }
    }
  });

  const tabs = [
    { id: "tips", label: "Tips & Updates", path: `${basePath}/tips` },
    { id: "vibes", label: "Live Vibes", path: `${basePath}/vibes` },
    { id: "prices", label: "Prices", path: `${basePath}/prices` },
    { id: "gallery", label: "Gallery", path: `${basePath}/gallery` },
  ];

  const activeTabId = tabs.find(t => pathname.includes(t.path))?.id || "tips";

  return (
    <>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the spot and all associated contributions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSpotMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteSpotMutation.mutate({ id: (spot as SpotWithStatsResponseDto).id });
              }}
              disabled={deleteSpotMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteSpotMutation.isPending ? "Deleting..." : "Delete Spot"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isEditing && (
        <SpotEditModal spot={spot as SpotWithStatsResponseDto} onClose={() => setIsEditing(false)} />
      )}

      <ImageViewer
        isOpen={showImageViewer && !!spot.imageVariants}
        imageVariants={spot.imageVariants || { thumbnail: '', display: '' }}
        alt={spot.name}
        onClose={() => setShowImageViewer(false)}
      />

      <SpotHeader
        spot={spot as SpotWithStatsResponseDto}
        onEdit={() => setIsEditing(true)}
        onDelete={() => setIsDeleteDialogOpen(true)}
        onImageClick={() => setShowImageViewer(true)}
      />

      <SpotStatsGrid spot={spot as SpotWithStatsResponseDto} className="md:hidden my-8" />

      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto hide-scrollbar sticky top-20 z-40 backdrop-blur-md">
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.path}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap text-center",
                isActive
                  ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-8">
        {children}
      </div>
    </>
  );
}
