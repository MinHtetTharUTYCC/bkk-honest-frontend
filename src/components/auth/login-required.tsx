"use client";

import { useRouter } from "next/navigation";
import { LogIn, ArrowLeft } from "lucide-react";

export default function LoginRequired() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-32 px-6 text-center space-y-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="space-y-3 max-w-xs">
        <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight uppercase">
          Join the Pulse
        </h2>
        <p className="text-sm font-medium text-white/40 leading-relaxed">
          Join us first to view your profile and missions.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-[280px]">
        <button
          onClick={() => router.push("/login")}
          className="w-full bg-amber-400 text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-300 transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-400/10 active:scale-[0.98]"
        >
          <LogIn size={16} />
          Join Us
        </button>

        <button
          onClick={() => router.back()}
          className="w-full bg-white/5 text-white/40 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <ArrowLeft size={14} />
          Not Now
        </button>
      </div>
    </div>
  );
}
