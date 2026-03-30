"use client";

import {
  MapPin,
  Zap,
  CheckCircle2,
  Target,
  Navigation,
  ImageIcon,
  Share2,
  Edit2,
  Trash2,
  Flag,
  Loader2,
  ArrowLeft,
  MoreVertical,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SpotWithStatsResponseDto } from "@/api/generated/model";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { LikeButton } from "@/components/ui/like-button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import ReportButton from "@/components/report/report-button";
import { useAuth } from "@/components/providers/auth-provider";
import { toast } from "sonner";
import { useAddMission, useDeleteMission } from "@/hooks/use-api";
import { useVoteToggle } from "@/hooks/use-vote-toggle";
import SpotStatsGrid from "@/components/spots/spot-stats-grid";
import { TruncatedTextWithDialog } from "@/components/ui/truncated-text-with-dialog";

interface SpotHeaderProps {
  spot: SpotWithStatsResponseDto;
  onEdit: () => void;
  onDelete: () => void;
  onImageClick: () => void;
}

export default function SpotHeader({
  spot,
  onEdit,
  onDelete,
  onImageClick,
}: SpotHeaderProps) {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const addMission = useAddMission();
  const deleteMissionMutation = useDeleteMission();
  const { toggleVote: toggleSpotVote } = useVoteToggle("spot");

  const spotCategory = spot.category;
  const spotVibeStats = spot.vibeStats;
  const spotName = typeof spot.name === "string" ? spot.name : "";
  const spotAddress = typeof spot.address === "string" ? spot.address : "";
  const categoryName =
    typeof spotCategory?.name === "string" ? spotCategory.name : "Spot";
  const avgCrowdLevel =
    typeof spotVibeStats?.avgCrowdLevel === "number"
      ? spotVibeStats.avgCrowdLevel
      : undefined;
  const voteCount =
    typeof spot._count?.votes === "number" ? spot._count.votes : 0;
  const isOwner = authUser?.id === spot.userId;

  const isInMissions = Boolean(spot.isInMission);
  const isMissionActionLoading =
    addMission.isPending || deleteMissionMutation.isPending;

  const handleAcceptMission = () => {
    if (!authUser) {
      toast.error("Join us to accept missions!", {
        description: "Login to track this spot in your profile.",
      });
      return;
    }
    if (!isInMissions) {
      addMission.mutate(spot.id);
    }
  };

  const handleRemoveMission = () => {
    const targetMissionId =
      typeof spot.missionId === "string" ? spot.missionId : null;

    if (targetMissionId) {
      // Pass spotId so cache update works even when not on missions page
      deleteMissionMutation.mutate(targetMissionId, "all", "newest", spot.id);
    } else {
      toast.error("Still syncing mission data...", {
        description: "Please wait a moment and try again.",
      });
    }
  };

  const handleSpotVoteClick = async () => {
    if (!authUser) {
      toast.error("Join us to like spots!", {
        description: "Login to save your favorites.",
      });
      return;
    }
    await toggleSpotVote({
      id: spot.id,
      hasVoted: spot.hasVoted,
      voteId: spot.voteId,
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: spotName || "Spot",
      text: `Check out ${spotName || "this spot"} on BKK Honest! ⚡`,
      url,
    };
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch {
      toast.error("Failed to share");
    }
  };

  return (
    <>
      <header className="space-y-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-white/50 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={3} /> Back
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          <div
            className="relative h-100 md:h-105 md:w-105 lg:h-120 lg:w-120 shrink-0 rounded-2xl overflow-hidden group shadow-2xl shadow-black/30 cursor-pointer bg-white/5 border border-white/8"
            onClick={onImageClick}
          >
            {spot.imageVariants ? (
              <OptimizedImage
                variants={spot.imageVariants}
                alt={spot.name || "Spot"}
                size="display"
                fill
                width={spot.imageWidth}
                height={spot.imageHeight}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                blurDataURL={spot.blurPlaceholder}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-3">
                <ImageIcon size={64} strokeWidth={1} />
                <span className="text-sm font-black uppercase tracking-widest">
                  No Photo
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-gray-900/80 md:from-transparent md:via-transparent via-transparent to-transparent" />

            <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none">
              <div
                className="flex items-center gap-2 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="bg-black/40 backdrop-blur-md text-white/90 px-3 py-1.5 rounded-xl text-[12px] font-bold tracking-widest uppercase shadow-sm border border-white/10">
                  {categoryName}
                </span>
                <div className="bg-amber-400/90 backdrop-blur-md text-black px-3 py-1.5 rounded-xl flex items-center gap-1 font-bold text-[12px] tracking-widest uppercase shadow-lg shadow-amber-400/20 border border-amber-300/20">
                  <Zap size={10} fill="currentColor" className="shrink-0" />
                  {typeof avgCrowdLevel === "number"
                    ? `Busy: ${avgCrowdLevel.toFixed(1)}/5`
                    : "New Spot"}
                </div>
              </div>

              <div
                className="pointer-events-auto md:hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu
                  trigger={
                    <button className="bg-black/40 backdrop-blur-md text-white p-2.5 rounded-xl border border-white/20 shadow-xl active:scale-95 transition-transform">
                      <MoreVertical size={18} />
                    </button>
                  }
                >
                  <DropdownMenuItem
                    onClick={handleShare}
                    className="gap-3 py-3"
                  >
                    <Share2 size={16} className="text-amber-400" />
                    <span className="text-sm font-medium">Share Spot</span>
                  </DropdownMenuItem>
                  {isOwner && (
                    <>
                      <DropdownMenuItem onClick={onEdit} className="gap-3 py-3">
                        <Edit2 size={16} />
                        <span>Edit Spot</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={onDelete}
                        className="gap-3 py-3"
                        danger
                      >
                        <Trash2 size={16} />
                        <span>Delete Spot</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <ReportButton
                      targetId={spot.id}
                      reportType="SPOT"
                      className="w-full flex items-center justify-start gap-3 py-3 px-4 text-sm font-medium hover:bg-white/5 transition-colors border-none text-white/70 hover:text-white"
                    >
                      <Flag size={16} />
                      <span>Report Spot</span>
                    </ReportButton>
                  </DropdownMenuItem>
                </DropdownMenu>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-between gap-6 md:hidden">
              <div className="space-y-3">
                <TruncatedTextWithDialog
                  text={spotName}
                  textClassName="text-2xl font-display font-bold text-white tracking-tight drop-shadow-sm"
                />
                <TruncatedTextWithDialog
                  text={spotAddress}
                  title="Full Address"
                  icon={
                    <MapPin
                      size={14}
                      strokeWidth={3}
                      className="text-amber-400 mt-0.5"
                    />
                  }
                  textClassName="text-white/60 font-bold uppercase tracking-widest text-xs leading-tight"
                  className="mt-1"
                />
              </div>
              <div
                className="flex w-full items-center justify-between gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() =>
                    isInMissions ? handleRemoveMission() : handleAcceptMission()
                  }
                  disabled={isMissionActionLoading}
                  className={cn(
                    "flex-1 px-4 py-4 rounded-2xl transition-all active:scale-95 border shadow-xl flex items-center justify-center gap-2 text-[10px] font-semibold tracking-wide",
                    isInMissions
                      ? "bg-emerald-500/80 border-emerald-400 text-white"
                      : "bg-white/10 backdrop-blur-md text-white hover:bg-amber-400 border-white/20",
                  )}
                >
                  {isMissionActionLoading ? (
                    <Loader2 size={16} className="animate-spin shrink-0" />
                  ) : isInMissions ? (
                    <>
                      <CheckCircle2 size={16} className="shrink-0" />
                      <span>Accepted</span>
                    </>
                  ) : (
                    <>
                      <Target size={16} className="shrink-0" />
                      <span>Accept</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() =>
                    router.push(
                      `/navigate?lat=${spot.latitude}&lng=${spot.longitude}&name=${encodeURIComponent(spotName)}`,
                    )
                  }
                  className="flex-1 bg-white/10 backdrop-blur-md text-white px-4 py-4 rounded-2xl hover:bg-amber-400 transition-all active:scale-95 border border-white/20 shadow-xl flex items-center justify-center gap-2 text-[10px] font-semibold tracking-wide"
                  title="Navigate to this spot"
                >
                  <Navigation size={16} /> Navigate
                </button>
                <LikeButton
                  count={voteCount}
                  isVoted={spot.hasVoted}
                  onVote={handleSpotVoteClick}
                  variant="default"
                  size="lg"
                  className="text-[10px] font-semibold tracking-wide px-4 py-4 rounded-2xl backdrop-blur-md border shadow-xl bg-white/10 border-white/20 hover:bg-amber-400/20 hover:border-amber-400/30"
                  title={spot.hasVoted ? "Remove like" : "Like this spot"}
                />
              </div>
            </div>
          </div>

          {/* Desktop Content - Right Side */}
          <div className="hidden md:flex flex-col flex-1 md:h-105 lg:h-120">
            {/* Top: Title, Address & Menu */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1 min-w-0">
                <TruncatedTextWithDialog
                  text={spotName}
                  textClassName="text-3xl lg:text-4xl font-display font-bold text-white tracking-tight"
                />
                <TruncatedTextWithDialog
                  text={spotAddress}
                  title="Full Address"
                  icon={
                    <MapPin
                      size={16}
                      strokeWidth={3}
                      className="text-amber-400 mt-0.5"
                    />
                  }
                  textClassName="text-white/60 font-bold uppercase tracking-widest text-xs leading-tight"
                />
              </div>

              <DropdownMenu
                trigger={
                  <button className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white p-3 rounded-xl border border-white/10 shadow-xl transition-all shrink-0">
                    <MoreVertical size={20} />
                  </button>
                }
              >
                <DropdownMenuItem onClick={handleShare} className="gap-3 py-3">
                  <Share2 size={16} className="text-amber-400" />
                  <span className="text-sm font-medium">Share Spot</span>
                </DropdownMenuItem>
                {isOwner && (
                  <>
                    <DropdownMenuItem onClick={onEdit} className="gap-3 py-3">
                      <Edit2 size={16} />
                      <span>Edit Spot</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="gap-3 py-3"
                      danger
                    >
                      <Trash2 size={16} />
                      <span>Delete Spot</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem asChild>
                  <ReportButton
                    targetId={spot.id}
                    reportType="SPOT"
                    className="w-full flex items-center justify-start gap-3 py-3 px-4 text-sm font-medium hover:bg-white/5 transition-colors border-none text-white/70 hover:text-white"
                  >
                    <Flag size={16} />
                    <span>Report Spot</span>
                  </ReportButton>
                </DropdownMenuItem>
              </DropdownMenu>
            </div>

            {/* Stats Grid */}
            <SpotStatsGrid spot={spot} className="flex-1 my-6 gap-4" />

            {/* Bottom: Primary Actions, Divider, Secondary Actions */}
            <div className="shrink-0 space-y-2">
              {/* Primary Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    isInMissions ? handleRemoveMission() : handleAcceptMission()
                  }
                  disabled={isMissionActionLoading}
                  className={cn(
                    "flex-1 px-6 py-4 rounded-2xl transition-all active:scale-95 border shadow-xl flex items-center justify-center gap-2 text-sm font-semibold tracking-wide",
                    isInMissions
                      ? "bg-emerald-500/80 border-emerald-400 text-white"
                      : "bg-white/10 backdrop-blur-md text-white hover:bg-amber-400 border-white/20",
                  )}
                >
                  {isMissionActionLoading ? (
                    <Loader2 size={18} className="animate-spin shrink-0" />
                  ) : isInMissions ? (
                    <>
                      <CheckCircle2 size={18} className="shrink-0" />
                      <span>Mission Accepted</span>
                    </>
                  ) : (
                    <>
                      <Target size={18} className="shrink-0" />
                      <span>Accept Mission</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() =>
                    router.push(
                      `/navigate?lat=${spot.latitude}&lng=${spot.longitude}&name=${encodeURIComponent(spotName)}`,
                    )
                  }
                  className="flex-1 bg-white/10 backdrop-blur-md text-white px-6 py-4 rounded-2xl hover:bg-amber-400 transition-all active:scale-95 border border-white/20 shadow-xl flex items-center justify-center gap-2 text-sm font-semibold tracking-wide cursor-pointer"
                  title="Navigate to this spot"
                >
                  <Navigation size={18} />
                  Navigate
                </button>
                <LikeButton
                  count={voteCount}
                  isVoted={spot.hasVoted}
                  onVote={handleSpotVoteClick}
                  variant="default"
                  size="lg"
                  className="text-sm font-semibold tracking-wide px-6 py-4 rounded-2xl backdrop-blur-md border shadow-xl bg-white/10 border-white/20 hover:bg-amber-400/20 hover:border-amber-400/30 cursor-pointer"
                  title={spot.hasVoted ? "Remove like" : "Like this spot"}
                />
              </div>

              {/* Divider */}
              <div className="h-px bg-linear-to-r from-white/0 via-white/20 to-white/0" />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
