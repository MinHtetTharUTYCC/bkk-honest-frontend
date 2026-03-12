'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, ArrowRight, Loader2, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const redirectTo = searchParams.get('redirectTo') || '/';

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/bkk-honest/auth/callback/?redirectTo=${encodeURIComponent(redirectTo)}`,
            },
        });

        if (error) {
            setError(error.message);
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 selection:bg-amber-400/30">
            <div className="max-w-md w-full bg-card rounded-[40px] p-8 md:p-12 border border-white/10 shadow-2xl shadow-black/60 space-y-8 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-400/10 blur-[100px] rounded-full" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-400/5 blur-[100px] rounded-full" />

                <header className="text-center space-y-3 relative">
                    <div className="w-16 h-16 bg-amber-400 text-black rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-amber-400/20 mb-6 group transition-transform hover:scale-110 active:scale-95 cursor-pointer">
                        <Zap size={32} fill="currentColor" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white tracking-tighter uppercase italic">
                        Welcome to Honest
                    </h1>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
                        Join the Bangkok Community Talk
                    </p>
                </header>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <ShieldAlert size={18} />
                        {error}
                    </div>
                )}

                <div className="space-y-4 relative">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className="w-full bg-white text-black py-5 rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/5 active:scale-[0.98] disabled:opacity-50"
                    >
                        {googleLoading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                                Continue with Google
                            </>
                        )}
                    </button>
                    
                    <p className="text-center text-[9px] text-white/20 font-bold uppercase tracking-widest px-4 leading-relaxed">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>

                <footer className="text-center space-y-4 pt-4 border-t border-white/5 relative">
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                        The pulse of Bangkok is waiting for you.
                    </p>
                </footer>
            </div>
        </div>
    );
}
