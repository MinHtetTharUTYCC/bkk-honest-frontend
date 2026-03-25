'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import TipForm from './tip-form';
import { TipFormValues } from '@/lib/validations/tip';


interface EditTipModalProps {
  tip: unknown;
  onSave: (values: TipFormValues) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export default function EditTipModal({
  tip,
  onSave,
  onClose,
  isLoading = false }: EditTipModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-xl transition-opacity"
        onClick={onClose}
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
                Edit 
              </h3>
              <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                Update your insight
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

        <div className="p-8">
            <TipForm
                initialData={{
                    type: tip.type,
                    title: tip.title,
                    description: tip.description }}
                onSubmit={onSave}
                isLoading={isLoading}
                submitLabel="Save Changes"
            />
        </div>
      </div>
    </div>
  );
}
