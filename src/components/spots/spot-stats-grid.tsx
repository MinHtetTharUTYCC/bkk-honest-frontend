import { SpotData } from "@/types/spot";

export default function SpotStatsGrid({ spot }: { spot: SpotData }) {
  const { activityStats, priceStats, vibeStats } = spot;

  const lastPulseDate = activityStats?.lastActivity ? new Date(activityStats.lastActivity).getTime() : null;
  const timeAgo = (timestamp: number | null) => {
    if (!timestamp) return "No Data";
    // eslint-disable-next-line react-hooks/purity
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 my-8">
      <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-xl shadow-black/20">
        <span className="text-[8px] md:text-[10px] font-medium text-white/50 uppercase tracking-widest block mb-2 md:mb-4">
          Last Pulse
        </span>
        <div className="text-2xl md:text-4xl font-display font-bold text-white">
          {lastPulseDate ? timeAgo(lastPulseDate) : "New Spot"}
        </div>
        <div className="mt-1 md:mt-2 text-[8px] md:text-[10px] font-medium text-white/50 uppercase tracking-widest">
          Latest Community Entry
        </div>
      </div>
      <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-xl shadow-black/20">
        <span className="text-[8px] md:text-[10px] font-medium text-white/50 uppercase tracking-widest block mb-2 md:mb-4">
          Fair Range
        </span>
        <div className="text-lg md:text-xl font-display font-bold text-white flex items-center gap-1 md:gap-2">
          <span className="text-emerald-500 italic">{priceStats?.min || "--"}</span>
          <span className="text-white/20">-</span>
          <span className="text-red-500 italic">{priceStats?.max || "--"}</span>
        </div>
        <div className="mt-1 md:mt-2 text-[8px] md:text-[10px] font-medium text-white/50 uppercase tracking-widest italic">
          THB Range
        </div>
      </div>
      <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-xl shadow-black/20">
        <span className="text-[8px] md:text-[10px] font-medium text-white/50 uppercase tracking-widest block mb-2 md:mb-4">
          Live Vibe
        </span>
        <div className="text-lg md:text-xl font-display font-bold text-white">
          {vibeStats?.avgCrowdLevel ? `${vibeStats.avgCrowdLevel.toFixed(1)} / 5` : "No Data"}
        </div>
        <div className="mt-1 md:mt-2 text-[8px] md:text-[10px] font-medium text-white/50 uppercase tracking-widest">
          Crowd Rating
        </div>
      </div>
      <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-xl shadow-black/20">
        <span className="text-[8px] md:text-[10px] font-medium text-white/50 uppercase tracking-widest block mb-2 md:mb-4">
          Verified by
        </span>
        <div className="text-2xl md:text-4xl font-display font-bold text-white">
          {activityStats?.totalContributors ?? 0}
        </div>
        <div className="mt-1 md:mt-2 text-[8px] md:text-[10px] font-medium text-white/50 uppercase tracking-widest">
          Unique Locals
        </div>
      </div>
    </div>
  );
}