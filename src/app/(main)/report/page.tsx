'use client';

import { useState } from 'react';
import { useSpots, useCategories, useCreatePriceReport, useCreateScamAlert, useCreateLiveVibe } from '@/hooks/use-api';
import { Zap, AlertCircle, DollarSign, Send, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useCity } from '@/components/providers/city-provider';

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState<'price' | 'scam' | 'vibe'>('price');
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const { selectedCityId, selectedCity } = useCity();

  // Data for Selects
  const { data: spots } = useSpots({ cityId: selectedCityId });
  const { data: categories } = useCategories();

  // Mutations
  const createPrice = useCreatePriceReport();
  const createScam = useCreateScamAlert();
  const createVibe = useCreateLiveVibe();

  const handlePriceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createPrice.mutateAsync({
      spotId: formData.get('spotId') as string,
      itemName: formData.get('itemName') as string,
      priceThb: Number(formData.get('priceThb')),
    });
    setSubmitted(true);
  };

  const handleScamSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCityId) return alert('Please select a city first');
    
    const formData = new FormData(e.currentTarget);
    await createScam.mutateAsync({
      scamName: formData.get('scamName') as string,
      description: formData.get('description') as string,
      preventionTip: formData.get('preventionTip') as string,
      cityId: selectedCityId,
      categoryId: formData.get('categoryId') as string,
    });
    setSubmitted(true);
  };

  const handleVibeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createVibe.mutateAsync({
      spotId: formData.get('spotId') as string,
      crowdLevel: Number(formData.get('crowdLevel')),
      waitTimeMinutes: Number(formData.get('waitTimeMinutes')),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-400/20 animate-bounce">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Report Published!</h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Your contribution has been added to the pulse.</p>
        </div>
        <button 
          onClick={() => router.push('/')}
          className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors"
        >
          Back to Pulse
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-24">
      <header className="flex flex-col gap-1">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Contribute</h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Keep {selectedCity?.name || 'Bangkok'} honest by sharing live reports</p>
      </header>

      {/* Tabs */}
      <div className="bg-gray-100 p-1.5 rounded-3xl flex gap-1 shadow-inner">
        {(['price', 'scam', 'vibe'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === tab 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            {tab === 'price' && <div className="flex items-center justify-center gap-2"><DollarSign size={14} /> Price</div>}
            {tab === 'scam' && <div className="flex items-center justify-center gap-2"><AlertCircle size={14} /> Scam</div>}
            {tab === 'vibe' && <div className="flex items-center justify-center gap-2"><Zap size={14} /> Vibe</div>}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-2xl shadow-gray-200/40">
        {activeTab === 'price' && (
          <form onSubmit={handlePriceSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Location</label>
              <select name="spotId" required className="w-full bg-gray-50 border-2 border-transparent focus:border-cyan-400 focus:bg-white transition-all rounded-2xl px-5 py-4 text-sm font-bold outline-none appearance-none cursor-pointer">
                <option value="">Select a spot...</option>
                {spots?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Item Name</label>
                <input name="itemName" required placeholder="e.g. Pad Thai" className="w-full bg-gray-50 border-2 border-transparent focus:border-cyan-400 focus:bg-white transition-all rounded-2xl px-5 py-4 text-sm font-bold outline-none" />
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Price (THB)</label>
                <input name="priceThb" type="number" required placeholder="0.00" className="w-full bg-gray-50 border-2 border-transparent focus:border-cyan-400 focus:bg-white transition-all rounded-2xl px-5 py-4 text-sm font-bold outline-none" />
              </div>
            </div>

            <button disabled={createPrice.isPending} className="w-full bg-gray-900 text-white py-5 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-900/10 active:scale-[0.98] disabled:opacity-50">
              <Send size={16} />
              {createPrice.isPending ? 'Publishing...' : 'Publish Price Report'}
            </button>
          </form>
        )}

        {activeTab === 'scam' && (
          <form onSubmit={handleScamSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Scam Name</label>
              <input name="scamName" required placeholder="e.g. Broken Meter Taxi" className="w-full bg-gray-50 border-2 border-transparent focus:border-cyan-400 focus:bg-white transition-all rounded-2xl px-5 py-4 text-sm font-bold outline-none" />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
              <select name="categoryId" required className="w-full bg-gray-50 border-2 border-transparent focus:border-cyan-400 focus:bg-white transition-all rounded-2xl px-5 py-4 text-sm font-bold outline-none appearance-none cursor-pointer">
                <option value="">Select category...</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description</label>
              <textarea name="description" required rows={4} placeholder="What happened? Be specific." className="w-full bg-gray-50 border-2 border-transparent focus:border-cyan-400 focus:bg-white transition-all rounded-2xl px-5 py-4 text-sm font-bold outline-none resize-none" />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Prevention Tip</label>
              <input name="preventionTip" required placeholder="How can others avoid this?" className="w-full bg-gray-50 border-2 border-transparent focus:border-cyan-400 focus:bg-white transition-all rounded-2xl px-5 py-4 text-sm font-bold outline-none" />
            </div>

            <button disabled={createScam.isPending} className="w-full bg-red-500 text-white py-5 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-400/20 active:scale-[0.98] disabled:opacity-50">
              <AlertCircle size={16} />
              {createScam.isPending ? 'Publishing...' : 'Publish Scam Alert'}
            </button>
          </form>
        )}

        {activeTab === 'vibe' && (
          <form onSubmit={handleVibeSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Location</label>
              <select name="spotId" required className="w-full bg-gray-50 border-2 border-transparent focus:border-cyan-400 focus:bg-white transition-all rounded-2xl px-5 py-4 text-sm font-bold outline-none appearance-none cursor-pointer">
                <option value="">Select a spot...</option>
                {spots?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-6">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 text-center">Crowd Level (1-5)</label>
              <div className="flex justify-between gap-4">
                {[1, 2, 3, 4, 5].map((level) => (
                  <label key={level} className="flex-1">
                    <input type="radio" name="crowdLevel" value={level} required className="peer hidden" />
                    <div className="w-full py-4 text-center rounded-2xl bg-gray-50 text-gray-400 font-black cursor-pointer transition-all peer-checked:bg-cyan-400 peer-checked:text-white peer-checked:shadow-lg peer-checked:shadow-cyan-400/20">
                      {level}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Estimated Wait Time (Minutes)</label>
              <input name="waitTimeMinutes" type="number" defaultValue={0} className="w-full bg-gray-50 border-2 border-transparent focus:border-cyan-400 focus:bg-white transition-all rounded-2xl px-5 py-4 text-sm font-bold outline-none" />
            </div>

            <button disabled={createVibe.isPending} className="w-full bg-cyan-400 text-white py-5 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-cyan-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-cyan-400/20 active:scale-[0.98] disabled:opacity-50">
              <Zap size={16} fill="currentColor" />
              {createVibe.isPending ? 'Publishing...' : 'Share Live Vibe'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
