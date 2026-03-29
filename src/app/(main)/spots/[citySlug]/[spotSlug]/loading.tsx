import { Loader2 } from "lucide-react";

export default function SpotTabLoading() {
  return (
    <div className="w-full min-h-[400px] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
      <div className="relative">
        <Loader2 size={40} className="text-amber-400 animate-spin" />
        <div className="absolute inset-0 blur-xl bg-amber-400/20 animate-pulse rounded-full" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">
          Gathering Intel
        </p>
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-amber-400/40 animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1 h-1 rounded-full bg-amber-400/40 animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1 h-1 rounded-full bg-amber-400/40 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
