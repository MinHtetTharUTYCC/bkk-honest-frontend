"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useInfiniteLiveVibes } from "@/hooks/use-api";
import { Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LiveVibeDto, SpotWithStatsResponseDto } from "@/api/generated/model";
import CreateVibeModal from "@/components/vibes/create-vibe-modal";
import { useInView } from "react-intersection-observer";
import { useRouter, usePathname } from "next/navigation";

interface VibesTabProps {
  spot: SpotWithStatsResponseDto;
}

export default function VibesTab({ spot }: VibesTabProps) {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const spotId = spot.id;

  const [showVibeModal, setShowVibeModal] = useState(false);

  const {
    data: vibesData,
    fetchNextPage: fetchNextVibes,
    hasNextPage: hasNextVibes,
    isFetchingNextPage: isFetchingNextVibes,
    isLoading: vibesLoading,
  } = useInfiniteLiveVibes({ spotId });

  const spotVibes: LiveVibeDto[] = useMemo(() => {
    const rawVibes =
      vibesData?.pages.flatMap(
        (page) =>
          (page as unknown as { data?: LiveVibeDto[] })?.data || [],
      ) || [];

    return rawVibes;
  }, [vibesData]);

  const { ref: vibesObserverTarget, inView: inViewVibes } = useInView({
    threshold: 0.1,
    rootMargin: "200px",
  });
  const hasFetchedVibesRef = useRef(false);

  useEffect(() => {
    if (
      inViewVibes &&
      hasNextVibes &&
      !isFetchingNextVibes &&
      !hasFetchedVibesRef.current
    ) {
      hasFetchedVibesRef.current = true;
      fetchNextVibes();
    }
  }, [inViewVibes, hasNextVibes, isFetchingNextVibes, fetchNextVibes]);

  useEffect(() => {
    if (!inViewVibes) hasFetchedVibesRef.current = false;
  }, [inViewVibes]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {showVibeModal && (
        <CreateVibeModal
          spotId={spotId}
          onClose={() => setShowVibeModal(false)}
        />
      )}

      <header className="flex flex-col gap-6 px-2">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Zap size={20} className="text-amber-400" />
            Live Vibes
          </h3>
          <button
            onClick={() => {
              if (!authUser) {
                router.push(
                  `/login?redirectTo=${encodeURIComponent(pathname)}`,
                );
                return;
              }
              setShowVibeModal(true);
            }}
            className="group bg-amber-500 text-black hover:text-white px-6 py-3 rounded-xl text-[10px] font-semibold tracking-wide hover:bg-amber-400 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Zap
              size={14}
              fill="currentColor"
              className="text-black group-hover:text-white transition-colors"
            />
            <span className="hidden sm:inline">Check-in Vibe</span>
            <span className="sm:hidden">Check-in</span>
          </button>
        </div>
      </header>

      {vibesLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-white/5 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : Array.isArray(spotVibes) && spotVibes.length > 0 ? (
        <div className="space-y-3">
          {spotVibes.map((vibe) => (
            <div
              key={vibe.id}
              className="bg-white/5 rounded-2xl p-5 border border-white/8 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2 h-6 rounded-full transition-colors",
                        i < vibe.crowdLevel ? "bg-amber-400" : "bg-white/10",
                      )}
                    />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Crowd: {vibe.crowdLevel}/5
                  </p>
                  {typeof vibe.waitTimeMinutes === 'number' && vibe.waitTimeMinutes != null && (
                    <p className="text-xs text-white/50">
                      {vibe.waitTimeMinutes} min wait
                    </p>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-white/30 whitespace-nowrap">
                {new Date(vibe.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
          <Zap size={32} className="text-white/10 mx-auto mb-3" />
          <p className="text-sm font-bold text-white/40 uppercase tracking-widest">
            No vibes yet. Be the first to check in!
          </p>
        </div>
      )}

      <div ref={vibesObserverTarget} className="py-6 flex justify-center">
        {isFetchingNextVibes ? (
          <Loader2 size={20} className="text-amber-400 animate-spin" />
        ) : hasNextVibes ? (
          <div className="h-4 w-4" />
        ) : (
          <p className="text-[10px] font-semibold text-white/40 tracking-wide">
            End of vibes
          </p>
        )}
      </div>
    </div>
  );
}
