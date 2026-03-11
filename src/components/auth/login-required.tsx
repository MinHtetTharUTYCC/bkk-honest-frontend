'use client';

import { Zap, ArrowRight, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function LoginRequired() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/bkk-honest/auth/callback?redirectTo=${encodeURIComponent(pathname || '/')}`,
        },
    });
    if (error) {
        console.error(error);
        setLoading(false);
    }
  };
  
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
          This part of the pulse is reserved for our community. Log in with Google to access your profile and missions.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/5 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <>
              <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4" />
              Continue with Google
            </>
          )}
        </button>
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
