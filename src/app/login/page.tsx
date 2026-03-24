'use client';
import { Suspense } from 'react';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import logoImg from '../../../public/logo-bh-linked-1-trans.png';
import { Loader2, ShieldAlert } from 'lucide-react';

function LoginPageContent() {
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-8">
            {/* Animated background gradients */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(251,191,36,0.2),transparent_50%),radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(59,130,246,0.15),transparent_50%)]"
            />

            {/* Animated flowing background elements */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl opacity-0 animate-pulse"
                style={{ animationDuration: '8s' }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl opacity-0 animate-pulse"
                style={{ animationDuration: '10s', animationDelay: '2s' }}
            />

            {/* Subtle grid overlay */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,1)_1px,transparent_1px)] bg-size-[50px_50px]"
            />

            {/* Content */}
            <section className="relative w-full max-w-sm space-y-8 text-center">
                {/* Logo & Branding */}
                <div className="space-y-6">
                    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] bg-linear-to-br from-amber-500/15 to-amber-700/15 shadow-2xl shadow-amber-500/30 backdrop-blur-2xl border border-amber-300/40 p-4 hover:shadow-amber-500/40 transition-all duration-300">
                        <Image
                            src={logoImg}
                            alt="BKK Honest Logo"
                            width={80}
                            height={80}
                            className="w-full h-full object-contain drop-shadow-lg"
                        />
                    </div>
                    <div className="space-y-3">
                        <h1 className="font-display text-5xl font-bold uppercase tracking-tight text-white sm:text-6xl">
                            BKK Honest
                        </h1>
                        <p className="text-sm font-semibold uppercase tracking-widest text-white/50">
                            Keep Thailand Real
                        </p>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                    <p className="text-lg font-medium leading-relaxed text-white/60">
                        Share spots, prices, report scams, and real vibes.
                    </p>
                    <p className="text-sm text-white/50">
                        Join thousands protecting the Thailand community with honest intelligence.
                    </p>
                </div>

                {/* Error State */}
                {error && (
                    <div
                        role="alert"
                        aria-live="polite"
                        className="animate-in slide-in-from-top-4 rounded-2xl border border-red-400/40 bg-red-500/15 p-4 text-sm font-semibold text-red-300 backdrop-blur-sm"
                    >
                        <div className="flex items-start gap-3">
                            <ShieldAlert size={18} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* Auth Section */}
                <div className="space-y-5">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        aria-busy={googleLoading}
                        className="group relative w-full overflow-hidden rounded-2xl bg-white px-6 py-4 text-xs font-black uppercase tracking-widest text-black shadow-2xl shadow-white/10 transition-all hover:shadow-3xl hover:shadow-white/20 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                    >
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="relative flex items-center justify-center gap-3">
                            {googleLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 48 48"
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fill="#FFC107"
                                            d="M43.611 20.083H42V20H24v8h11.303C33.656 32.657 29.221 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.154 7.959 3.041l5.657-5.657C34.046 6.053 29.274 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                                        />
                                        <path
                                            fill="#FF3D00"
                                            d="M6.306 14.691l6.571 4.819C14.655 16.108 19.009 12 24 12c3.059 0 5.842 1.154 7.959 3.041l5.657-5.657C34.046 6.053 29.274 4 24 4c-7.682 0-14.344 4.337-17.694 10.691z"
                                        />
                                        <path
                                            fill="#4CAF50"
                                            d="M24 44c5.177 0 9.862-1.977 13.417-5.192l-6.193-5.238C29.182 35.092 26.715 36 24 36c-5.2 0-9.623-3.318-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                                        />
                                        <path
                                            fill="#1976D2"
                                            d="M43.611 20.083H42V20H24v8h11.303a12.035 12.035 0 0 1-4.079 5.571h.003l6.193 5.238C36.979 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                                        />
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </div>
                    </button>

                    {/* Legal text - brighter */}
                    <p className="text-xs leading-relaxed text-white/50">
                        By continuing, you agree to our{' '}
                        <Link
                            href="/terms"
                            className="text-amber-300 underline underline-offset-2 transition-colors hover:text-amber-200"
                        >
                            Terms
                        </Link>{' '}
                        and{' '}
                        <Link
                            href="/privacy"
                            className="text-amber-300 underline underline-offset-2 transition-colors hover:text-amber-200"
                        >
                            Privacy
                        </Link>
                        .
                    </p>
                </div>

                {/* Footer tagline */}
                <footer className="border-t border-white/10 pt-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                        Real pulse. Real people. Real honesty.
                    </p>
                </footer>
            </section>
        </main>
    );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-screen bg-white/5 rounded-2xl m-4" />}>
      <LoginPageContent  />
    </Suspense>
  );
}
