'use client';

import { useState } from 'react';
import { useCreatePriceReport } from '@/hooks/use-api';
import { DollarSign, Loader2, Send, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CreatePriceModalProps {
  spotId: string;
  onClose: () => void;
}

export default function CreatePriceModal({ spotId, onClose }: CreatePriceModalProps) {
  const [itemName, setItemName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createPrice = useCreatePriceReport();

  const handlePriceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (itemName.length > 100) {
      setError('Item name cannot exceed 100 characters');
      return;
    }

    try {
      const formData = new FormData(e.currentTarget);
      await createPrice.mutateAsync({
        spotId,
        itemName,
        priceThb: Number(formData.get('priceThb')),
      });
      toast.success('Price report added successfully');
      onClose();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to publish price report';
      setError(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-card rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-full">
        <header className="p-6 border-b border-white/8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center text-black shadow-xl shadow-amber-400/20">
              <DollarSign size={20} />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground tracking-tight">
                Report Price
              </h3>
              <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                Keep the city honest
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
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handlePriceSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                  Item Name
                </label>
                <input
                  name="itemName"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Pad Thai"
                  className={cn(
                    "w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none",
                    (itemName?.length || 0) > 100 && "border-red-500/50 ring-1 ring-red-500/20"
                  )}
                />
                <div className="flex justify-end">
                  <span className={cn(
                    "text-[9px] font-bold tracking-normal transition-colors",
                    (itemName?.length || 0) > 100 ? "text-red-400" : "text-white/30"
                  )}>
                    {itemName?.length || 0}/100
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                  Price (THB)
                </label>
                <input
                  name="priceThb"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none"
                />
              </div>
            </div>

            <button
              disabled={createPrice.isPending || itemName.length > 100}
              className="w-full bg-amber-400 text-black py-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-amber-300 transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-400/20 active:scale-[0.98] disabled:opacity-50"
            >
              {createPrice.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {createPrice.isPending ? 'Publishing...' : 'Publish Price Report'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}