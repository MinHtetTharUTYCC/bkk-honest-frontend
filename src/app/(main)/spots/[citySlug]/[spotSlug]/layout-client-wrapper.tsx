"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SpotData } from "@/types/spot";
import SpotHeader from "@/components/spots/spot-header";
import SpotStatsGrid from "@/components/spots/spot-stats-grid";
import SpotEditModal from "@/components/spots/spot-edit-modal";
import { ImageViewer } from "@/components/ui/image-viewer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LayoutClientWrapperProps {
  spot: SpotData;
  citySlug: string;
  spotSlug: string;
  basePath: string;
  children: React.ReactNode;
}

export default function LayoutClientWrapper({ spot, citySlug, spotSlug, basePath, children }: LayoutClientWrapperProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);

  const deleteSpotMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/spots/${spot.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spots"] });
      toast.success("Spot deleted");
      router.push("/");
    },
    onError: () => {
      toast.error("Failed to delete spot");
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
                deleteSpotMutation.mutate();
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
        <SpotEditModal spot={spot} onClose={() => setIsEditing(false)} />
      )}

      <ImageViewer
        isOpen={showImageViewer && !!spot.imageUrl}
        imageUrl={spot.imageUrl || ''}
        alt={spot.name}
        onClose={() => setShowImageViewer(false)}
      />

      <SpotHeader
        spot={spot}
        onEdit={() => setIsEditing(true)}
        onDelete={() => setIsDeleteDialogOpen(true)}
        onImageClick={() => setShowImageViewer(true)}
      />

      <SpotStatsGrid spot={spot} className="md:hidden my-8" />

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