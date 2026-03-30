'use client';

import { Zap, X } from 'lucide-react';
import CreateVibeForm from './create-vibe-form';

interface CreateVibeModalProps {
    spotId: string;
    onClose: () => void;
}

export default function CreateVibeModal({ spotId, onClose }: CreateVibeModalProps) {
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6">
            <div
                className="absolute inset-0 bg-black/75 backdrop-blur-xl transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-xl bg-card rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-full">
                <header className="p-6 border-b border-white/8 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center text-black shadow-xl shadow-amber-400/20">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <div>
                            <h3 className="font-display text-xl font-bold text-foreground tracking-tight">
                                Check-in Vibe
                            </h3>
                            <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                                Share the live pulse
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-white/40 hover:text-foreground transition-colors"
                    >
                        <X size={20} strokeWidth={3} />
                    </button>
                </header>

                <div className="p-6 overflow-y-auto">
                    <CreateVibeForm spotId={spotId} onSuccess={onClose} />
                </div>
            </div>
        </div>
    );
}
