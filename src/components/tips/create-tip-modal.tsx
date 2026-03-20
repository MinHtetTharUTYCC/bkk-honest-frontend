'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateCommunityTip } from '@/hooks/use-api';
import { X, Zap, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { tipSchema, TipFormValues } from '@/lib/validations/tip';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CreateTipModalProps {
  spotId: string;
  onClose: () => void;
}

export default function CreateTipModal({ spotId, onClose }: CreateTipModalProps) {
  const createMutation = useCreateCommunityTip();

  const form = useForm<TipFormValues>({
    resolver: zodResolver(tipSchema),
    defaultValues: {
      type: 'TRY',
      title: '',
      description: '',
    },
  });

  const { control, handleSubmit, setValue, watch } = form;
  const currentType = watch('type');

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

        <Form {...form}>
          <form onSubmit={handleSubmit(onFormSubmit)} className="p-8 space-y-8">
            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Tip Type
                  </FormLabel>
                  <FormControl>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => field.onChange('TRY')}
                        className={cn(
                          'flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2',
                          field.value === 'TRY'
                            ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20 shadow-sm'
                            : 'bg-white/5 text-white/40 border-white/10',
                        )}
                      >
                        <CheckCircle2 size={14} />
                        To Try
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange('AVOID')}
                        className={cn(
                          'flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2',
                          field.value === 'AVOID'
                            ? 'bg-red-400/10 text-red-400 border-red-400/20 shadow-sm'
                            : 'bg-white/5 text-white/40 border-white/10',
                        )}
                      >
                        <AlertTriangle size={14} />
                        To Avoid
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
                    The Headline
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g. Best time for photos, Hidden menu item..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
                    Details
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="What should locals and tourists know?"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
        </Form>
      </div>
    </div>
  );
}
