'use client';

import { Zap, X } from 'lucide-react';
import { useCreateCommunityTip } from '@/hooks/use-api';
import { toast } from 'sonner';
import TipForm from './tip-form';
import { TipFormValues } from '@/lib/validations/tip';

interface CreateTipModalProps {
  spotId: string;
  onClose: () => void;
}

export default function CreateTipModal({ spotId, onClose }: CreateTipModalProps) {
  const createMutation = useCreateCommunityTip();

  const onFormSubmit = async (values: TipFormValues) => {
    try {
      await createMutation.mutateAsync({
        spotId,
        ...values,
      });
      toast.success('Tip shared with the community!');
      onClose();
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to share tip';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to share tip');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-xl transition-opacity"
        onClick={onClose}
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
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-white/40 hover:text-foreground transition-colors"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </header>

        <div className="p-8">
            <TipForm
                onSubmit={onFormSubmit}
                isLoading={createMutation.isPending}
                submitLabel="Publish Tip"
            />
        </div>
      </div>
    </div>
  );
}
