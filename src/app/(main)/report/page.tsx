'use client';

import { useState } from 'react';
import {
    useSpots,
    useCategories,
    useCreatePriceReport,
    useCreateScamAlert,
    useCreateLiveVibe,
    useCreateSpot,
    useCities,
} from '@/hooks/use-api';
import { Zap, AlertCircle, DollarSign, Send, CheckCircle2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useCity } from '@/components/providers/city-provider';

export default function ReportPage() {
    const [activeTab, setActiveTab] = useState<'price' | 'scam' | 'vibe' | 'spot'>('price');
    const [submitted, setSubmitted] = useState(false);
    const router = useRouter();
    const { selectedCityId, selectedCity } = useCity();

    // Data for Selects
    const { data: spotsResponse } = useSpots({ cityId: selectedCityId });
    const { data: categoriesResponse } = useCategories();
    const { data: citiesResponse } = useCities();

    // @ts-ignore
    const spots = spotsResponse?.data || spotsResponse || [];
    // @ts-ignore
    const categories = categoriesResponse?.data || categoriesResponse || [];
    // @ts-ignore
    const cities = citiesResponse?.data || citiesResponse || [];

    // Mutations
    const createPrice = useCreatePriceReport();
    const createScam = useCreateScamAlert();
    const createVibe = useCreateLiveVibe();
    const createSpot = useCreateSpot();

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

    const handleSpotSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await createSpot.mutateAsync({
            name: formData.get('name') as string,
            address: formData.get('address') as string,
            categoryId: formData.get('categoryId') as string,
            cityId: formData.get('cityId') as string,
            latitude: Number(formData.get('latitude')),
            longitude: Number(formData.get('longitude')),
            imageUrl: (formData.get('imageUrl') as string) || undefined,
        });
        setSubmitted(true);
    };

    if (submitted) {
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
                <button
                    onClick={() => router.push('/')}
                    className="bg-amber-400 text-black px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-amber-300 transition-colors"
                >
                    Back to Pulse
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-12 pb-24">
            <header className="flex flex-col gap-1">
                <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">
                    Contribute
                </h1>
                <p className="text-white/40 font-medium uppercase tracking-widest text-[10px]">
                    Keep {selectedCity?.name || 'the city'} honest by sharing live reports
                </p>
            </header>

            {/* Tabs */}
            <div className="bg-white/8 p-1.5 rounded-3xl flex flex-wrap md:flex-nowrap gap-1">
                {(['price', 'scam', 'vibe', 'spot'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            'flex-1 min-w-25 py-3.5 rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all',
                            activeTab === tab
                                ? 'bg-amber-400 text-black shadow-sm'
                                : 'text-white/40 hover:text-white/70',
                        )}
                    >
                        {tab === 'price' && (
                            <div className="flex items-center justify-center gap-2">
                                <DollarSign size={14} /> Price
                            </div>
                        )}
                        {tab === 'scam' && (
                            <div className="flex items-center justify-center gap-2">
                                <AlertCircle size={14} /> Scam
                            </div>
                        )}
                        {tab === 'vibe' && (
                            <div className="flex items-center justify-center gap-2">
                                <Zap size={14} /> Vibe
                            </div>
                        )}
                        {tab === 'spot' && (
                            <div className="flex items-center justify-center gap-2">
                                <MapPin size={14} /> Spot
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div className="bg-card rounded-2xl p-8 md:p-10 border border-white/8 shadow-2xl shadow-black/30">
                {activeTab === 'price' && (
                    <form onSubmit={handlePriceSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                Location
                            </label>
                            <select
                                name="spotId"
                                required
                                className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Select a spot...</option>
                                {spots?.map((s: any) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                    Item Name
                                </label>
                                <input
                                    name="itemName"
                                    required
                                    placeholder="e.g. Pad Thai"
                                    className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none"
                                />
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
                                    className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none"
                                />
                            </div>
                        </div>

                        <button
                            disabled={createPrice.isPending}
                            className="w-full bg-amber-400 text-black py-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-amber-300 transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-400/20 active:scale-[0.98] disabled:opacity-50"
                        >
                            <Send size={16} />
                            {createPrice.isPending ? 'Publishing...' : 'Publish Price Report'}
                        </button>
                    </form>
                )}

                {activeTab === 'scam' && (
                    <form onSubmit={handleScamSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                Scam Name
                            </label>
                            <input
                                name="scamName"
                                required
                                placeholder="e.g. Broken Meter Taxi"
                                className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                Category
                            </label>
                            <select
                                name="categoryId"
                                required
                                className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Select category...</option>
                                {categories?.map((c: any) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                required
                                rows={4}
                                placeholder="What happened? Be specific."
                                className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none resize-none"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                Prevention Tip
                            </label>
                            <input
                                name="preventionTip"
                                required
                                placeholder="How can others avoid this?"
                                className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none"
                            />
                        </div>

                        <button
                            disabled={createScam.isPending}
                            className="w-full bg-red-500 text-white py-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-400/20 active:scale-[0.98] disabled:opacity-50"
                        >
                            <AlertCircle size={16} />
                            {createScam.isPending ? 'Publishing...' : 'Publish Scam Alert'}
                        </button>
                    </form>
                )}

                {activeTab === 'vibe' && (
                    <form onSubmit={handleVibeSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                Location
                            </label>
                            <select
                                name="spotId"
                                required
                                className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Select a spot...</option>
                                {spots?.map((s: any) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-6">
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1 text-center">
                                Crowd Level (1-5)
                            </label>
                            <div className="flex justify-between gap-4">
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <label key={level} className="flex-1">
                                        <input
                                            type="radio"
                                            name="crowdLevel"
                                            value={level}
                                            required
                                            className="peer hidden"
                                        />
                                        <div className="w-full py-4 text-center rounded-2xl bg-white/5 text-white/40 font-bold cursor-pointer transition-all peer-checked:bg-amber-400 peer-checked:text-black peer-checked:shadow-lg peer-checked:shadow-amber-400/20">
                                            {level}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                Estimated Wait Time (Minutes)
                            </label>
                            <input
                                name="waitTimeMinutes"
                                type="number"
                                defaultValue={0}
                                className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none"
                            />
                        </div>

                        <button
                            disabled={createVibe.isPending}
                            className="w-full bg-amber-400 text-black py-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-amber-300 transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-400/20 active:scale-[0.98] disabled:opacity-50"
                        >
                            <Zap size={16} fill="currentColor" />
                            {createVibe.isPending ? 'Share Live Vibe' : 'Share Live Vibe'}
                        </button>
                    </form>
                )}

                {activeTab === 'spot' && (
                    <form onSubmit={handleSpotSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                Spot Name
                            </label>
                            <input
                                name="name"
                                required
                                placeholder="e.g. Jek Pui Curry"
                                className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                Address
                            </label>
                            <input
                                name="address"
                                required
                                placeholder="e.g. 25 Mangkon Rd, Bangkok"
                                className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                    City
                                </label>
                                <select
                                    name="cityId"
                                    defaultValue={selectedCityId}
                                    required
                                    className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">Select city...</option>
                                    {cities?.map((c: any) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                    Category
                                </label>
                                <select
                                    name="categoryId"
                                    required
                                    className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">Select category...</option>
                                    {categories?.map((c: any) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                    Latitude
                                </label>
                                <input
                                    name="latitude"
                                    type="number"
                                    step="any"
                                    required
                                    placeholder="13.7563"
                                    className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                    Longitude
                                </label>
                                <input
                                    name="longitude"
                                    type="number"
                                    step="any"
                                    required
                                    placeholder="100.5018"
                                    className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                                Hero Image URL (Optional)
                            </label>
                            <input
                                name="imageUrl"
                                placeholder="https://..."
                                className="w-full bg-white/5 border border-white/10 focus:border-amber-400/50 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none"
                            />
                        </div>

                        <button
                            disabled={createSpot.isPending}
                            className="w-full bg-amber-400 text-black py-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-amber-300 transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-400/20 active:scale-[0.98] disabled:opacity-50"
                        >
                            <MapPin size={16} />
                            {createSpot.isPending ? 'Creating...' : 'Create New Spot'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
