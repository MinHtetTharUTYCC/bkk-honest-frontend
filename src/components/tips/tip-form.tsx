/* eslint-disable react-hooks/incompatible-library */
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Zap, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tipSchema, TipFormValues } from '@/lib/validations/tip';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

interface TipFormProps {
  initialData?: Partial<TipFormValues>;
  onSubmit: (values: TipFormValues) => Promise<void>;
  isLoading: boolean;
  submitLabel?: string;
}

export default function TipForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = 'Publish Tip',
}: TipFormProps) {
  const form = useForm<TipFormValues>({
    resolver: zodResolver(tipSchema),
    defaultValues: {
      type: initialData?.type || 'TRY',
      title: initialData?.title || '',
      description: initialData?.description || '',
    },
  });

  const { control, handleSubmit, watch } = form;
  const titleValue = watch('title') || '';
  const descriptionValue = watch('description') || '';

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">
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
                    <CheckCircle2 size={14} className="shrink-0" />
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
                    <AlertTriangle size={14} className="shrink-0" />
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
              <FormLabel className="text-[10px] font-bold text-white/40 uppercase tracking-widest block ml-1">
                The Headline
              </FormLabel>
              <FormControl>
                <input
                  placeholder="E.g. Best time for photos, Hidden menu item..."
                  className={cn(
                    "w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none",
                    titleValue.length > 100 && "border-red-500/50 ring-1 ring-red-500/20"
                  )}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <div className="flex justify-end pr-1">
                <span className={cn(
                  "text-xs font-bold tracking-normal transition-colors",
                  titleValue.length > 100 ? "text-red-400" : "text-white/30"
                )}>
                  {titleValue.length}/100
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel className="text-[10px] font-bold text-white/40 uppercase tracking-widest block ml-1">
                Details
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="What should locals and tourists know?"
                  className={cn(
                    "w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none resize-none",
                    descriptionValue.length > 500 && "border-red-500/50 ring-1 ring-red-500/20"
                  )}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <div className="flex justify-end pr-1">
                <span className={cn(
                  "text-xs font-bold tracking-normal transition-colors",
                  descriptionValue.length > 500 ? "text-red-400" : "text-white/30"
                )}>
                  {descriptionValue.length}/500
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <button
          type="submit"
          disabled={isLoading || titleValue.length > 100 || descriptionValue.length > 500}
          className="w-full py-5 bg-amber-400 text-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-amber-300 transition-all shadow-2xl shadow-amber-400/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin text-black shrink-0" />
          ) : (
            <Zap size={16} fill="currentColor" className="text-black shrink-0" />
          )}
          <span className="truncate">
            {isLoading 
              ? (submitLabel.toLowerCase().includes('save') ? 'Saving...' : 'Publishing...') 
              : (
                  <span className="flex items-center">
                    <span className="hidden sm:inline mr-1">
                        {submitLabel.split(' ')[0]}
                    </span>
                    <span className="sm:hidden">
                        {submitLabel.toLowerCase().includes('save') ? 'Save' : 'Publish'}
                    </span>
                    <span className="hidden sm:inline ml-0.5">
                        {submitLabel.split(' ').slice(1).join(' ')}
                    </span>
                  </span>
              )
            }
          </span>
        </button>
      </form>
    </Form>
  );
}
