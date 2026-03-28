"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useInfiniteUserCommunityTips } from "@/hooks/use-api";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import { TipCard } from "@/components/tips/tip-card";
import { SpotTip } from "@/types/spot";
import { useVoteToggle } from "@/hooks/use-vote-toggle";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

interface UserTipsInfiniteTabProps {
  userId: string;
}

export default function UserTipsInfiniteTab({ userId }: UserTipsInfiniteTabProps) {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedTip, setSelectedTip] = useState<SpotTip | null>(null);

  const {
    data: tipsData,
    fetchNextPage: fetchNextTips,
    hasNextPage: hasNextTips,
    isFetchingNextPage: isFetchingNextTips,
    isLoading: tipsLoading,
  } = useInfiniteUserCommunityTips(userId);

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Community Tips</h2>
      </div>

      {tipsLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 size={24} className="text-amber-400 animate-spin" />
        </div>
      ) : tips.length === 0 ? (
        <div className="py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/20 text-xs font-medium text-white/40">
          No tips shared yet
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
  );
}
