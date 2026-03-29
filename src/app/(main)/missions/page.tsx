"use client";
import { Suspense, useState, useEffect, useMemo } from "react";

import {
  useMissions,
  useMissionStats,
  useUpdateMission,
  useDeleteMission,
} from "@/hooks/use-api";
import {
  Target,
  CheckCircle2,
  Circle,
  MapPin,
  Trash2,
  Loader2,
  ArrowRight,
  Zap,
  Trophy,
  Filter,
  SortAsc,
  SortDesc,
  ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCity } from "@/components/providers/city-provider";
import { getSpotUrl } from "@/lib/slug";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useInView } from "react-intersection-observer";
import LoginRequired from "@/components/auth/login-required";

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

interface MissionItem {
  id: string;
  completed: boolean;
  spot?: {
    name?: string;
    slug?: string;
    city?: { slug?: string };
    imageVariants?: {
      thumbnail: string;
      display: string;
    };
  };
}

function MissionsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [missionToDelete, setMissionToDelete] = useState<string | null>(null);
  // Sync state with URL params
  const statusFilter =
    (searchParams.get("status") as "all" | "pending" | "completed") ||
    "pending";
  const sortOrder =
    (searchParams.get("sort") as "newest" | "oldest") || "newest";

  const setStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", status);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setSortOrder = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const {
    data: missionsData,
    isLoading: missionsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMissions(statusFilter, sortOrder);
  const { data: stats } = useMissionStats();

  const updateMission = useUpdateMission();
  const deleteMission = useDeleteMission();

  const { ref: observerTarget, inView } = useInView({ threshold: 0.1 });

  // Helper to close dialog and show feedback after successful deletion
  const handleConfirmDelete = async () => {
    if (!missionToDelete) return;
    try {
      await deleteMission.mutateAsync(missionToDelete, statusFilter, sortOrder);
      // Only close dialog after mutation succeeds
      setMissionToDelete(null);
    } catch (error) {
      // Dialog stays open if deletion fails
      console.error('Failed to delete mission:', error);
    }
  };

  const handleMarkDone = (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;
    setMissionToUpdate(missionId);
    updateMission.mutate({
      id: missionId,
      completed: !mission.completed,
      currentStatus: statusFilter,
      currentSort: sortOrder,
    });
  };

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Clear missionToUpdate when mutation finishes (success or error)
  useEffect(() => {
    if (!updateMission.isPending && missionToUpdate) {
      const timer = setTimeout(() => setMissionToUpdate(null), 0);
      return () => clearTimeout(timer);
    }
  }, [updateMission.isPending]);

  const missions = useMemo(() => {
    return (
      (missionsData?.pages as Array<{ data?: MissionItem[] }> | undefined)?.flatMap(
        (page) => (page.data || []).filter(Boolean),
      ) || []
    );
  }, [missionsData]);
  const completedCount = stats?.completed || 0;
  const totalCount = stats?.total || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (authLoading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="h-64 bg-white/5 rounded-2xl" />
        <div className="h-96 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return <LoginRequired />;
  }

  return (
    <div className="space-y-12 pb-24">
      <AlertDialog
        open={!!missionToDelete}
        onOpenChange={(open) => !open && setMissionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the spot from your missions list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMission.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={deleteMission.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteMission.isPending ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : null}
              Remove Mission
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 1. Progress Header */}
      <header className="relative bg-gray-900 rounded-[40px] p-8 md:p-12 overflow-hidden shadow-2xl shadow-gray-900/20">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy size={160} className="text-amber-400 rotate-12" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-black px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                Active Missions
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white tracking-tight">
              {selectedCity?.name || "Bangkok"}{" "}
              <span className="text-amber-400">Scout</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
              Complete missions and enjoy your stay
            </p>
          </div>

          <div className="w-full md:w-64 space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Current Progress
              </span>
              <span className="text-2xl font-black text-white italic">
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-amber-400 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(251,191,36,0.4)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 2. Missions List */}
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
          <div className="flex items-center gap-3">
            <Target size={20} className="text-amber-400" />
            <h3 className="font-display text-2xl font-bold text-foreground tracking-tight">
              Current Missions
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Status Tabs */}
            <div className="flex bg-white/8 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setStatusFilter("pending")}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  statusFilter === "pending"
                    ? "bg-amber-400 text-black shadow-sm"
                    : "text-white/50",
                )}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter("completed")}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  statusFilter === "completed"
                    ? "bg-emerald-400 text-black shadow-sm"
                    : "text-white/50",
                )}
              >
                Completed
              </button>
              <button
                onClick={() => setStatusFilter("all")}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  statusFilter === "all"
                    ? "bg-white/15 text-foreground shadow-sm"
                    : "text-white/50",
                )}
              >
                All
              </button>
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() =>
                setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
              }
              className="flex items-center gap-2 px-4 py-2.5 bg-white/8 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:bg-white/12 transition-all"
            >
              {sortOrder === "newest" ? (
                <SortDesc size={14} />
              ) : (
                <SortAsc size={14} />
              )}
              {sortOrder}
            </button>
          </div>
        </header>

        {missionsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : missions.length === 0 ? (
          <div className="py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/8 flex items-center justify-center text-white/20">
                <Zap size={24} />
              </div>
              <div className="space-y-1">
                <p className="font-display text-sm font-bold text-foreground">
                  No missions accepted
                </p>
                <p className="text-[10px] font-medium text-white/50 uppercase tracking-widest">
                  Find a spot on the map and add it to your missions
                </p>
              </div>
              <Link
                href="/spots"
                className="mt-4 bg-amber-400 text-black px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-300 transition-all active:scale-95 flex items-center gap-2"
              >
                Explore {selectedCity?.name || "City"} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {missions.filter(m => m && m.id).map((mission: MissionItem) => (
              <div
                key={mission.id}
                className={cn(
                  "group relative bg-card p-6 md:p-8 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden",
                  mission.completed
                    ? "border-emerald-500/20 bg-emerald-400/5"
                    : "border-white/8 shadow-xl shadow-black/20 hover:border-amber-400/30",
                )}
              >
                <div className="flex items-center gap-6">
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-white/5">
                    {mission.spot?.imageVariants && Object.values(mission.spot.imageVariants).some(v => v) ? (
                      <img
                        src={mission.spot.imageVariants.display || mission.spot.imageVariants.thumbnail || ''}
                        alt={mission.spot?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-1">
                        <ImageIcon size={24} strokeWidth={1.5} />
                        <span className="text-[8px] font-black uppercase tracking-widest">
                          No Photo
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4
                      className={cn(
                        "font-display text-xl md:text-2xl font-bold tracking-tight leading-none",
                        mission.completed
                          ? "text-emerald-400/50 line-through"
                          : "text-foreground",
                      )}
                    >
                      {mission.spot?.name}
                    </h4>
                    <p className="text-[10px] font-medium text-white/50 uppercase tracking-widest flex items-center gap-1">
                      <MapPin size={10} /> {mission.spot?.name} Area
                    </p>
                    <div className="pt-2 flex gap-2">
                      <Link
                        href={getSpotUrl(
                          mission.spot?.city?.slug || "bangkok",
                          mission.spot?.slug || "",
                        )}
                        className="text-[12px] font-bold text-amber-400 uppercase tracking-widest hover:underline flex items-center gap-1"
                      >
                        View Spot <ArrowRight size={10} />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleMarkDone(mission.id)}
                    disabled={
                      updateMission.isPending && missionToUpdate === mission.id
                    }
                    className={cn(
                      "flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg",
                      mission.completed
                        ? "bg-emerald-400 text-black shadow-emerald-400/20"
                        : "bg-white/8 text-white/40 hover:bg-white/15 hover:text-white border border-white/8",
                    )}
                  >
                    {updateMission.isPending &&
                    missionToUpdate === mission.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : mission.completed ? (
                      <>
                        <CheckCircle2 size={16} strokeWidth={3} />
                        Completed
                      </>
                    ) : (
                      <>
                        <Circle size={16} strokeWidth={3} />
                        Mark Done
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setMissionToDelete(mission.id)}
                    disabled={
                      deleteMission.isPending && missionToDelete === mission.id
                    }
                    className="p-4 rounded-2xl bg-red-400/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-400/20"
                  >
                    {deleteMission.isPending &&
                    missionToDelete === mission.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </div>
            ))}

            {/* Infinite Scroll Target */}
            <div ref={observerTarget} className="py-12 flex justify-center">
              {isFetchingNextPage ? (
                <Loader2 size={24} className="text-amber-400 animate-spin" />
              ) : hasNextPage ? (
                <div className="h-4 w-4" />
              ) : missions.length > 0 ? (
                <p className="text-[12px] font-medium text-white/50 uppercase tracking-widest">
                  End of missions
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MissionsPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse h-screen bg-white/5 rounded-2xl m-4" />
      }
    >
      <MissionsPageContent />
    </Suspense>
  );
}
