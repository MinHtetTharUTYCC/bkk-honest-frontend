'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EditTipModalProps {
  tip: any;
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSave: () => Promise<void>;
  onClose: () => void;
  isSaving?: boolean;
}

export default function EditTipModal({
  tip,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onSave,
  onClose,
  isSaving = false,
}: EditTipModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await onSave();
      toast.success('Tip updated successfully!');
    } catch (error) {
      toast.error('Failed to update tip');
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
            <div
              className={cn(
                'w-10 h-10 rounded-2xl flex items-center justify-center text-black shadow-xl',
                tip.type === 'AVOID'
                  ? 'bg-red-400 shadow-red-400/20'
                  : 'bg-emerald-400 shadow-emerald-400/20'
              )}
            >
              {tip.type === 'AVOID' ? '⚠️' : '✓'}
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground tracking-tight">
                Edit Tip
              </h3>
              <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                Update your insight
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
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
              The Headline
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
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
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="What should locals and tourists know?"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-foreground placeholder:text-white/30 focus:ring-2 focus:ring-amber-400/50 transition-all outline-none resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose(); }} onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
              className="flex-1 py-3 bg-white/10 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 bg-amber-400 text-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-amber-300 transition-all shadow-2xl shadow-amber-400/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin text-black" />
              ) : (
                '✓'
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
