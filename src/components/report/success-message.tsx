'use client';

import { CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SuccessMessageProps {
    onSubmitAnother?: () => void;
}

export default function SuccessMessage({ onSubmitAnother }: SuccessMessageProps) {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-400/10 text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-400/20 animate-bounce">
                <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
                <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
                    Published!
                </h2>
                <p className="text-white/40 font-medium uppercase tracking-widest text-[10px]">
                    Your contribution has been added to the pulse.
                </p>
            </div>
            <div className="flex gap-4">
                <button
                    onClick={onSubmitAnother}
                    className="bg-amber-400 text-black px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-amber-300 transition-colors"
                >
                    Submit Next One
                </button>
                <button
                    onClick={() => router.back()}
                    className="bg-white/10 text-white px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-colors border border-white/20"
                >
                    Back
                </button>
            </div>
        </div>
    );
}
