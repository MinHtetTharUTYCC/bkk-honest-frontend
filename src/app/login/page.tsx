'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, ArrowRight, Loader2, Mail, Lock, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const redirectTo = searchParams.get('redirectTo') || '/';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push(redirectTo);
            router.refresh();
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
                        Welcome Back
                    </h1>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
                        Join the Honest Community
                    </p>
                </header>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <ShieldAlert size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6 relative">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
                            Email Address
                        </label>
                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-amber-400 transition-colors" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 focus:bg-white/10 transition-all rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white outline-none placeholder:text-white/10"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
                            Password
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-amber-400 transition-colors" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 focus:bg-white/10 transition-all rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white outline-none placeholder:text-white/10"
                                required
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-amber-400 text-black py-5 rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-amber-300 transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-400/10 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>
                                Sign In
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <footer className="text-center space-y-4 pt-4 border-t border-white/5 relative">
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                        Don't have an account? <Link href="/signup" className="text-amber-400 hover:text-amber-300 transition-colors">Join us</Link>
                    </p>
                </footer>
            </div>
        </div>
    );
}
