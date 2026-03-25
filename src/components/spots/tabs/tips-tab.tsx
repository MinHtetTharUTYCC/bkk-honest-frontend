"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useInfiniteSpotTips, useUpdateCommunityTip, useDeleteCommunityTip } from "@/hooks/use-api";
import { useVoteToggle } from "@/hooks/use-vote-toggle";
import { Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpotTip, SpotData } from "@/types/spot";
import { TipCard } from "@/components/tips/tip-card";
import CreateTipModal from "@/components/tips/create-tip-modal";
import EditTipModal from "@/components/tips/edit-tip-modal";
import TipCommentsModal from "@/components/tips/tip-comments-modal";
import { useInView } from "react-intersection-observer";
import { TipFormValues } from "@/lib/validations/tip";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";

interface TipsTabProps {
  spot: SpotData;
  initialTips?: any;
}

export default function TipsTab({ spot, initialTips }: TipsTabProps) {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const spotId = spot.id;

  const [showTipModal, setShowTipModal] = useState(false);
  const [selectedTip, setSelectedTip] = useState<SpotTip | null>(null);
  const [editingTip, setEditingTip] = useState<SpotTip | null>(null);

  const [tipType, setTipType] = useState<"TRY" | "AVOID">("TRY");
  const [tipSort, setTipSort] = useState<"popular" | "newest">("popular");

  const {
    data: tipsData,
    fetchNextPage: fetchNextTips,
    hasNextPage: hasNextTips,
    isFetchingNextPage: isFetchingNextTips,
    isLoading: tipsLoading,
  } = useInfiniteSpotTips(spotId, tipType, tipSort);

  const tips: SpotTip[] = useMemo(() => {
    // We can merge initialTips with react-query data, but for simplicity we rely on React Query hydration.
    const rawTips = tipsData?.pages.flatMap((page) => (page as { data?: SpotTip[] })?.data || []) || [];
    return rawTips;
  }, [tipsData]);

  const { ref: observerTarget, inView } = useInView({ threshold: 0.1, rootMargin: "200px" });
  const hasFetchedTipsRef = useRef(false);

  useEffect(() => {
    if (inView && hasNextTips && !isFetchingNextTips && !hasFetchedTipsRef.current) {
      hasFetchedTipsRef.current = true;
      fetchNextTips();
    }
  }, [inView, hasNextTips, isFetchingNextTips, fetchNextTips]);

  useEffect(() => {
    if (!inView) hasFetchedTipsRef.current = false;
  }, [inView]);

  const updateTipMutation = useUpdateCommunityTip();
  const deleteTipMutation = useDeleteCommunityTip();
  const { toggleVote: toggleTipVote } = useVoteToggle("tip", spotId);

  const handleEditTip = (tip: SpotTip) => setEditingTip(tip);

  const handleSaveEditedTip = async (values: TipFormValues) => {
    if (!editingTip) return;
    try {
      await updateTipMutation.mutateAsync({ id: editingTip.id, spotId, ...values });
      setEditingTip(null);
      toast.success("Tip updated");
    } catch (error) {
      toast.error("Failed to update tip");
    }
  };

  const handleDeleteTip = async (tipId: string) => {
    try {
      await deleteTipMutation.mutateAsync({ id: tipId, spotId });
      toast.success("Tip deleted");
    } catch (error) {
      toast.error("Failed to delete tip");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {showTipModal && <CreateTipModal spotId={spotId} onClose={() => setShowTipModal(false)} />}
      {editingTip && (
        <EditTipModal
          tip={editingTip}
          onSave={handleSaveEditedTip}
          onClose={() => setEditingTip(null)}
          isLoading={updateTipMutation.isPending}
        />
      )}
      {selectedTip && (
        <TipCommentsModal
          tip={{
            ...selectedTip,
            spotId: spotId,
            content: selectedTip.description,
            type: selectedTip.type as "TRY" | "AVOID",
            voteId: selectedTip.voteId ?? undefined,
            user: selectedTip.user ? {
              ...selectedTip.user,
              avatarUrl: selectedTip.user.avatarUrl ?? undefined,
            } : undefined,
          }}
          onClose={() => setSelectedTip(null)}
        />
      )}

      <header className="flex flex-col gap-6 px-2">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-2xl font-display font-bold text-white">Tips</h3>
          <button
            onClick={() => {
              if (!authUser) {
                router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
                return;
              }
              setShowTipModal(true);
            }}
            className="group bg-amber-500 text-black hover:text-white px-6 py-3 rounded-xl text-[10px] font-semibold tracking-wide hover:bg-amber-400 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Zap size={14} fill="currentColor" className="text-black group-hover:text-white transition-colors" />
            <span className="hidden sm:inline">Share a New Tip</span>
            <span className="sm:hidden">New Tip</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setTipType("TRY")}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all border",
                tipType === "TRY"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-white/5 text-white/50 border-border hover:bg-white/10"
              )}
            >
              To Try
            </button>
            <button
              onClick={() => setTipType("AVOID")}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all border",
                tipType === "AVOID"
                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                  : "bg-white/5 text-white/50 border-border hover:bg-white/10"
              )}
            >
              To Avoid
            </button>
          </div>
        </div>
      </header>

      <div className="space-y-4">
        <div className="flex justify-end px-2">
          <div className="flex bg-white/5 p-1 rounded-xl w-fit border border-border">
            <button
              onClick={() => setTipSort("popular")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                tipSort === "popular" ? "bg-white/10 text-amber-400" : "text-white/50 hover:text-white/70"
              )}
            >
              Popular
            </button>
            <button
              onClick={() => setTipSort("newest")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                tipSort === "newest" ? "bg-white/10 text-amber-400" : "text-white/50 hover:text-white/70"
              )}
            >
              Newest
            </button>
          </div>
        </div>

        {tipsLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 size={24} className="text-amber-400 animate-spin" />
          </div>
        ) : tips.length === 0 ? (
          <div className="py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/20 text-xs font-medium text-white/40">
            Be the first to share a {tipType.toLowerCase()} tip
          </div>
        ) : (
          <div className="space-y-2.5 pb-8">
            {tips.map((tip) => (
              <TipCard
                key={tip.id}
                tip={tip}
                authUser={authUser}
                onCommentClick={() => setSelectedTip(tip)}
                onVoteClick={async () => {
                  if (!authUser) {
                    toast.error("Join us to like tips!", { description: "Login to help the community." });
                    return;
                  }
                  return toggleTipVote({
                    id: tip.id,
                    hasVoted: tip.hasVoted,
                    voteId: tip.voteId,
                    _count: { votes: tip._count?.votes ?? 0 },
                  });
                }}
                onEditClick={() => handleEditTip(tip)}
                onDeleteClick={() => handleDeleteTip(tip.id)}
              />
            ))}

            <div ref={observerTarget} className="py-6 flex justify-center">
              {isFetchingNextTips ? (
                <Loader2 size={20} className="text-amber-400 animate-spin" />
              ) : hasNextTips ? (
                <div className="h-4 w-4" />
              ) : (
                <p className="text-[10px] font-semibold text-white/40 tracking-wide">End of tips</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}