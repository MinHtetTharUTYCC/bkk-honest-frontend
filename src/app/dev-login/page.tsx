'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Zap, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function DevLoginPage() {
    const [email, setEmail] = useState('seed@honest.bkk'); // Default seed email
    const [password, setPassword] = useState('12345678'); // Default seed password
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleDevLogin = async (e: React.FormEvent) => {
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
            // Successful login
            router.push('/profile');
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-[40px] p-12 border border-gray-300 shadow-2xl shadow-gray-200/40 space-y-8">
                <header className="text-center space-y-2">
                    <div className="w-16 h-16 bg-cyan-400 text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-cyan-400/20 mb-6">
                        <Zap size={32} fill="currentColor" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">
                        Dev Portal
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                        Authenticate as Seeded User
                    </p>
                </header>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3">
                        <ShieldCheck size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleDevLogin} className="space-y-6">
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                            Seed Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            className="w-full bg-gray-50 border-2 border-gray-500 focus:border-cyan-400 focus:bg-white transition-all rounded-2xl px-5 py-4 text-sm font-bold outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full bg-gray-50 border-2 border-gray-500 focus:border-cyan-400 focus:bg-white transition-all rounded-2xl px-5 py-4 text-sm font-bold outline-none"
                            required
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-gray-900 text-white py-5 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-900/10 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>
                                Initialize Session
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-[9px] text-gray-300 font-bold uppercase tracking-widest">
                    Only available in development environment
                </p>
            </div>
        </div>
    );
}
