'use client';

import { Zap, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LoginRequired() {
  const pathname = usePathname();
  
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-amber-400/10 blur-2xl group-hover:bg-amber-400/20 transition-all" />
        <Lock size={32} className="text-white/20 relative group-hover:text-amber-400 transition-colors" />
      </div>

      <div className="space-y-2 max-w-sm">
        <h2 className="text-2xl font-display font-bold text-white tracking-tight uppercase italic">
          Members Only
        </h2>
        <p className="text-sm font-medium text-white/40 leading-relaxed">
          This part of the pulse is reserved for our community. Log in to access your profile and missions.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href={`/login?redirectTo=${encodeURIComponent(pathname)}`}
          className="w-full bg-amber-400 text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-300 transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-400/10 active:scale-[0.98]"
        >
          Sign In to Honest
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/"
          className="w-full bg-white/5 text-white/40 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center"
        >
          Back to Pulse
        </Link>
      </div>
    </div>
  );
}
