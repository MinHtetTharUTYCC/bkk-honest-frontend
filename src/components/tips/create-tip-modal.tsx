'use client';

import { useState } from 'react';
import { useCreateCommunityTip } from '@/hooks/use-api';
import { X, Zap, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CreateTipModalProps {
    spotId: string;
    onClose: () => void;
}

export default function CreateTipModal({ spotId, onClose }: CreateTipModalProps) {
    const [type, setType] = useState<'TRY' | 'AVOID'>('TRY');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const createMutation = useCreateCommunityTip();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            await createMutation.mutateAsync({
                spotId,
                type,
                title,
                description,
            });
            toast.success('Tip shared with the community!');
            onClose();
        } catch (error) {
            toast.error('Failed to share tip');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <div
                className="absolute inset-0 bg-black/75 backdrop-blur-xl transition-opacity"
                onClick={(e) => { e.stopPropagation(); onClose(); }} onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
            />

            <div className="relative w-full max-w-xl bg-card rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <header className="p-8 border-b border-white/8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center text-black shadow-xl shadow-amber-400/20">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <div>
                            <h3 className="font-display text-xl font-bold text-foreground tracking-tight">
                                Share a Tip
                            </h3>
                            <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                                Help the community pulse
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }} onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                        className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-white/40 hover:text-foreground transition-colors"
                    >
                        <X size={20} strokeWidth={3} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="space-y-4">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                            Tip Type
                        </span>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setType('TRY')}
                                className={cn(
                                    'flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2',
                                    type === 'TRY'
                                        ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20 shadow-sm'
                                        : 'bg-white/5 text-white/40 border-white/10',
                                )}
                            >
                                <CheckCircle2 size={14} />
                                To Try
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('AVOID')}
                                className={cn(
                                    'flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2',
                                    type === 'AVOID'
                                        ? 'bg-red-400/10 text-red-400 border-red-400/20 shadow-sm'
                                        : 'bg-white/5 text-white/40 border-white/10',
                                )}
                            >
                                <AlertTriangle size={14} />
                                To Avoid
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
                            The Headline
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="E.g. Best time for photos, Hidden menu item..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-foreground placeholder:text-white/30 focus:ring-2 focus:ring-amber-400/50 transition-all outline-none focus:border-amber-400"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
                            Details
                        </label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What should locals and tourists know?"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-foreground placeholder:text-white/30 focus:ring-2 focus:ring-amber-400/50 transition-all outline-none resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="w-full py-5 bg-amber-400 text-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-amber-300 transition-all shadow-2xl shadow-amber-400/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {createMutation.isPending ? (
                            <Loader2 size={16} className="animate-spin text-black" />
                        ) : (
                            <Zap size={16} fill="currentColor" className="text-black" />
                        )}
                        {createMutation.isPending ? 'Publishing...' : 'Publish Tip'}
                    </button>
                </form>
            </div>
        </div>
    );
}
